# Behaviors

Behaviors is an extension for the Owlbear Rodeo VTT that allows the user to specify behavior for tokens using a block-based language similar to [Scratch](https://scratch.mit.edu/).

## Features

-   🧩 **Block-based programming** for token behaviors, inspired by [Scratch](https://scratch.mit.edu/)
-   🏃‍♂️ **Custom blocks** for motion, looks, events, control, and more
-   💌 **Send messages** to tokens to trigger behavior
-   🏷️ **Tag tokens** to specialize behavior
-   🎵 **Sound support** for audio feedback during behaviors
-   🔄 **Real-time execution** with automatic behavior management
-   🛠️ **Visual editor** with drag-and-drop block interface

## How to use

## Getting Started

![Creating your first behavior](https://owlbear-behaviors.pages.dev/docs/assets/creating-first-behavior.gif)

1. **Right-click any token** on your Owlbear Rodeo map to open the context menu
2. **Select "Edit Behaviors"** to open the visual block editor
3. **Drag blocks** from the toolbox to create your token's behavior
4. **Connect blocks** together to build complex behaviors
5. **Save your work** and watch your token come to life!

![Testing the behavior](https://owlbear-behaviors.pages.dev/docs/assets/testing-behavior.gif)

## Basic Concepts

### Blocks

-   **Event blocks** (hat-shaped): Trigger when something happens (like "when selected" or "when message received")
-   **Action blocks**: Make your token do something (move, change appearance, play sound)
-   **Control blocks**: Add logic like loops, conditions, and delays
-   **Sensing blocks**: Check conditions about the token or scene

### Tags

-   **Add tags** to tokens to group them or create specialized behaviors
-   Edit tags from the right-click behaviors menu for an item
-   Tags are visible in the main Behaviors panel for easy management

### Broadcasting Messages

-   **Send messages** between tokens using broadcast blocks
-   Create coordinated behaviors across multiple tokens
-   Send messages from the main Behaviors panel as well as from behavior scripts

![Sending a Message](https://owlbear-behaviors.pages.dev/docs/assets/sending-message.gif)

### Sounds

-   **Add sound effects** to make behaviors more engaging
-   Link audio files through the sound management panel
-   Use "play sound" blocks in your behaviors

## Advanced Features

### Variables

-   Create variables to store and manipulate data
-   Use variables for counters, scores, or state tracking
-   Variables reset when the page is reloaded or when you save the behavior script

### Motion

-   Move tokens smoothly with glide blocks
-   Note that when players switch back to Owlbear Rodeo after being in another tab, all updates that occurred since their last visit will play forward, so your animations may appear jerky.
-   In the 'go' block, the '⏩' option means to move the token in the direction it's facing. In Owlbear Rodeo, 0 degrees rotation means a token is facing up. A token will face in the direction of its rotation handle.

### Selection Control

-   'When I am selected' blocks fire no matter who selects the token
-   'Deselect' blocks apply to all players

### Other Extensions

-   Behaviors can integrate with other extensions. Blocks for controlling other extensions are in the 'extensions' section of the block toolbox. You must have the other extension installed in order for Behaviors to integrate with it.

## Tips

### Best Practices

-   **Start simple**: Begin with basic "when message received" behaviors before building complex interactions
-   **Test frequently**: Save and test your behaviors often to catch issues early
-   **Use comments**: Add comment blocks to document complex behaviors
-   **Organize blocks**: Keep related blocks close together for easier reading
-   **Don't overwhelm Owlbear Rodeo**: Running many behaviors at once (especially animations) may cause the VTT to glitch out or drop updates.

### Sharing Behaviors

To share behavior scripts between tokens, you have a few options:

-   **Duplicate a token**. The easy option. When you duplicate a token, its behaviors are copied.
-   **Prefabs**. To share tokens with behaviors between scenes, save the token as a prefab with the Prefabs extension. When you insert the prefab, the behaviors come with it.
-   **Backpack**. You can drag scripts to the backpack icon in the top right of your block workspace to put them in your backpack, and click the backpack to open it while editing any token. Block stacks saved to your backpack are saved to your browser's local storage, so they'll persist across scenes and even rooms.

![Using the Backpack](https://owlbear-behaviors.pages.dev/docs/assets/backpack.gif)

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.com/invite/u5RYMkV98s) @Nick or open an issue on [GitHub](https://github.com/desain/owlbear-behaviors/issues).

## Development

After checkout, run `pnpm install`.

## How it Works

This project is a Typescript app.

[![Built with Blockly](https://developers.google.com/static/blockly/images/logos/built-with-blockly-badge-white.png)](https://g.co/dev/blockly)

Icons from https://game-icons.net.

Some script examples generated with https://scratchblocks.github.io/.

## Building

This project uses [pnpm](https://pnpm.io/) as a package manager.

To install all the dependencies run:

`pnpm install`

To run in a development mode run:

`pnpm dev`

To make a production build run:

`pnpm build`

## To do

-   Fix new instance received?
-   Request autoplay permission for sfx?
-   Make new tags in tags field show up in possible tags list in block immediately
-   I want to add a new feature called 'Auto Tags' to this extension. This feature would allow users to associate specific token image URLs with tags, so that all tokens with that image would be considered to have those tags (without needing to update the token metadata to have those tags). I'd like to store those auto-tags in the room metadata, and display an editor for them in this EditBehaviors modal, which appears for a specific token. I want the modal to display all tags for the current token, and if the token is an Image type, display an option to manage auto-tags (maybe using MUI's Autocomplete component) for that image type.
-   Context menus
    -   Copy and paste behaviors
    -   Mass tag
-   Blocks
    -   Sound
        -   Stop all sounds
    -   Looks
        -   Set text on text and note items
    -   Extensions
        -   Smoke and spectre
            -   Has Light
            -   add () ft light
        -   On field change for Daggerheart, Owl Trackers
    -   Control
        -   switch? https://groups.google.com/g/blockly/c/djhO2jUb0Xs
        -   Create a clone of (myself v)
            -   Sets isClone metadata to true
                -   This metadata disables the immediately block
        -   When I start as a clone
            -   Is like immediately but for clones
        -   Delete this token
        -   tell other to?
    -   Sensing
        -   Current (year/month/day of month/hour/minute/second/unix timestamp)
    -   Events
        -   When I'm updated in any way?
        -   When I am tagged (tag1 v)?
        -   When I am attached / detached
        -   Broadcast to myself / my children / other token?
    -   Operators
        -   Min, max
    -   Variables
        -   Scene-global variables
        -   variables category
            -   registered in workspace constructor (can't override?): https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/workspace_svg.ts#L394
            -   generated in https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables_dynamic.ts#L26
            -   calls https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables.ts#L183
                -   need to override input in setter
        -   Array variables
    -   Stop all / other scripts in token?

## Known Bugs

-   Dragging directly from the 'other' block in the touch hat block to the flyout deletes the hat block
-   Animations can be choppy when the action window is not open
-   Stacking in backpack - happens when lots of (tall?) items, only on second time opening backpack
-   Deleting last variable doesn't work

## License

GNU GPLv3
