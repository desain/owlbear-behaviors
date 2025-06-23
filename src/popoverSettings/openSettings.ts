import OBR from "@owlbear-rodeo/sdk";
import { POPOVER_SETTINGS_ID } from "../constants";

export async function openSettings() {
    return await OBR.popover.open({
        id: POPOVER_SETTINGS_ID,
        url: "/src/popoverSettings/popoverSettings.html",
        width: 400,
        height: 600,
    });
}
