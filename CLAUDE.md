# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

-   **Install dependencies**: `pnpm install`
-   **Development server**: `pnpm dev`
-   **Build**: `pnpm build`
-   **Lint**: `pnpm lint`
-   **Test**: `pnpm test`
-   **Coverage**: `pnpm coverage`

## Architecture Overview

This is an Owlbear Rodeo VTT extension that provides Scratch-like block-based programming for token behaviors. The extension uses:

-   **Blockly** for the visual programming interface
-   **React + Material UI** for the frontend
-   **Zustand with persist middleware** for state management
-   **Vite** for bundling with multiple entry points

### Multi-Entry Architecture

The build system creates three separate HTML/JS bundles:

-   `action/action.html` - Main action panel
-   `popoverSettings/popoverSettings.html` - Settings popover
-   `modalEditBehaviors/modalEditBehaviors.html` - Behavior editor modal

### Core Systems

**Behavior System** (`src/behaviors/`):

-   `BehaviorRegistry` - Central registry managing behavior execution and lifecycle
-   `BehaviorImpl` - Core behavior implementations for token manipulation
-   `compileBehavior` - Converts Blockly workspace to executable JavaScript
-   `installBehaviorRunner` - Sets up behavior execution environment
-   `ItemProxy` - Safe wrapper for item manipulation in behaviors

**Blockly Integration** (`src/blockly/`):

-   `blocks.ts` - Block definitions (readonly const objects)
-   `toolbox.ts` - Toolbox categories and block organization
-   `BehaviorJavascriptGenerator.ts` - Converts blocks to JavaScript
-   Custom renderer (`CatZelosRenderer.ts`) and extensions for drag-to-duplicate, broadcasts, tags

**State Management** (`src/state/`):

-   Zustand stores for room/scene metadata
-   Automatic syncing with Owlbear Rodeo's storage system

### Adding New Blockly Blocks

Follow this strict process from `.github/copilot-instructions.md`:

1. **blocks.ts**: Define block as readonly const object
2. **toolbox.ts**: Add to appropriate category using block definition's `args0` array
3. **BehaviorJavascriptGenerator.ts**: Add generator entry matching block's field/input names
4. **README.md**: Document user-facing features

### Adding New Parameters to Behavior Functions

To add new global objects/classes available to generated JavaScript code:

1. **constants.ts**: Add new `PARAMETER_*` constant for the parameter name
2. **compileBehavior.ts**:
    - Import the new parameter constant
    - Update `BehaviorDefinitionFunction` type to include the new parameter
    - Add parameter to `compileObrFunction` parameter array
3. **BehaviorRegistry.ts**: Update `executeObrFunction` call to pass the new parameter value
4. **BehaviorJavascriptGenerator.ts**:
    - Import the new parameter constant
    - Add to `addReservedWords` array in constructor
    - Use parameter in generators (e.g., `${PARAMETER_ITEM_PROXY}.methodName()`)

This allows generated JavaScript code to access classes like `ItemProxy`, utility functions, or other objects needed for block functionality.

### Code Style

-   Prefer functional style with readonly parameters
-   Use MUI components over base HTML
-   TypeScript strict mode enabled
-   Use block definition's `args0` array for field names, not hardcoded strings
-   For fields in generators: assign to 'unknown' type, then typecheck with `typeof`

### Extension System

Uses Owlbear Rodeo SDK with these patterns:

-   Plugin ID: `com.desain.behavior`
-   Metadata keys prefixed with plugin ID
-   Install/uninstall lifecycle managed in `install.ts`
-   Extension setup via `setupBlocklyGlobals()`

### Finding Owlbear Rodeo API Definitions

When implementing new blocks that interact with the Owlbear Rodeo SDK:

1. **Check TypeScript definitions in node_modules**: Look in `node_modules/.pnpm/@owlbear-rodeo+sdk@*/node_modules/@owlbear-rodeo/sdk/lib/api/` for API type definitions
2. **Key API locations**:
   - Scene grid API: `scene/SceneGridApi.d.ts` - Contains `snapPosition()`, `getScale()`, etc.
   - Item manipulation: `items/ItemsApi.d.ts` - Item CRUD operations
   - Player API: `player/PlayerApi.d.ts` - Player state and interactions
3. **Common patterns**: Most OBR APIs are async and return Promises, use proper await handling
4. **Grid snapping example**: `OBR.scene.grid.snapPosition(position)` returns snapped coordinates

Always verify API signatures in the TypeScript definitions before implementing new behaviors.
