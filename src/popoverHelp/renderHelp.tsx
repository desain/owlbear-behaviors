import { ExtensionWrapper } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { Help } from "./Help";
import "./help.css";

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);
    root.render(
        <React.StrictMode>
            <ExtensionWrapper
                startSyncing={startSyncing}
                useStoreFn={usePlayerStorage}
            >
                <Help />
            </ExtensionWrapper>
        </React.StrictMode>,
    );
});
