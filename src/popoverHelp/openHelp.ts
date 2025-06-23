import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_HELP } from "../constants";

export async function openHelp() {
    return await OBR.popover.open({
        id: ID_POPOVER_HELP,
        url: "/src/popoverHelp/popoverHelp.html",
        width: 600,
        height: 800,
    });
}
