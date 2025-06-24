import type * as Blockly from "blockly";

const CALLBACK_KEY = "GetExtension";

const MANIFESTS = {
    "Auras and Emanations": "https://owlbear-emanation.pages.dev/manifest.json",
    Hoot: "https://hoot.armindo.eu/manifest.json",
    Announcement: "https://announcement.sharkbrain.dev/manifest.json",
};

export function extensionHeader(extension: keyof typeof MANIFESTS) {
    return [
        { kind: "label", text: `${extension} extension` },
        {
            kind: "button",
            text: `Get ${extension}`,
            callbackkey: CALLBACK_KEY,
            manifest: MANIFESTS[extension],
        },
    ];
}

export function installGetExtensionCallback(workspace: Blockly.WorkspaceSvg) {
    workspace.registerButtonCallback(CALLBACK_KEY, (button) => {
        if (
            "manifest" in button.info &&
            typeof button.info.manifest === "string"
        ) {
            window
                .open(
                    `https://owlbear.rogue.pub/extension/${button.info.manifest}`,
                    "_blank",
                )
                ?.focus();
        }
    });
}
