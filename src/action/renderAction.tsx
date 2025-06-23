import CssBaseline from "@mui/material/CssBaseline";
import OBR from "@owlbear-rodeo/sdk";
import { PluginGate, PluginThemeProvider } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import "../../assets/style.css";
import { install } from "../install";
import { startSyncing } from "../state/startSyncing";
import { Action } from "./Action";

// Enable here or in background
install();

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
                    <Action />
                </PluginThemeProvider>
            </PluginGate>
        </React.StrictMode>,
    );
});
