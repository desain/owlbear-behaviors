# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

-   **Install dependencies**: `pnpm install`
-   **Development server**: `pnpm dev`
-   **Build**: `pnpm build` (this also runs the type checker)
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

### Integrating External Extensions

When adding blocks that interact with external Owlbear Rodeo extensions, follow this established pattern:

#### 1. **Extension Utility Module** (`src/extensions/`)

Create a dedicated utility module for each external extension:

```typescript
// Example: src/extensions/Fog.ts
import { type Item } from "@owlbear-rodeo/sdk";

const METADATA_KEY = "rodeo.owlbear.dynamic-fog/light";

export const Fog = {
    hasLight: (item: Item): boolean =>
        item.metadata[METADATA_KEY] !== undefined,
};
```

**Key patterns:**

-   Export a const object with methods for extension functionality
-   Use proper TypeScript typing with Owlbear SDK types
-   Encapsulate metadata key constants within the module
-   For extensions that use broadcast messaging (like Auras), use `OBR.broadcast.sendMessage`

#### 2. **Behavior Functions** (`src/behaviors/BehaviorImpl.ts`)

Add behavior functions that use the extension utility:

```typescript
// Import the extension utility
import { Fog } from "../extensions/Fog";

// Add to BEHAVIORS_IMPL object
hasLight: async (
    signal: AbortSignal,
    selfIdUnknown: unknown,
): Promise<boolean> => {
    const selfItem = await ItemProxy.getInstance().get(String(selfIdUnknown));
    signal.throwIfAborted();
    if (!selfItem) {
        return false;
    }
    return Fog.hasLight(selfItem);
},
```

**Key patterns:**

-   Always handle AbortSignal for async operations
-   Use ItemProxy for item retrieval and manipulation
-   Validate parameters and handle edge cases
-   Return appropriate types (Promise<boolean>, Promise<string>, etc.)

#### 3. **Block Definitions** (`src/blockly/blocks.ts`)

Define blocks with appropriate styling and metadata:

```typescript
export const BLOCK_EXTENSION_FOG_LIT = {
    style: "extension_blocks",
    type: "extension_fog_lit",
    tooltip: "Whether this token has a light from the Dynamic Fog extension",
    helpUrl: "",
    message0: "I have a light?",
    output: "Boolean",
} as const;
```

**Key patterns:**

-   Use `"extension_blocks"` style for external extension blocks
-   Include descriptive tooltips mentioning the specific extension
-   Use clear, user-friendly message text
-   Add to `CUSTOM_JSON_BLOCKS` array for registration

#### 4. **JavaScript Generators** (`src/blockly/BehaviorJavascriptGenerator.ts`)

Create generators that call behavior functions:

```typescript
extension_fog_lit: () => [
    `await ${behave("hasLight", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
    javascript.Order.AWAIT,
],
```

**Key patterns:**

-   Use the `behave()` helper function to call behavior implementations
-   Include proper await syntax for async operations
-   Use appropriate operator precedence (typically `javascript.Order.AWAIT` for async calls)

#### 5. **Toolbox Integration** (`src/blockly/toolbox.ts`)

Add blocks to the Extensions category with proper grouping:

```typescript
// In Extensions category contents:
...extensionHeader("Dynamic Fog"),
blockToDefinition(BLOCK_EXTENSION_FOG_LIT),
```

**Key patterns:**

-   Group related blocks under extension headers using `extensionHeader()`
-   Use `blockToDefinition()` for simple blocks without complex inputs
-   Place extension blocks in the Extensions category

#### 6. **Extension Button System** (`src/blockly/getExtensionButton.ts`)

Register extension manifests for the "Get Extension" button:

```typescript
const MANIFESTS = {
    "Auras and Emanations": rogue(
        "https://owlbear-emanation.pages.dev/manifest.json",
    ),
    "Dynamic Fog": "https://extensions.owlbear.rodeo/dynamic-fog",
    // ...
};
```

**Key patterns:**

-   Use descriptive names that match the extension's official name
-   Link to official extension stores or manifest URLs
-   Use `rogue()` helper for extensions available through owlbear.rogue.pub

#### 7. **Extension Metadata Detection**

When detecting extension features, use metadata presence rather than specific values:

```typescript
// Check if metadata key exists (extension installed and configured)
item.metadata[METADATA_KEY] !== undefined;

// For specific values, access nested properties safely:
item.metadata[METADATA_KEY]?.someProperty;
```

**Key patterns:**

-   Extensions typically use namespaced metadata keys (e.g., `"extension.domain/feature"`)
-   Presence of metadata key often indicates feature is active
-   Handle missing metadata gracefully (return false/default values)

This pattern allows for clean separation of concerns, easy testing, and consistent integration with external extensions while maintaining type safety and following the established architectural patterns.
