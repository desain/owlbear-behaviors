---
applyTo: "**/*.{ts,tsx}"
---

# Basics

This project is an extension for the Owlbear Rodeo VTT. It uses Vite to bundle and serve assets, React and Material UI for the interface, and Zustand with the persist middleware for state management.

When writing code, prefer a functional style with readonly parameters. Use MUI components when creating UI, rather than base HTML.

# Working with the README:

Before starting on a new feature, check the README for information on how the extension works. After finishing adding a feature, if it seems like the kind of thing that should be documented in the README, update the README file.

# Adding Blockly Blocks

To add a new Blockly block:

1. **blocks.ts**: Define the block as a `const` object.
    - Use readonly types.
    - For dropdowns or options, define a shared constant if used in multiple places.
    - If copying from Blockly dev tools, remove the 'colour' property from the block definition.
    - Remove any dummy inputs and references to them in the message unless they are absolutely necessary.
2. **toolbox.ts**: Add the block to the appropriate toolbox category.
    - Use the block definition and its `args0` array to refer to field/input names, **not** hardcoded strings.
    - Use shadow blocks for number/string inputs as needed.
    - If the user does not specify where in the toolbox to add the block, ask for their preferred location before adding it.
3. **BehaviorJavascriptGenerator.ts**: Add a generator entry for the block.
    - Refer to the block definition and its `args0` array for field/input names, matching the style of other generator entries.
    - For fields, assign the output of getFieldValue to an 'unknown' type, and typecheck it with `typeof` after.
4. **README.md**: If the new block is user-facing or changes extension behavior, update the README to document it.

Before starting, check the README for extension details. After adding a block, update the README if needed.

# User interaction

Put together a step-by-step implementation plan before implementing complex features, and check your plan with the user. Make sure to get user approval before starting implementation.
