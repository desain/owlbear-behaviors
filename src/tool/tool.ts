import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { TOOL_ID } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export async function startWatchingToolEnabled(): Promise<VoidFunction> {
    if (usePlayerStorage.getState().toolEnabled) {
        await installTool();
    }
    return usePlayerStorage.subscribe(
        (store) => store.toolEnabled,
        async (enabled) => {
            if (enabled) {
                await installTool();
            } else {
                await uninstallTool();
            }
        },
    );
}

async function installTool() {
    await Promise.all([
        OBR.tool.create({
            id: TOOL_ID,
            shortcut: undefined,
            icons: [
                {
                    icon: logo,
                    label: "TODO tool name",
                },
            ],
            defaultMetadata: {},
            onClick: () => {
                void OBR.notification.show("TOOL CLICKED");
            },
        }),
    ]);
}

async function uninstallTool() {
    await OBR.tool.remove(TOOL_ID);
}
