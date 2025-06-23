/**
 * Cat Blocks Renderer for Blockly
 * A custom renderer that adds cat features to hat blocks
 * Based on the Zelos renderer
 */

import * as Blockly from "blockly";

/**
 * Custom constants provider that will define cat-specific dimensions and paths
 */
class CatConstantProvider extends Blockly.zelos.ConstantProvider {
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

    // Hat block dimensions (inherited from parent, but can be overridden)
    override readonly START_HAT_HEIGHT = 31;

    // Define block corner radius (for procedure blocks)
    readonly DEFINE_HAT_HEIGHT = 31;

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
        // Build path with ear segments that can be replaced during animation
        const path =
            "c2.6,-2.3 5.5,-4.3 8.5,-6.2" +
            this.LEFT_EAR_UP +
            "c8.4,-1.3 17,-1.3 25.4,0" +
            this.RIGHT_EAR_UP +
            "c3,1.8 5.9,3.9 8.5,6.1";

        return {
            height: this.START_HAT_HEIGHT,
            width: this.START_HAT_WIDTH,
            path: path,
        };
    }

    /**
     * Create the path for the top left corner with cat ears for define blocks
     */
    makeTopLeftCornerDefineHat(): string {
        // Path for procedure/define blocks with cat ears using segments
        return this.DEFINE_HAT_LEFT_EAR_UP + this.DEFINE_HAT_RIGHT_EAR_UP;
    }
}

/**
 * Custom drawer for rendering cat features
 */
class CatDrawer extends Blockly.zelos.Drawer {
    constructor(block: Blockly.BlockSvg, info: Blockly.zelos.RenderInfo) {
        super(block, info);
    }

    /**
     * Draw the outline of the block with cat features
     * @override
     */
    override drawOutline_() {
        // Set the block reference on the path object before drawing
        const pathObject = this.block_.pathObject;
        if (pathObject instanceof CatPathObject) {
            pathObject.setBlock(this.block_);
        }

        super.drawOutline_();

        // console.log("CatDrawer outline drawn");
    }
}

/**
 * Custom path object that manages cat face SVG elements
 */
class CatPathObject extends Blockly.zelos.PathObject {
    // Store reference to the block
    #block: Blockly.BlockSvg | null = null;

