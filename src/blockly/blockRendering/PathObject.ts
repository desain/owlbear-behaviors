import * as Blockly from "blockly";
import { BLOCK_TYPE_ARGUMENT_REPORTER } from "../procedures/blockArgumentReporter";
import { ConstantProvider } from "./ConstantProvider";

export class PathObject extends Blockly.zelos.PathObject {
    static assertInstance(
        pathObject: Blockly.blockRendering.IPathObject,
    ): asserts pathObject is PathObject {
        if (!(pathObject instanceof PathObject)) {
            throw Error("path object should be behavior path object");
        }
    }

    // #block?: Blockly.BlockSvg;

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
    // #mouseTrackingEnabled = false;

    // Store original path for restoration after ear flick
    #originalPath: string | null = null;

    // Mouse tracking properties
    // #mouseListener: ((e: MouseEvent) => void) | null = null;
    // #lastCallTime = 0;
    // #workspacePositionRect: DOMRect | null = null;
    // readonly #CALL_FREQUENCY_MS = 60; // Throttle mouse updates to ~16fps for performance

    // Event handler references for cleanup
    #blinkHandler: (() => void) | null = null;
    #leftEarHandler: (() => void) | null = null;
    #rightEarHandler: (() => void) | null = null;

    /**
     * Make shadow argument reporters not display as shadows.
     */
    protected override updateShadow_(shadow: boolean): void {
        if (
            shadow &&
            this.svgRoot.classList.contains(BLOCK_TYPE_ARGUMENT_REPORTER)
        ) {
            super.updateShadow_(false);
        } else {
            super.updateShadow_(shadow);
        }
    }

