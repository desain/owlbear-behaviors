import * as Blockly from "blockly";
import { INPUT_CUSTOM_BLOCK } from "../../constants";
import { isDefineBlock } from "../procedures/blockDefine";

/**
 * Custom constant provider that adds define hat constants and cat paths
 */

export class ConstantProvider extends Blockly.zelos.ConstantProvider {
    static assertInstance(
        constants: Blockly.blockRendering.ConstantProvider,
    ): asserts constants is ConstantProvider {
        if (!(constants instanceof ConstantProvider)) {
            throw Error("constants should be behaviors constants");
        }
    }

    #cat = false;

    constructor(gridUnit?: number) {
        super(gridUnit);
    }

    override setDynamicProperties_ = (theme: Blockly.Theme): void => {
        super.setDynamicProperties_(theme);
        this.#cat = theme.name.includes("cat");
    };

    /** Corner radius of the hat on the define block */
    readonly DEFINE_HAT_CORNER_RADIUS = 31;

    /**
     * Create the SVG paths for the define hat corners
     * ref https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/core/block_render_svg_vertical.js#L479
     */
    readonly DEFINE_HAT_TOP_LEFT_CORNER =
        `a ${this.DEFINE_HAT_CORNER_RADIUS},${this.DEFINE_HAT_CORNER_RADIUS} ` +
        `0 0,1 ${this.DEFINE_HAT_CORNER_RADIUS},-${this.DEFINE_HAT_CORNER_RADIUS}`;
    readonly DEFINE_HAT_TOP_RIGHT_CORNER =
        `a ${this.DEFINE_HAT_CORNER_RADIUS},${this.DEFINE_HAT_CORNER_RADIUS} ` +
        `0 0,1 ${this.DEFINE_HAT_CORNER_RADIUS},${this.DEFINE_HAT_CORNER_RADIUS}`;

    /**
     * Fake notch that is rendered in front of inline statement inputs.
     */
    readonly INLINE_FAKE_NOTCH: Blockly.blockRendering.Notch = {
        type: 6, // first unused shape from parent
        width: 12,
        height: 0,
        // fake notch has no paths
        pathLeft: "",
        pathRight: "",
    };

    override shapeFor(connection: Blockly.RenderedConnection) {
        if (
            isDefineBlock(connection.sourceBlock_) &&
            connection.getParentInput()?.name === INPUT_CUSTOM_BLOCK
        ) {
            return this.INLINE_FAKE_NOTCH;
        } else {
            return super.shapeFor(connection);
        }
    }

    // cat stuff

    isCat() {
        return this.#cat;
    }

    readonly CAT_FACE_X_OFFSET = 0;
    readonly CAT_FACE_Y_OFFSET = 32; // positive moves down

    // Regular hat block ears
    readonly LEFT_EAR_UP =
        "c-1,-12.5 5.3,-23.3 8.4,-24.8c3.7,-1.8 16.5,13.1 18.4,15.4";
    readonly LEFT_EAR_DOWN =
        "c-5.8,-4.8 -8,-18 -4.9,-19.5c3.7,-1.8 24.5,11.1 31.7,10.1";
    readonly RIGHT_EAR_UP =
        "c1.9,-2.3 14.7,-17.2 18.4,-15.4c3.1,1.5 9.4,12.3 8.4,24.8";
    readonly RIGHT_EAR_DOWN =
        "c7.2,1 28,-11.9 31.7,-10.1c3.1,1.5 0.9,14.7 -4.9,19.5";

    // Define/procedure block ears
    readonly DEFINE_HAT_LEFT_EAR_UP =
        "c0,-7.1 3.7,-13.3 9.3,-16.9c1.7,-7.5 5.4,-13.2 7.6,-14.2c2.6,-1.3 10,6 14.6,11.1";
    readonly DEFINE_HAT_LEFT_EAR_DOWN =
        "c0,-4.6 1.6,-8.9 4.3,-12.3c-2.4,-5.6 -2.9,-12.4 -0.7,-13.4c2.1,-1 9.6,2.6 17,5.8c2.6,0 6.2,0 10.9,0";
    readonly DEFINE_HAT_RIGHT_EAR_UP =
        "h33c4.6,-5.1 11.9,-12.4 14.6,-11.1c1.9,0.9 4.9,5.2 6.8,11.1c2.6,0,5.2,0,7.8,0";
    readonly DEFINE_HAT_RIGHT_EAR_DOWN =
        "c0,0 25.6,0 44,0c7.4,-3.2 14.8,-6.8 16.9,-5.8c1.2,0.6 1.6,2.9 1.3,5.8";

    // whether to have the cat watch the mouse pointer
    readonly ENABLE_CAT_MOUSE_TRACKING = false;

    /**
     * Return the hat shape for start hats (event blocks) with cat ears
     * @override
     */
    override makeStartHat(): {
        height: number;
        width: number;
        path: string;
    } {
        if (this.isCat()) {
            // Build path with ear segments that can be replaced during animation
            const path =
                "c2.6,-2.3 5.5,-4.3 8.5,-6.2" +
                this.LEFT_EAR_UP +
                "c8.4,-1.3 17,-1.3 25.4,0" +
                this.RIGHT_EAR_UP +
                "c3,1.8 5.9,3.9 8.5,6.1";

            return {
                height: 31, // this.START_HAT_HEIGHT,
                width: this.START_HAT_WIDTH,
                path: path,
            };
        } else {
            return super.makeStartHat();
        }
    }
}
