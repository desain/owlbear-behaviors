import * as Blockly from "blockly";
import { ConstantProvider } from "./ConstantProvider";
import { Drawer } from "./Drawer";
import { PathObject } from "./PathObject";
import { RenderInfo } from "./RenderInfo";

/**
 * Custom renderer that adds Scratch-style hat shapes to procedure definition blocks
 * Scratch impl: https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/core/block_render_svg_vertical.js#L1231
 */
export class Renderer extends Blockly.zelos.Renderer {
    static readonly register = () => {
        Blockly.blockRendering.register(Renderer.NAME, Renderer);
    };

    static readonly NAME = "behaviors";

    /**
     * Create a new instance of the renderer's constant provider.
     */
    // eslint-disable-next-line class-methods-use-this
    override makeConstants_ = (): ConstantProvider => new ConstantProvider();

    /**
     * Create a new instance of the renderer's render info object.
     */
    override makeRenderInfo_(block: Blockly.BlockSvg): RenderInfo {
        return new RenderInfo(this, block);
    }

    /**
     * Create a new instance of the renderer's drawer.
     */
    override makeDrawer_(
        block: Blockly.BlockSvg,
        info: Blockly.zelos.RenderInfo,
    ): Drawer {
        void this;
        return new Drawer(block, info as RenderInfo);
    }

    override makePathObject(
        root: SVGElement,
        style: Blockly.Theme.BlockStyle,
    ): Blockly.zelos.PathObject {
        return new PathObject(root, style, this.constants_);
    }
}