    /**
     * Create cat face elements if they don't exist
     */
    ensureCatElements(/* block: Blockly.BlockSvg */) {
        // this.#block = block;

        if (this.#catElements.group) {
            return;
        }

        ConstantProvider.assertInstance(this.constants);

        // Get positioning constants from the constant provider
        const xOffset = this.constants.CAT_FACE_X_OFFSET;
        const yOffset = this.constants.CAT_FACE_Y_OFFSET;

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

        // // Start mouse tracking if enabled
        // if (
        //     this.constants.ENABLE_CAT_MOUSE_TRACKING &&
        //     this.#shouldWatchMouse()
        // ) {
        //     this.#startMouseTracking();
        // }
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
        this.#catElements.leftEar?.addEventListener(
            "mouseenter",
            this.#leftEarHandler,
        );
        this.#catElements.rightEar?.addEventListener(
            "mouseenter",
            this.#rightEarHandler,
        );
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
        ConstantProvider.assertInstance(this.constants);

        const earElement =
            ear === "left"
                ? this.#catElements.leftEar
                : this.#catElements.rightEar;
        if (!earElement) {
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
        let newPath = currentPath;

        // Replace the appropriate ear segment
        if (ear === "left") {
            // Try regular hat first
            if (currentPath.includes(this.constants.LEFT_EAR_UP)) {
                newPath = currentPath.replace(
                    this.constants.LEFT_EAR_UP,
                    this.constants.LEFT_EAR_DOWN,
                );
            } else if (
                currentPath.includes(this.constants.DEFINE_HAT_LEFT_EAR_UP)
            ) {
                // Try define hat
                newPath = currentPath.replace(
                    this.constants.DEFINE_HAT_LEFT_EAR_UP,
                    this.constants.DEFINE_HAT_LEFT_EAR_DOWN,
                );
            }
        } else {
            // Right ear
            if (currentPath.includes(this.constants.RIGHT_EAR_UP)) {
                newPath = currentPath.replace(
                    this.constants.RIGHT_EAR_UP,
                    this.constants.RIGHT_EAR_DOWN,
                );
            } else if (
                currentPath.includes(this.constants.DEFINE_HAT_RIGHT_EAR_UP)
            ) {
                // Try define hat
                newPath = currentPath.replace(
                    this.constants.DEFINE_HAT_RIGHT_EAR_UP,
                    this.constants.DEFINE_HAT_RIGHT_EAR_DOWN,
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

    override flipRTL(): void {
        super.flipRTL();
        this.#catElements.leftEar?.setAttribute("transform", "scale(-1 1)");
        this.#catElements.rightEar?.setAttribute("transform", "scale(-1 1)");
        if (this.#catElements.face) {
            this.#catElements.face.style.transform = "translate(-87px, 0)";
        }

        // Note: In RTL mode, the ears are visually swapped due to mirroring
        if (this.#leftEarHandler && this.#rightEarHandler) {
            this.#catElements.leftEar?.removeEventListener(
                "mouseenter",
                this.#leftEarHandler,
            );
            this.#catElements.rightEar?.removeEventListener(
                "mouseenter",
                this.#rightEarHandler,
            );
            // Swap handlers for RTL
            this.#catElements.leftEar?.addEventListener(
                "mouseenter",
                this.#rightEarHandler,
            );
            this.#catElements.rightEar?.addEventListener(
                "mouseenter",
                this.#leftEarHandler,
            );
        }
    }

    // override updateHighlighted(highlighted: boolean) {
    //     super.updateHighlighted(highlighted);

    //     ConstantProvider.assertInstance(this.constants);

    //     // When block is highlighted (glowing), disable mouse tracking for performance
    //     if (
    //         this.constants.ENABLE_CAT_MOUSE_TRACKING &&
    //         this.#catElements.face
    //     ) {
    //         if (highlighted) {
    //             // Stop tracking when glowing
    //             if (this.#mouseTrackingEnabled) {
    //                 this.#stopMouseTracking();
    //             }
    //         } else {
    //             // Resume tracking when not glowing
    //             if (this.#shouldWatchMouse()) {
    //                 this.#startMouseTracking();
    //             }
    //         }
    //     }
    // }

    // /**
    //  * Clean up cat elements and animations
    //  * Note: PathObject doesn't have a dispose method, so we need to call this
    //  * from elsewhere in the block lifecycle
    //  */
    // cleanUp() {
    //     // Clean up any animations
    //     if (this.#blinkTimeout) {
    //         clearTimeout(this.#blinkTimeout);
    //     }
    //     if (this.#earFlickTimeout) {
    //         clearTimeout(this.#earFlickTimeout);
    //         // Restore original path if we were in the middle of an ear flick
    //         if (this.#originalPath && this.svgPath) {
    //             this.svgPath.setAttribute("d", this.#originalPath);
    //             this.#originalPath = null;
    //         }
    //     }

    //     // Stop mouse tracking
    //     this.#stopMouseTracking();

    //     // Remove cat elements
    //     this.#removeCatElements();

    //     // Clear the original path reference
    //     this.#originalPath = null;

    //     console.log("CatPathObject cleaned up");
    // }

    // /**
    //  * Check if mouse tracking should be enabled for this block
    //  */
    // #shouldWatchMouse(): boolean {
    //     if (!this.#catElements.face) {
    //         return false;
    //     }

    //     // Don't track if block is being dragged or glowing
    //     // if (this.#block.isDragging() || (this.#block as any).isGlowingStack_) {
    //     //     return false;
    //     // }

    //     // Check if block is visible on screen (rough check)
    //     const xy = this.#getCatFacePosition();
    //     const MARGIN = 50;

    //     const scale = this.#block?.workspace?.scale ?? 1;

    //     const blockXOnScreen =
    //         xy.x > -MARGIN && xy.x - MARGIN < window.innerWidth / scale;
    //     const blockYOnScreen =
    //         xy.y > -MARGIN && xy.y - MARGIN < window.innerHeight / scale;

    //     return blockXOnScreen && blockYOnScreen;
    // }

    // /**
    //  * Get the position of the cat face in workspace coordinates
    //  */
    // #getCatFacePosition(): Vector2 {
    //     ConstantProvider.assertInstance(this.constants);

    //     if (!this.#block) {
    //         return ORIGIN;
    //     }

    //     // Cache workspace position for performance
    //     if (!this.#workspacePositionRect) {
    //         const svg = this.#block.workspace.getParentSvg();
    //         if (svg) {
    //             this.#workspacePositionRect = svg.getBoundingClientRect();
    //         }
    //     }

    //     const offset = this.#workspacePositionRect
    //         ? {
    //               x: this.#workspacePositionRect.x,
    //               y: this.#workspacePositionRect.y,
    //           }
    //         : { x: 0, y: 0 };

    //     // Account for flyout if present
    //     let flyoutOffset = 0;
    //     const flyout = this.#block.workspace.getFlyout?.();
    //     if (!this.#block.isInFlyout && flyout) {
    //         flyoutOffset = flyout.getWidth() || 0;
    //     }

    //     // Get block position
    //     const blockXY = this.#block.getRelativeToSurfaceXY();
    //     let x = blockXY.x;
    //     let y = blockXY.y;

    //     // Convert to workspace coordinates
    //     x +=
    //         (offset.x + flyoutOffset + this.#block.workspace.scrollX) /
    //         this.#block.workspace.scale;
    //     y +=
    //         (offset.y + this.#block.workspace.scrollY) /
    //         this.#block.workspace.scale;

    //     // Adjust for cat face center (approximate)
    //     x += this.constants.CAT_FACE_X_OFFSET + 44; // 44 is roughly center of face
    //     y += this.constants.CAT_FACE_Y_OFFSET - 3; // -3 is roughly eye level

    //     // Handle RTL
    //     // if (this.#block.RTL) {
    //     //     x = window.innerWidth - x;
    //     // }

    //     return { x, y };
    // }

    // /**
    //  * Start tracking mouse movement for eye following
    //  */
    // #startMouseTracking() {
    //     if (this.#mouseTrackingEnabled) {
    //         return;
    //     }

    //     this.#mouseTrackingEnabled = true;

    //     // Clear cached workspace position to get fresh coordinates
    //     this.#workspacePositionRect = null;

    //     // Create mouse move handler
    //     this.#mouseListener = (event: MouseEvent) => {
    //         // Throttle updates
    //         const now = Date.now();
    //         if (now < this.#lastCallTime + this.#CALL_FREQUENCY_MS) {
    //             return;
    //         }
    //         this.#lastCallTime = now;

    //         if (
    //             !this.#shouldWatchMouse() ||
    //             !this.#catElements.face ||
    //             !this.#block
    //         ) {
    //             return;
    //         }

    //         const workspace = this.#block.workspace;
    //         const scale = workspace.scale;

    //         // Get cat face position
    //         const catPos = this.#getCatFacePosition();

    //         // Get mouse position in workspace coordinates
    //         const mouseX = event.clientX / scale;
    //         const mouseY = event.clientY / scale;

    //         // Calculate vector from cat to mouse
    //         const dx = mouseX - catPos.x;
    //         const dy = mouseY - catPos.y;
    //         const theta = Math.atan2(dx, dy);

    //         // Map to shorter vector (eyes can only move a little bit)
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //         const scaleFactor = distance / (distance + 1);

    //         // Use ellipse for eye movement bounds
    //         const a = 2; // horizontal radius
    //         const b = 5; // vertical radius
    //         const r =
    //             (a * b) /
    //             Math.sqrt(
    //                 Math.pow(b * Math.cos(theta), 2) +
    //                     Math.pow(a * Math.sin(theta), 2),
    //             );

    //         // Calculate final eye offset
    //         let eyeDx = r * scaleFactor * Math.sin(theta);
    //         let eyeDy = r * scaleFactor * Math.cos(theta);

    //         // Apply bounds checking
    //         eyeDx = Math.max(-5, Math.min(5, eyeDx));
    //         eyeDy = Math.max(-7, Math.min(7, eyeDy));

    //         // Apply RTL adjustment
    //         // if (this.#block.RTL) {
    //         //     eyeDx -= 87;
    //         // }

    //         // Apply transform to face group
    //         this.#catElements.face.style.transform = `translate(${eyeDx}px, ${eyeDy}px)`;
    //     };

    //     // Add listener
    //     document.addEventListener("mousemove", this.#mouseListener);

    //     // console.log("Mouse tracking started");
    // }

    // /**
    //  * Stop tracking mouse movement
    //  */
    // #stopMouseTracking() {
    //     this.#mouseTrackingEnabled = false;

    //     if (this.#mouseListener) {
    //         document.removeEventListener("mousemove", this.#mouseListener);
    //         this.#mouseListener = null;
    //     }

    //     // Reset face position
    //     if (this.#catElements.face) {
    //         // if (this.#block?.RTL) {
    //         //     this.#catElements.face.style.transform = "translate(-87px, 0)";
    //         // } else {
    //         this.#catElements.face.style.transform = "";
    //         // }
    //     }

    //     // Clear cached workspace position
    //     this.#workspacePositionRect = null;

    //     // console.log("Mouse tracking stopped");
    // }
}
