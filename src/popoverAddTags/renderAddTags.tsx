import { ExtensionWrapper } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { PopoverAddTags } from "./PopoverAddTags";

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);
    root.render(
        <React.StrictMode>
            <ExtensionWrapper
                startSyncing={startSyncing}
                useStoreFn={usePlayerStorage}
            >
                <PopoverAddTags />
            </ExtensionWrapper>
        </React.StrictMode>,
    );
});