import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { ID_TOOL, ID_TOOL_MODE_EDIT_BEHAVIORS } from "../constants";
import { EditBehaviorsMode } from "./EditBehaviorsMode";

export async function activateTool() {
    await Promise.all([
        OBR.tool.create({
            id: ID_TOOL,
            icons: [
                {
                    icon: logo,
                    label: "Edit Behaviors Directly",
                },
            ],
            defaultMetadata: {},
            defaultMode: ID_TOOL_MODE_EDIT_BEHAVIORS,
        }),
        OBR.tool.createMode(new EditBehaviorsMode()),
    ]);
    await OBR.tool.activateTool(ID_TOOL);
}

export function deactivateTool() {
    return Promise.all([
        OBR.tool.remove(ID_TOOL),
        OBR.tool.removeMode(ID_TOOL_MODE_EDIT_BEHAVIORS),
    ]);
}
