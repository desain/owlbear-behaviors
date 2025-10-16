import type * as Blockly from "blockly";

const CALLBACK_KEY = "GetExtension";

function official(name: string) {
    return `https://extensions.owlbear.rodeo/${name}`;
}

function rogue(manifest: string) {
    return `https://owlbear.rogue.pub/extension/${manifest}`;
}

const LINKS = {
    "Auras and Emanations": official("auras-and-emanations"),
    "Bones!": official("bones"),
    "Character Distances": official("character-distances"),
    "Clash!": official("clash"),
    Hoot: rogue("https://hoot.armindo.eu/manifest.json"),
    Announcement: rogue("https://announcement.sharkbrain.dev/manifest.json"),
    "Dynamic Fog": official("dynamic-fog"),
    "Game Master's Grimoire": official("hp-tracker"),
    "Game Master's Daggerheart": rogue(
        "https://gmd.tabletop-almanac.com/manifest.json",
    ),
    "Owlbear Codeo": rogue("https://owlbear-codeo.pages.dev/manifest.json"),
    "Owl Trackers": official("owl-trackers"),
    Peekaboo: rogue("https://owlbear-peekaboo.pages.dev/manifest.json"),
    "Phases Automated": official("phases-automated"),
    "Pretty Sordid": official("pretty-sordid"),
    "Rumble!": official("rumble"),
    "Smoke & Spectre!": official("smoke"),
    Weather: official("weather"),
    "Dice+": rogue("https://dice-plus.missinglinkdev.com/manifest.json"),
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
