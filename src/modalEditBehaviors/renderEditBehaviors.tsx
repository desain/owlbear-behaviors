import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { PluginGate, PluginThemeProvider } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { setupBlocklyGlobals } from "../blockly/setupBlocklyGlobals";
import { URL_PARAM_CAT_BLOCKS, URL_PARAM_ITEM_ID } from "../constants";
import { startSyncing } from "../state/startSyncing";
import { EditBehaviors } from "./EditBehaviors";

OBR.onReady(() => {
    void startSyncing();
});

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);

    setupBlocklyGlobals();

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get(URL_PARAM_ITEM_ID);
    const catBlocks = urlParams.get(URL_PARAM_CAT_BLOCKS);

    if (!itemId) {
        throw Error("Missing item ID in Edit Behavior modal");
    }

    root.render(
        <React.StrictMode>
            <PluginGate>
                <PluginThemeProvider>
                    <CssBaseline />
                    <EditBehaviors
                        itemId={itemId}
                        catBlocks={catBlocks !== null}
                    />
                </PluginThemeProvider>
            </PluginGate>
        </React.StrictMode>,
    );
});
