import { ExtensionWrapper } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { URL_PARAM_CAT_BLOCKS, URL_PARAM_ITEM_ID } from "../constants";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { EditBehaviors } from "./EditBehaviors";

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get(URL_PARAM_ITEM_ID);
    const catBlocks = urlParams.get(URL_PARAM_CAT_BLOCKS);

    if (!itemId) {
        throw Error("Missing item ID in Edit Behavior modal");
    }

    root.render(
        <React.StrictMode>
            <ExtensionWrapper
                startSyncing={startSyncing}
                useStoreFn={usePlayerStorage}
            >
                <EditBehaviors itemId={itemId} catBlocks={catBlocks !== null} />
            </ExtensionWrapper>
        </React.StrictMode>,
    );
});
