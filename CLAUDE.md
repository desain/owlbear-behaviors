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

#### 2. **Behavior Functions** (`src/behaviors/BehaviorImpl.ts` and `src/behaviors/impl/<category>.ts`)

Add behavior functions that use the extension utility:

```typescript
// Import the extension utility
import { Fog } from "../extensions/Fog";

// Add to BEHAVIORS_IMPL object or appropriate object for the block's category
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

### Adding Trigger Handlers and Hat Blocks

Trigger handlers and hat blocks allow behaviors to respond to events (like property changes, collisions, or extension-specific events). Follow this pattern to add new trigger types:

#### 1. **Define Trigger Handler Interface** (`src/behaviors/TriggerHandler.ts`)

Add a new interface extending `BaseTriggerHandler`:

```typescript
interface MyCustomTriggerHandler extends BaseTriggerHandler {
    readonly type: "my_custom_event";
    readonly eventData: string; // Any event-specific data
}
```

Then add it to the `TriggerHandler` union type:

```typescript
export type TriggerHandler =
    | ImmediateTriggerHandler
    | StartAsCloneTriggerHandler
    // ... other handlers
    | MyCustomTriggerHandler;
```

#### 2. **Create Hat Block Definition** (`src/blockly/blocks.ts`)

Define the hat block with `event_blocks` style:

```typescript
export const BLOCK_WHEN_MY_EVENT = {
    style: "event_blocks",
    type: "event_when_my_event",
    tooltip: "Define what to do when my custom event occurs",
    message0: "when %1 happens",
    args0: [
        {
            type: "field_dropdown",
            name: "EVENT_TYPE",
            options: [
                ["something", "option1"],
                ["something else", "option2"],
            ],
        },
    ],
    nextStatement: null, // Hat blocks have nextStatement, not previousStatement
} as const;
```

**Key patterns:**

-   Use `"event_blocks"` style for hat blocks if they're in the events category, or `"extension_blocks"` style if they're triggered by an extension.
-   Hat blocks have `nextStatement: null` (no `previousStatement`)
-   Include dropdown options or inputs for event configuration
-   Add to `CUSTOM_JSON_BLOCKS` array for registration

#### 3. **Create JavaScript Generator** (`src/blockly/BehaviorJavascriptGenerator.ts`)

Add generator that creates trigger handler registration:

```typescript
event_when_my_event: (block, generator) => {
    const eventType = getStringFieldValue(
        block,
        BLOCK_WHEN_MY_EVENT.args0[0].name,
    );

    const behaviorFunction = getHatBlockBehaviorFunction(block, generator);
    return generateAddTriggerHandler({
        type: "my_custom_event",
        hatBlockId: block.id,
        eventData: eventType,
        behaviorFunction,
    });
},
```

**Key patterns:**

-   Use `getHatBlockBehaviorFunction()` to generate the behavior function
-   Use `generateAddTriggerHandler()` to create registration code
-   Extract field values using block definition's `args0` field names
-   Return the registration code directly (no operator precedence needed)

#### 4. **Add Trigger Handler Method** (`src/behaviors/BehaviorRegistry.ts`)

Add a method to handle the trigger event:

```typescript
readonly handleMyCustomEvent = (eventData: string) =>
    this.#triggerHandlers.forEach((handlers) =>
        handlers
            .filter((handler) => handler.type === "my_custom_event")
            .filter((handler) => handler.eventData === eventData)
            .forEach((handler) => executeTriggerHandler(handler))
    );
```

**Key patterns:**

-   Use `readonly` arrow function properties
-   Filter handlers by trigger type
-   Apply additional filtering based on event data
-   Call `executeTriggerHandler()` for matching handlers
-   For item-specific events, iterate `this.#triggerHandlers.get(itemId)`

#### 5. **Add Event Detection** (`src/behaviors/installBehaviorRunner.ts`)

Add detection logic in the appropriate location:

**For item metadata changes** (like extension data):

```typescript
// Check for my custom event changes
if (MyExtension.hasFeature(oldItem) && MyExtension.hasFeature(item)) {
    const oldState = MyExtension.getState(oldItem);
    const newState = MyExtension.getState(item);
    if (oldState !== newState) {
        behaviorRegistry.handleMyCustomEvent(newState);
    }
}
```

**For global events** (like scene metadata):

```typescript
// In the OBR.scene.onMetadataChange callback or similar
const unsubscribeMyEvent = OBR.scene.onMetadataChange((metadata) => {
    const myData = MyExtension.getGlobalData(metadata);
    if (myData !== oldMyData) {
        behaviorRegistry.handleMyCustomEvent(myData);
    }
    oldMyData = myData;
});
```

#### 6. **Add to Toolbox** (`src/blockly/toolbox.ts`)

Add the hat block to appropriate toolbox category:

```typescript
// Import the block constant
import { BLOCK_WHEN_MY_EVENT } from "./blocks";

// Add to toolbox contents
blockToDefinition(BLOCK_WHEN_MY_EVENT),
```

#### 7. **Extension-Specific Helper Methods**

If the trigger is for an external extension, add helper methods to the extension utility:

```typescript
// src/extensions/MyExtension.ts
export const MyExtension = {
    hasFeature: (item: Item): boolean => !!item.metadata[METADATA_KEY],
    getState: (item: Item): string =>
        item.metadata[METADATA_KEY]?.state || "default",
};
```

#### Common Trigger Handler Patterns

**Item-specific triggers** (like door open/close):

-   Check conditions in `installBehaviorRunner.ts` item comparison loop
-   Use `behaviorRegistry.handleEvent(item.id, eventData)`
-   Filter by `this.#triggerHandlers.get(itemId)`

**Global triggers** (like scene events):

-   Use OBR event listeners or scene metadata changes
-   Use `behaviorRegistry.handleEvent(eventData)`
-   Iterate `this.#triggerHandlers.forEach()`

**Property change triggers** (already exist):

-   Use existing `PropertyChanged<K>` interface pattern
-   Add new property keys to the union type
-   Handle in existing property change detection

**Collision triggers** (already exist):

-   Use existing `CollisionTriggerHandler` pattern
-   Integrate with `CollisionEngine` system

This system provides a flexible way to add new event-driven behaviors while maintaining consistency with the existing trigger handler architecture.
