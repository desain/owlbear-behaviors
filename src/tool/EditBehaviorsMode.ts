import type { ToolContext, ToolEvent, ToolMode } from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { isBehaviorItem } from "../BehaviorItem";
import {
    ID_TOOL,
    ID_TOOL_MODE_EDIT_BEHAVIORS,
    METADATA_KEY_BEHAVIORS,
} from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import { deactivateTool } from "./tool";

export class EditBehaviorsMode implements ToolMode {
    readonly id = ID_TOOL_MODE_EDIT_BEHAVIORS;
    readonly icons = [
        {
            icon: logo,
            label: "Edit Behaviors Directly",
            filter: {
                activeTools: [ID_TOOL],
            },
        },
    ];
    readonly cursors = [
        {
            cursor: "context-menu",
            filter: {
                activeModes: [ID_TOOL_MODE_EDIT_BEHAVIORS],
                activeTools: [ID_TOOL],
                dragging: false,
                target: [
                    {
                        key: ["metadata", METADATA_KEY_BEHAVIORS],
                        operator: "!=" as const,
                        value: undefined,
                    },
                ],
            },
        },
        {
            cursor: "not-allowed",
        },
    ];

    // readonly #shiftControlManager = new ShiftControlManager();

    readonly onToolClick = async (_context: ToolContext, event: ToolEvent) => {
        void this;
        if (
            event.target &&
            isBehaviorItem(event.target) &&
            event.target.metadata[METADATA_KEY_BEHAVIORS]
        ) {
            await openEditBehaviors(event.target.id);
            await deactivateTool();
        }
    };

    // eslint-disable-next-line class-methods-use-this
    readonly onActivate = () => {
        // await this.#shiftControlManager.install();
    };

    // eslint-disable-next-line class-methods-use-this
    readonly onDeactivate = () =>
        Promise.all([
            // this.#shiftControlManager.unininstall(),
            deactivateTool(),
        ]);
}
