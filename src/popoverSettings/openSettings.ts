import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_SETTINGS } from "../constants";

export function openSettings() {
    return OBR.popover.open({
        id: ID_POPOVER_SETTINGS,
        url: "/src/popoverSettings/popoverSettings.html",
        width: 400,
        height: 400,
    });
}
