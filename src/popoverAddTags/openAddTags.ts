import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_ADD_TAGS } from "../constants";

export function openAddTags() {
    return OBR.popover.open({
        id: ID_POPOVER_ADD_TAGS,
        url: `/src/popoverAddTags/popoverAddTags.html`,
        height: 250,
        width: 350,
        anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
        transformOrigin: { horizontal: "CENTER", vertical: "CENTER" },
    });
}
