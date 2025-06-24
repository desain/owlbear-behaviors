import { ExtensionWrapper } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { Settings } from "./Settings";

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);
    root.render(
        <React.StrictMode>
            <ExtensionWrapper
                startSyncing={startSyncing}
                useStoreFn={usePlayerStorage}
            >
                <Settings />
            </ExtensionWrapper>
        </React.StrictMode>,
    );
});