    // Cat element references
    readonly #catElements: {
        group: SVGGElement | null;
        face: SVGGElement | null;
        leftEar: SVGPathElement | null;
        rightEar: SVGPathElement | null;
        leftEye: SVGCircleElement | null;
        rightEye: SVGCircleElement | null;
        leftClosedEye: SVGPathElement | null;
        rightClosedEye: SVGPathElement | null;
        mouth: SVGPathElement | null;
    } = {
        group: null,
        face: null,
        leftEar: null,
        rightEar: null,
        leftEye: null,
        rightEye: null,
        leftClosedEye: null,
        rightClosedEye: null,
        mouth: null,
    };

    // Animation timeouts
    #blinkTimeout: number | null = null;
    #earFlickTimeout: number | null = null;
    #mouseTrackingEnabled = false;

    // Store original path for restoration after ear flick
    #originalPath: string | null = null;

    // Mouse tracking properties
    #mouseListener: ((e: MouseEvent) => void) | null = null;
    #lastCallTime = 0;
    #workspacePositionRect: DOMRect | null = null;
    readonly #CALL_FREQUENCY_MS = 60; // Throttle mouse updates to ~16fps for performance

    // Event handler references for cleanup
    #blinkHandler: (() => void) | null = null;
    #leftEarHandler: (() => void) | null = null;
    #rightEarHandler: (() => void) | null = null;

    /**
     * Set the block associated with this path object
     */
    setBlock(block: Blockly.BlockSvg) {
        this.#block = block;
    }

    /**
     * Set the path for the block and update cat elements if needed
     * @override
     */
    override setPath(pathString: string) {
        super.setPath(pathString);

        // Update cat face position based on block type
        if (this.#shouldHaveCatFace()) {
            this.#ensureCatElements();

            // Check if we should restart mouse tracking
            const constants = this.constants as CatConstantProvider;
            if (
                constants.ENABLE_CAT_MOUSE_TRACKING &&
                !this.#mouseTrackingEnabled &&
                this.#shouldWatchMouse()
            ) {
                this.#startMouseTracking();
            }
        } else if (this.#catElements.group) {
            // Remove cat elements if this isn't a hat block
            this.#removeCatElements();
        }
    }

    /**
     * Check if this block should have a cat face (hat blocks only)
     */
    #shouldHaveCatFace(): boolean {
        if (!this.#block) {
            return false;
        }

        // Hat blocks have no output or previous connection
        // In Scratch/Blockly, these are typically event blocks
        const isHatBlock =
            !this.#block.outputConnection && !this.#block.previousConnection;

        return isHatBlock;
    }

    /**
     * Create cat face elements if they don't exist
     */
    #ensureCatElements() {
        if (this.#catElements.group) {
            return;
        }

        // Get positioning constants from the constant provider
        const constants = this.constants as CatConstantProvider;
        const xOffset = constants.CAT_FACE_X_OFFSET;
        const yOffset = constants.CAT_FACE_Y_OFFSET;

        // Create main group for all cat elements
        const catGroup: SVGGElement = Blockly.utils.dom.createSvgElement(
            "g",
            {
                class: "blockly-cat-face",
                // Adjust these values to position the cat face
                transform: `translate(${xOffset}, ${yOffset})`,
            },
            this.svgRoot,
        );

        // Create face group
        const faceGroup: SVGGElement = Blockly.utils.dom.createSvgElement(
            "g",
            {
                fill: "#000000",
            },
            catGroup,
        );

        // Create ears (outside face group, with pink fill)
        // Note: These are the inner pink parts of the ears
        // The outer ear shapes are part of the block's hat path (see makeStartHat())
        const leftEar: SVGPathElement = Blockly.utils.dom.createSvgElement(
            "path",
            {
                d:
                    "M22.4-15.6c-1.7-4.2-4.5-9.1-5.8-8.5" +
                    "c-1.6,0.8-5.4,7.9-5,15.4c0,0.6,0.7,0.7,1.1,0.5c3-1.6,6.4-2.8,8.6-3.6" +
                    "C22.8-12.3,23.2-13.7,22.4-15.6z",
                fill: "#FFD5E6",
            },
            catGroup,
        );

        const rightEar: SVGPathElement = Blockly.utils.dom.createSvgElement(
            "path",
            {
                d:
                    "M73.1-15.6c1.7-4.2,4.5-9.1,5.8-8.5" +
                    "c1.6,0.8,5.4,7.9,5,15.4c0,0.6-0.7,0.7-1.1,0.5c-3-1.6-6.4-2.8-8.6-3.6" +
                    "C72.8-12.3,72.4-13.7,73.1-15.6z",
                fill: "#FFD5E6",
            },
            catGroup,
        );

        // Apply RTL transforms if needed
        // Note: The block's path (including outer ears) is automatically mirrored
        // by Blockly for RTL, so we only need to mirror the inner elements
        if (this.#block?.RTL) {
            leftEar.setAttribute("transform", "scale(-1 1)");
            rightEar.setAttribute("transform", "scale(-1 1)");
            // Set initial face position for RTL
            faceGroup.style.transform = "translate(-87px, 0)";
        }

        // Create eyes (open state)
        const leftEye: SVGCircleElement = Blockly.utils.dom.createSvgElement(
            "circle",
            {
                cx: "29.1",
                cy: "-3.3",
                r: "3.4",
                "fill-opacity": "0.6",
            },
            faceGroup,
        );

        const rightEye: SVGCircleElement = Blockly.utils.dom.createSvgElement(
            "circle",
            {
                cx: "59.2",
                cy: "-3.3",
                r: "3.4",
                "fill-opacity": "0.6",
            },
            faceGroup,
        );

        // Create closed eyes (for blinking) - initially hidden
        const leftClosedEye: SVGPathElement =
            Blockly.utils.dom.createSvgElement(
                "path",
                {
                    d:
                        "M25.2-1.1c0.1,0,0.2,0,0.2,0l8.3-2.1l-7-4.8" +
                        "c-0.5-0.3-1.1-0.2-1.4,0.3s-0.2,1.1,0.3,1.4L29-4.1l-4,1" +
                        "c-0.5,0.1-0.9,0.7-0.7,1.2C24.3-1.4,24.7-1.1,25.2-1.1z",
                    "fill-opacity": "0",
                },
                faceGroup,
            );

        const rightClosedEye: SVGPathElement =
            Blockly.utils.dom.createSvgElement(
                "path",
                {
                    d:
                        "M62.4-1.1c-0.1,0-0.2,0-0.2,0l-8.3-2.1l7-4.8" +
                        "c0.5-0.3,1.1-0.2,1.4,0.3s0.2,1.1-0.3,1.4l-3.4,2.3l4,1" +
                        "c0.5,0.1,0.9,0.7,0.7,1.2C63.2-1.4,62.8-1.1,62.4-1.1z",
                    "fill-opacity": "0",
                },
                faceGroup,
            );

        // Create mouth
        const mouth: SVGPathElement = Blockly.utils.dom.createSvgElement(
            "path",
            {
                d:
                    "M45.6,0.1c-0.9,0-1.7-0.3-2.3-0.9" +
                    "c-0.6,0.6-1.3,0.9-2.2,0.9c-0.9,0-1.8-0.3-2.3-0.9c-1-1.1-1.1-2.6-1.1-2.8" +
                    "c0-0.5,0.5-1,1-1l0,0c0.6,0,1,0.5,1,1c0,0.4,0.1,1.7,1.4,1.7" +
                    "c0.5,0,0.7-0.2,0.8-0.3c0.3-0.3,0.4-1,0.4-1.3c0-0.1,0-0.1,0-0.2" +
                    "c0-0.5,0.5-1,1-1l0,0c0.5,0,1,0.4,1,1c0,0,0,0.1,0,0.2" +
                    "c0,0.3,0.1,0.9,0.4,1.2C44.8-2.2,45-2,45.5-2s0.7-0.2,0.8-0.3" +
                    "c0.3-0.4,0.4-1.1,0.3-1.3c0-0.5,0.4-1,0.9-1.1c0.5,0,1,0.4,1.1,0.9" +
                    "c0,0.2,0.1,1.8-0.8,2.8C47.5-0.4,46.8,0.1,45.6,0.1z",
                "fill-opacity": "0.6",
            },
            faceGroup,
        );

        // Store references
        this.#catElements.group = catGroup;
        this.#catElements.face = faceGroup;
        this.#catElements.leftEar = leftEar;
        this.#catElements.rightEar = rightEar;
        this.#catElements.leftEye = leftEye;
        this.#catElements.rightEye = rightEye;
        this.#catElements.leftClosedEye = leftClosedEye;
        this.#catElements.rightClosedEye = rightClosedEye;
        this.#catElements.mouth = mouth;

        // Set up event handlers for interactions
        this.#setupCatInteractions();

        // Start mouse tracking if enabled
        if (constants.ENABLE_CAT_MOUSE_TRACKING && this.#shouldWatchMouse()) {
            this.#startMouseTracking();
        }
    }

    /**
     * Set up mouse event handlers for cat interactions
     */
    #setupCatInteractions() {
        if (!this.#catElements.group) {
            return;
        }

        // Create bound handlers
        this.#blinkHandler = () => this.#blink();
        this.#leftEarHandler = () => this.#flickEar("left");
        this.#rightEarHandler = () => this.#flickEar("right");

        // Hover over face triggers blink
        this.#catElements.face?.addEventListener(
            "mouseenter",
            this.#blinkHandler,
        );

        // Hover over ears triggers ear flick
        // Note: In RTL mode, the ears are visually swapped due to mirroring
        if (this.#block?.RTL) {
            // Swap handlers for RTL
            this.#catElements.leftEar?.addEventListener(
                "mouseenter",
                this.#rightEarHandler,
            );
            this.#catElements.rightEar?.addEventListener(
                "mouseenter",
                this.#leftEarHandler,
            );
        } else {
            // Normal LTR handlers
            this.#catElements.leftEar?.addEventListener(
                "mouseenter",
                this.#leftEarHandler,
            );
            this.#catElements.rightEar?.addEventListener(
                "mouseenter",
                this.#rightEarHandler,
            );
        }
    }

    /**
     * Remove all cat elements from the block
     */
    #removeCatElements() {
        if (this.#catElements.group) {
            // Stop mouse tracking first
            if (this.#mouseTrackingEnabled) {
                this.#stopMouseTracking();
            }

            // Remove event listeners before removing elements
            if (this.#blinkHandler && this.#catElements.face) {
                this.#catElements.face.removeEventListener(
                    "mouseenter",
                    this.#blinkHandler,
                );
            }

            // Remove ear handlers (accounting for RTL swap)
            if (this.#leftEarHandler && this.#catElements.leftEar) {
                // In RTL, left ear has right handler
                const handler = this.#block?.RTL
                    ? this.#rightEarHandler
                    : this.#leftEarHandler;
                if (handler) {
                    this.#catElements.leftEar.removeEventListener(
                        "mouseenter",
                        handler,
                    );
                }
            }
            if (this.#rightEarHandler && this.#catElements.rightEar) {
                // In RTL, right ear has left handler
                const handler = this.#block?.RTL
                    ? this.#leftEarHandler
                    : this.#rightEarHandler;
                if (handler) {
                    this.#catElements.rightEar.removeEventListener(
                        "mouseenter",
                        handler,
                    );
                }
            }

            this.#catElements.group.remove();
            // Reset all references
            this.#catElements.group = null;
            this.#catElements.face = null;
            this.#catElements.leftEar = null;
            this.#catElements.rightEar = null;
            this.#catElements.leftEye = null;
            this.#catElements.rightEye = null;
            this.#catElements.leftClosedEye = null;
            this.#catElements.rightClosedEye = null;
            this.#catElements.mouth = null;

            // Clear handler references
            this.#blinkHandler = null;
            this.#leftEarHandler = null;
            this.#rightEarHandler = null;
        }
    }

    /**
     * Apply colour to the block and cat elements
     * @override
     */
    override applyColour(block: Blockly.BlockSvg) {
        super.applyColour(block);

        // Store block reference if we don't have it
        if (!this.#block) {
            this.#block = block;
        }

        // Check if we need cat elements when colors are applied
        if (this.#shouldHaveCatFace() && !this.#catElements.group) {
            // console.log("Adding cat face during color application");
            this.#ensureCatElements();
        }
    }

    /**
     * Update the block's highlights and cat element highlights
     * @override
     */
    override updateHighlighted(highlighted: boolean) {
        super.updateHighlighted(highlighted);

        // When block is highlighted (glowing), disable mouse tracking for performance
        const constants = this.constants as CatConstantProvider;
        if (constants.ENABLE_CAT_MOUSE_TRACKING && this.#catElements.face) {
            if (highlighted) {
                // Stop tracking when glowing
                if (this.#mouseTrackingEnabled) {
                    this.#stopMouseTracking();
                }
            } else {
                // Resume tracking when not glowing
                if (this.#shouldWatchMouse()) {
                    this.#startMouseTracking();
                }
            }
        }

        // console.log(`Cat elements highlighted: ${highlighted}`);
    }

    /**
     * Clean up cat elements and animations
     * Note: PathObject doesn't have a dispose method, so we need to call this
     * from elsewhere in the block lifecycle
     */
    cleanUp() {
        // Clean up any animations
        if (this.#blinkTimeout) {
            clearTimeout(this.#blinkTimeout);
        }
        if (this.#earFlickTimeout) {
            clearTimeout(this.#earFlickTimeout);
            // Restore original path if we were in the middle of an ear flick
            if (this.#originalPath && this.svgPath) {
                this.svgPath.setAttribute("d", this.#originalPath);
                this.#originalPath = null;
            }
        }

        // Stop mouse tracking
        this.#stopMouseTracking();

        // Remove cat elements
        this.#removeCatElements();

        // Clear the original path reference
        this.#originalPath = null;

        console.log("CatPathObject cleaned up");
    }

    /**
     * Trigger a blink animation
     */
    #blink() {
        if (
            !this.#catElements.leftEye ||
            !this.#catElements.rightEye ||
            !this.#catElements.leftClosedEye ||
            !this.#catElements.rightClosedEye
        ) {
            return;
        }

        // Clear any existing blink timeout
        if (this.#blinkTimeout) {
            clearTimeout(this.#blinkTimeout);
        }

        // Close eyes
        this.#catElements.leftEye.setAttribute("fill-opacity", "0");
        this.#catElements.rightEye.setAttribute("fill-opacity", "0");
        this.#catElements.leftClosedEye.setAttribute("fill-opacity", "0.6");
        this.#catElements.rightClosedEye.setAttribute("fill-opacity", "0.6");

        // Open eyes after 100ms
        this.#blinkTimeout = window.setTimeout(() => {
            if (
                this.#catElements.leftEye &&
                this.#catElements.rightEye &&
                this.#catElements.leftClosedEye &&
                this.#catElements.rightClosedEye
            ) {
                this.#catElements.leftEye.setAttribute("fill-opacity", "0.6");
                this.#catElements.rightEye.setAttribute("fill-opacity", "0.6");
                this.#catElements.leftClosedEye.setAttribute(
                    "fill-opacity",
                    "0",
                );
                this.#catElements.rightClosedEye.setAttribute(
                    "fill-opacity",
                    "0",
                );
            }
            this.#blinkTimeout = null;
        }, 100);
    }

    /**
     * Trigger an ear flick animation by modifying the block's path
     *
     * This works by:
     * 1. Finding the ear segment in the block's SVG path
     * 2. Replacing it with the "ear down" version
     * 3. Restoring the original path after 50ms
     *
     * The ear segments are defined in CatConstantProvider and embedded
     * in the hat path by makeStartHat()
     */
    #flickEar(ear: "left" | "right") {
        const earElement =
            ear === "left"
                ? this.#catElements.leftEar
                : this.#catElements.rightEar;
        if (!earElement || !this.#block) {
            return;
        }

        // Clear any existing ear flick timeout
        if (this.#earFlickTimeout) {
            clearTimeout(this.#earFlickTimeout);
            // Restore the original path if we had one
            if (this.#originalPath && this.svgPath) {
                this.svgPath.setAttribute("d", this.#originalPath);
                this.#originalPath = null;
            }
        }

        // Get the current block path
        const pathElement = this.svgPath;
        if (!pathElement) {
            return;
        }

        const currentPath = pathElement.getAttribute("d");
        if (!currentPath) {
            return;
        }

        // Store the original path for restoration
        this.#originalPath = currentPath;

        // Get the ear path segments from constants
        const constants = this.constants as CatConstantProvider;
        let newPath = currentPath;

        // Replace the appropriate ear segment
        if (ear === "left") {
            // Try regular hat first
            if (currentPath.includes(constants.LEFT_EAR_UP)) {
                newPath = currentPath.replace(
                    constants.LEFT_EAR_UP,
                    constants.LEFT_EAR_DOWN,
                );
            } else if (currentPath.includes(constants.DEFINE_HAT_LEFT_EAR_UP)) {
                // Try define hat
                newPath = currentPath.replace(
                    constants.DEFINE_HAT_LEFT_EAR_UP,
                    constants.DEFINE_HAT_LEFT_EAR_DOWN,
                );
            } else if (currentPath.includes(constants.LEFT_EAR_DOWN)) {
                // Already flicked, restore
                newPath = currentPath.replace(
                    constants.LEFT_EAR_DOWN,
                    constants.LEFT_EAR_UP,
                );
            }
        } else {
            // Right ear
            if (currentPath.includes(constants.RIGHT_EAR_UP)) {
                newPath = currentPath.replace(
                    constants.RIGHT_EAR_UP,
                    constants.RIGHT_EAR_DOWN,
                );
            } else if (
                currentPath.includes(constants.DEFINE_HAT_RIGHT_EAR_UP)
            ) {
                // Try define hat
                newPath = currentPath.replace(
                    constants.DEFINE_HAT_RIGHT_EAR_UP,
                    constants.DEFINE_HAT_RIGHT_EAR_DOWN,
                );
            } else if (currentPath.includes(constants.RIGHT_EAR_DOWN)) {
                // Already flicked, restore
                newPath = currentPath.replace(
                    constants.RIGHT_EAR_DOWN,
                    constants.RIGHT_EAR_UP,
                );
            }
        }

        // Apply the new path
        if (newPath !== currentPath) {
            pathElement.setAttribute("d", newPath);

            // Hide the pink inner ear during flick
            earElement.setAttribute("fill-opacity", "0");

            // Restore after 50ms
            this.#earFlickTimeout = window.setTimeout(() => {
                // Restore the original path
                if (this.#originalPath && pathElement) {
                    pathElement.setAttribute("d", this.#originalPath);
                    this.#originalPath = null;
                }
                // Show the pink inner ear again
                if (earElement) {
                    earElement.setAttribute("fill-opacity", "1");
                }
                this.#earFlickTimeout = null;
            }, 50);
        }
    }

    /**
     * Check if mouse tracking should be enabled for this block
     */
    #shouldWatchMouse(): boolean {
        if (!this.#block || !this.#catElements.face) {
            return false;
        }

        // Don't track if block is being dragged or glowing
        // if (this.#block.isDragging() || (this.#block as any).isGlowingStack_) {
        //     return false;
        // }

        // Check if block is visible on screen (rough check)
        const xy = this.#getCatFacePosition();
        const MARGIN = 50;
        const workspace = this.#block.workspace;
        const scale = workspace.scale;

        const blockXOnScreen =
            xy.x > -MARGIN && xy.x - MARGIN < window.innerWidth / scale;
        const blockYOnScreen =
            xy.y > -MARGIN && xy.y - MARGIN < window.innerHeight / scale;

        return blockXOnScreen && blockYOnScreen;
    }

    /**
     * Get the position of the cat face in workspace coordinates
     */
    #getCatFacePosition(): { x: number; y: number } {
        if (!this.#block) {
            return { x: 0, y: 0 };
        }

        const workspace = this.#block.workspace;

        // Cache workspace position for performance
        if (!this.#workspacePositionRect) {
            const svg = workspace.getParentSvg();
            if (svg) {
                this.#workspacePositionRect = svg.getBoundingClientRect();
            }
        }

        const offset = this.#workspacePositionRect
            ? {
                  x: this.#workspacePositionRect.x,
                  y: this.#workspacePositionRect.y,
              }
            : { x: 0, y: 0 };

        // Account for flyout if present
        let flyoutOffset = 0;
        const flyout = workspace.getFlyout?.();
        if (!this.#block.isInFlyout && flyout) {
            flyoutOffset = flyout.getWidth() || 0;
        }

        // Get block position
        const blockXY = this.#block.getRelativeToSurfaceXY();
        let x = blockXY.x;
        let y = blockXY.y;

        // Convert to workspace coordinates
        x += (offset.x + flyoutOffset + workspace.scrollX) / workspace.scale;
        y += (offset.y + workspace.scrollY) / workspace.scale;

        // Adjust for cat face center (approximate)
        const constants = this.constants as CatConstantProvider;
        x += constants.CAT_FACE_X_OFFSET + 44; // 44 is roughly center of face
        y += constants.CAT_FACE_Y_OFFSET - 3; // -3 is roughly eye level

        // Handle RTL
        if (this.#block.RTL) {
            x = window.innerWidth - x;
        }

        return { x, y };
    }

    /**
     * Start tracking mouse movement for eye following
     */
    #startMouseTracking() {
        if (this.#mouseTrackingEnabled) {
            return;
        }

        this.#mouseTrackingEnabled = true;

        // Clear cached workspace position to get fresh coordinates
        this.#workspacePositionRect = null;

        // Create mouse move handler
        this.#mouseListener = (event: MouseEvent) => {
            // Throttle updates
            const now = Date.now();
            if (now < this.#lastCallTime + this.#CALL_FREQUENCY_MS) {
                return;
            }
            this.#lastCallTime = now;

            if (
                !this.#shouldWatchMouse() ||
                !this.#catElements.face ||
                !this.#block
            ) {
                return;
            }

            const workspace = this.#block.workspace;
            const scale = workspace.scale;

            // Get cat face position
            const catPos = this.#getCatFacePosition();

            // Get mouse position in workspace coordinates
            const mouseX = event.clientX / scale;
            const mouseY = event.clientY / scale;

            // Calculate vector from cat to mouse
            const dx = mouseX - catPos.x;
            const dy = mouseY - catPos.y;
            const theta = Math.atan2(dx, dy);

            // Map to shorter vector (eyes can only move a little bit)
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scaleFactor = distance / (distance + 1);

            // Use ellipse for eye movement bounds
            const a = 2; // horizontal radius
            const b = 5; // vertical radius
            const r =
                (a * b) /
                Math.sqrt(
                    Math.pow(b * Math.cos(theta), 2) +
                        Math.pow(a * Math.sin(theta), 2),
                );

            // Calculate final eye offset
            let eyeDx = r * scaleFactor * Math.sin(theta);
            let eyeDy = r * scaleFactor * Math.cos(theta);

            // Apply bounds checking
            eyeDx = Math.max(-5, Math.min(5, eyeDx));
            eyeDy = Math.max(-7, Math.min(7, eyeDy));

            // Apply RTL adjustment
            if (this.#block.RTL) {
                eyeDx -= 87;
            }

            // Apply transform to face group
            this.#catElements.face.style.transform = `translate(${eyeDx}px, ${eyeDy}px)`;
        };

        // Add listener
        document.addEventListener("mousemove", this.#mouseListener);

        // console.log("Mouse tracking started");
    }

    /**
     * Stop tracking mouse movement
     */
    #stopMouseTracking() {
        this.#mouseTrackingEnabled = false;

        if (this.#mouseListener) {
            document.removeEventListener("mousemove", this.#mouseListener);
            this.#mouseListener = null;
        }

        // Reset face position
        if (this.#catElements.face) {
            if (this.#block?.RTL) {
                this.#catElements.face.style.transform = "translate(-87px, 0)";
            } else {
                this.#catElements.face.style.transform = "";
            }
        }

        // Clear cached workspace position
        this.#workspacePositionRect = null;

        // console.log("Mouse tracking stopped");
    }
}

/**
 * The main Cat renderer class that ties everything together
 */
export class CatRenderer extends Blockly.zelos.Renderer {
    protected override makeConstants_() {
        void this;
        return new CatConstantProvider();
    }

    protected override makeDrawer_(
        block: Blockly.BlockSvg,
        info: Blockly.blockRendering.RenderInfo,
    ) {
        void this;
        return new CatDrawer(block, info as Blockly.zelos.RenderInfo);
    }

    /**
     * Create and return a CatPathObject
     * @override
     */
    override makePathObject(
        root: SVGElement,
        style: Blockly.Theme.BlockStyle,
    ): CatPathObject {
        return new CatPathObject(root, style, this.getConstants());
    }
}
