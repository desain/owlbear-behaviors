import OBR, { type Image } from "@owlbear-rodeo/sdk";
import * as Blockly from "blockly";
import { isImageBuildParams, type ImageBuildParams } from "owlbear-utils";

interface ImageData extends ImageBuildParams {
    imageName: string;
}
function isImageData(data: unknown): data is ImageData {
    return (
        isImageBuildParams(data) &&
        "imageName" in data &&
        typeof data.imageName === "string"
    );
}

const DEFAULT_IMAGE_DATA = {
    image: {
        width: 150,
        height: 150,
        mime: "image/png",
        url: window.location.origin + "/default.png",
    },
    grid: {
        dpi: 150,
        offset: {
            x: 0,
            y: 0,
        },
    },
    imageName: "Click to change",
} satisfies ImageData;

const IMG_SIZE = 30;
const IMG_TEXT_SEP_PX = 10;

export class FieldTokenImage extends Blockly.Field<ImageData> {
    static valueFromImage = (image: Image): ImageData => ({
        image: image.image,
        grid: image.grid,
        imageName: image.text.plainText || image.name,
    });
    static readonly TYPE = "field_token_image";
    static readonly #GROUP_CLASS = "fieldTokenImage";
    static readonly #TEXT_CLASS = "fieldTokenImageText";
    static readonly CSS = `
        .blocklyEditableField.${FieldTokenImage.#GROUP_CLASS} {
            cursor: pointer;
            .blocklyText.${FieldTokenImage.#TEXT_CLASS} {
                fill: white;
            }
            &:hover {
                .blocklyText.${FieldTokenImage.#TEXT_CLASS} {
                    text-decoration: underline;
                }
            }
       }
    `;

    #img?: HTMLImageElement;

    static override fromJson = (options: Blockly.FieldConfig) => {
        void options;
        // const optsParsed =
        //     Blockly.utils.parsing.replaceMessageReferences(options);
        return new this(DEFAULT_IMAGE_DATA, null);
    };

    constructor(
        value: ImageData | typeof Blockly.Field.SKIP_SETUP,
        validator: Blockly.FieldValidator<ImageData> | null,
        config?: Blockly.FieldConfig,
    ) {
        super(value, validator, config);
        this.SERIALIZABLE = true;
    }

    // Initialize DOM elements
    override initView() {
        if (this.fieldGroup_) {
            Blockly.utils.dom.addClass(
                this.fieldGroup_,
                FieldTokenImage.#GROUP_CLASS,
            );
        }

        // Image container (foreign object for HTML img)
        const foreignObject = Blockly.utils.dom.createSvgElement(
            Blockly.utils.Svg.FOREIGNOBJECT,
            {
                x: 0,
                y: 0,
                width: IMG_SIZE,
                height: IMG_SIZE,
            },
            this.fieldGroup_,
        );

        // HTML image element
        this.#img = document.createElement("img");
        this.#img.style.width = "100%";
        this.#img.style.height = "100%";
        this.#img.style.objectFit = "cover";
        this.#img.style.borderRadius = "4px";
        this.#img.style.display = "block";
        foreignObject.appendChild(this.#img);

        // Text label next to image
        this.createTextElement_();
        if (this.textElement_) {
            Blockly.utils.dom.addClass(
                this.textElement_,
                "fieldTokenImageText",
            );

            // this.textElement_.addEventListener('mouseenter', function() {
            //     this.
            // });
        }
    }

    // Update visual display
    protected override render_(): void {
        if (!this.#img || !this.textElement_ || !this.value_) {
            console.warn("missing porps");
            return;
        }

        this.#img.src = this.value_.image.url;
        this.textElement_.textContent = this.value_.imageName;
        this.updateSize_();
    }

    protected override updateSize_(margin?: number): void {
        margin = margin ?? 0;
        if (this.#img) {
            const imageWidth = this.#img.width;
            const textWidth = Blockly.utils.dom.getTextWidth(
                this.getTextElement(),
            );
            this.size_.width =
                imageWidth + IMG_TEXT_SEP_PX + textWidth + margin * 2;
            this.size_.height = Math.max(
                IMG_SIZE,
                this.getConstants()?.FIELD_TEXT_HEIGHT ?? 0,
            );

            this.positionTextElement_(
                margin + imageWidth + IMG_TEXT_SEP_PX,
                textWidth,
            );
        }
    }

    // Handle clicks - open asset picker
    override showEditor_() {
        void OBR.assets
            .downloadImages(false, undefined, "CHARACTER")
            .then((images) => {
                const image = images[0];
                if (image) {
                    // Store all necessary data
                    this.setValue({
                        image: image.image,
                        grid: image.grid,
                        imageName: image.text.plainText || image.name,
                    } satisfies typeof this.value_);

                    // this.#updateDisplay();
                }
            });
    }

    // Serialization
    // eslint-disable-next-line class-methods-use-this
    override doClassValidation_ = (newValue: unknown) => {
        if (isImageData(newValue)) {
            return newValue;
        } else {
            return null;
        }
    };

    // For text representation in code
    override getText_ = () => this.getValue()?.imageName ?? "[no image set]";
}

export function registerFieldTokenImage() {
    Blockly.fieldRegistry.register(FieldTokenImage.TYPE, FieldTokenImage);
    Blockly.Css.register(FieldTokenImage.CSS);
}
