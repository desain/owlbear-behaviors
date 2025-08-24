#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// Check if we're building for production (when CF_PAGES is set) or development
const isProduction =
    process.env.CF_PAGES === "1" || process.argv.includes("--production");
const baseUrl = isProduction ? "https://owlbear-behaviors.pages.dev" : "";

function readMarkdownFile(filename) {
    const path = resolve(rootDir, "docs", "content", filename);
    return readFileSync(path, "utf-8");
}

function processImageUrls(content) {
    if (isProduction) {
        return content;
    }
    // For development, replace absolute URLs with relative paths
    return content.replace(
        /https:\/\/owlbear-behaviors\.pages\.dev\/docs\/assets\//g,
        "/docs/assets/",
    );
}

function updateReadme() {
    const featuresContent = readMarkdownFile("features.md");
    const howToUseContent = readMarkdownFile("how-to-use.md");
    const readmePath = resolve(rootDir, "README.md");
    let readme = readFileSync(readmePath, "utf-8");

    // Replace the features section
    const featuresMatch = readme.match(
        /(## Features\n\n)([\s\S]*?)(\n\n## How to use)/,
    );
    if (featuresMatch) {
        const featuresLines = featuresContent.split("\n").slice(2); // Skip the "# Features" header
        const featuresText = featuresLines.join("\n").trim();
        readme = readme.replace(
            featuresMatch[0],
            `${featuresMatch[1]}${featuresText}${featuresMatch[3]}`,
        );
    }

    // Replace the "How to use" section
    const howToUseMatch = readme.match(
        /(## How to use\n\n)([\s\S]*?)(\n\n## Support)/,
    );
    if (howToUseMatch) {
        const howToUseLines = howToUseContent.split("\n").slice(2); // Skip the "# How to Use" header
        const howToUseText = howToUseLines.join("\n").trim();
        readme = readme.replace(
            howToUseMatch[0],
            `${howToUseMatch[1]}${howToUseText}${howToUseMatch[3]}`,
        );
    }

    writeFileSync(readmePath, readme);
    console.log("✅ Updated README.md");
}

function updateStoreMd() {
    const featuresContent = readMarkdownFile("features.md");
    const howToUseContent = readMarkdownFile("how-to-use.md");

    const storePath = resolve(rootDir, "docs", "store.md");
    let store = readFileSync(storePath, "utf-8");

    // Replace the features section
    const featuresMatch = store.match(
        /(## Features\n\n)([\s\S]*?)(\n\n## How to use)/,
    );
    if (featuresMatch) {
        const featuresLines = featuresContent.split("\n").slice(2); // Skip the "# Features" header
        const featuresText = featuresLines.join("\n").trim();
        store = store.replace(
            featuresMatch[0],
            `${featuresMatch[1]}${featuresText}${featuresMatch[3]}`,
        );
    }

    // Replace the "How to use" section
    const howToUseMatch = store.match(
        /(## How to use\n\n)([\s\S]*?)(\n\n## Support)/,
    );
    if (howToUseMatch) {
        const howToUseLines = howToUseContent.split("\n").slice(2); // Skip the "# How to Use" header
        const howToUseText = howToUseLines.join("\n").trim();
        store = store.replace(
            howToUseMatch[0],
            `${howToUseMatch[1]}${howToUseText}${howToUseMatch[3]}`,
        );
    }

    writeFileSync(storePath, store);
    console.log("✅ Updated docs/store.md");
}

function createHelpContent() {
    const quickStartContent = processImageUrls(
        readMarkdownFile("quick-start.md"),
    );
    const howToUseContent = processImageUrls(readMarkdownFile("how-to-use.md"));
    const ideasContent = processImageUrls(readMarkdownFile("script-ideas.md"));

    // Combine content for the help system
    const helpContent = {
        quickStart: quickStartContent,
        howToUse: howToUseContent,
        ideas: ideasContent,
    };

    const helpPath = resolve(
        rootDir,
        "src",
        "popoverHelp",
        "help-content.json",
    );
    writeFileSync(helpPath, JSON.stringify(helpContent, null, 2));
    console.log("✅ Created help content JSON");
}

function main() {
    console.log("🔧 Building documentation...");
    console.log(
        `📦 Building for ${isProduction ? "production" : "development"}`,
    );

    try {
        updateReadme();
        updateStoreMd();
        createHelpContent();
        console.log("✅ Documentation build complete!");
    } catch (error) {
        console.error("❌ Documentation build failed:", error.message);
        process.exit(1);
    }
}

main();
