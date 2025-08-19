import OBR from "@owlbear-rodeo/sdk";
import { installBackgroundExtension } from "./installBackgroundExtension";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Background process starting...");
    if (OBR.isReady) {
        void installBackgroundExtension();
    } else {
        OBR.onReady(() => void installBackgroundExtension());
    }
});
