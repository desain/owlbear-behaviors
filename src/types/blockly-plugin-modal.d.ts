declare module "@blockly/plugin-modal" {
    import type * as Blockly from "blockly";

    export class Modal {
        protected workspace_: Blockly.WorkspaceSvg;
        protected title_: string;
        protected htmlDiv_: HTMLDivElement | null;
        protected shouldCloseOnOverlayClick: boolean;
        protected shouldCloseOnEsc: boolean;

        constructor(title: string, workspace: Blockly.WorkspaceSvg);

        init(): void;
        dispose(): void;
        show(): void;
        hide(): void;
        render(): void;
        renderContent_(container: HTMLDivElement): HTMLElement;
        addEvent_(
            element: HTMLElement,
            event: string,
            thisObject: object,
            callback: () => void,
        ): void;
    }
}
