import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { PluginGate, PluginThemeProvider } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { startSyncing } from "../state/startSyncing";
import { Help } from "./Help";

OBR.onReady(() => {
    void startSyncing();
});

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);
    root.render(
        <React.StrictMode>
            <PluginGate>
                <PluginThemeProvider>
                    <CssBaseline />
                    <Help />
                </PluginThemeProvider>
            </PluginGate>
        </React.StrictMode>,
    );
});