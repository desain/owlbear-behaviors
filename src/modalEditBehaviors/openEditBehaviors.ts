import OBR from "@owlbear-rodeo/sdk";
import {
    MODAL_EDIT_BEHAVIOR_ID,
    URL_PARAM_CAT_BLOCKS,
    URL_PARAM_ITEM_ID,
} from "../constants";

export function openEditBehaviors(itemId: string) {
    const catBlocks = Math.random() < 0.05; // cat 20
    return OBR.modal.open({
        id: MODAL_EDIT_BEHAVIOR_ID,
        fullScreen: true,
        url: `/src/modalEditBehaviors/modalEditBehaviors.html?${URL_PARAM_ITEM_ID}=${itemId}${
            catBlocks ? "&" + URL_PARAM_CAT_BLOCKS : ""
        }`,
        hidePaper: true,
    });
}
