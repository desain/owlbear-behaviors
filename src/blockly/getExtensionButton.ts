import type * as Blockly from "blockly";

const CALLBACK_KEY = "GetExtension";

function rogue(manifest: string) {
    return `https://owlbear.rogue.pub/extension/${manifest}`;
}

const LINKS = {
    "Auras and Emanations": rogue(
        "https://owlbear-emanation.pages.dev/manifest.json",
    ),
    "Bones!": "https://extensions.owlbear.rodeo/bones",
    "Clash!": "https://extensions.owlbear.rodeo/clash",
    Hoot: rogue("https://hoot.armindo.eu/manifest.json"),
    Announcement: rogue("https://announcement.sharkbrain.dev/manifest.json"),
    "Dynamic Fog": "https://extensions.owlbear.rodeo/dynamic-fog", // https://dynamic-fog.owlbear.rodeo/manifest.json
    "Game Master's Grimoire": "https://extensions.owlbear.rodeo/hp-tracker",
    "Game Master's Daggerheart": rogue(
        "https://gmd.tabletop-almanac.com/manifest.json",
    ),
    "Owlbear Codeo": rogue("https://owlbear-codeo.pages.dev/manifest.json"),
    "Owl Trackers": "https://extensions.owlbear.rodeo/owl-trackers",
    "Phases Automated": "https://extensions.owlbear.rodeo/phases-automated",
    "Pretty Sordid": "https://extensions.owlbear.rodeo/pretty-sordid",
    "Rumble!": "https://extensions.owlbear.rodeo/rumble",
    "Smoke & Spectre!": "https://extensions.owlbear.rodeo/smoke",
    Weather: "https://extensions.owlbear.rodeo/weather",
};

export function extensionHeader(extension: keyof typeof LINKS) {
    return [
        { kind: "label", text: `${extension} extension` },
        {
            kind: "button",
            text: `Get ${extension}`,
            callbackkey: CALLBACK_KEY,
            extensionLink: LINKS[extension],
        },
    ];
}

export function installGetExtensionCallback(workspace: Blockly.WorkspaceSvg) {
    workspace.registerButtonCallback(CALLBACK_KEY, (button) => {
        if (
            "extensionLink" in button.info &&
            typeof button.info.extensionLink === "string"
        ) {
            window.open(button.info.extensionLink, "_blank")?.focus();
        }
    });
}
