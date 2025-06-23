import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_SETTINGS } from "../constants";

export async function openSettings() {
    return await OBR.popover.open({
        id: ID_POPOVER_SETTINGS,
        url: "/src/popoverSettings/popoverSettings.html",
        width: 400,
        height: 200,
    });
}
