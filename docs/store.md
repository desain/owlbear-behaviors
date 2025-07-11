---
title: Behaviors
description: Bring tokens to life with block-based automated behavior inspired by Scratch.
author: desain
image: https://owlbear-behaviors.pages.dev/docs/assets/creating-first-behavior.gif
icon: https://owlbear-behaviors.pages.dev/logo.svg
learn-more: https://github.com/desain/owlbear-behaviors
tags:
    - automation
manifest: https://owlbear-behaviors.pages.dev/manifest.json
---

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

Scripts in Behaviors are built by dragging blocks together.

Here are the different kinds of blocks:

-   **Hat blocks**: Trigger when something happens (like "when selected" or "when message received"). When the trigger occurrs, the blocks stacked underneath the hat block will run.
    -   Example: ![Hat block example](https://owlbear-behaviors.pages.dev/docs/assets/hat-block-example.svg)
-   **Stack blocks**: These blocks make your token do something (such as move, change appearance, or play sound). They can be stacked on top of each other, and run from top to bottom.
    -   Example: ![Stack block example](https://owlbear-behaviors.pages.dev/docs/assets/stack-block-example.svg)
-   **Cap blocks**: These blocks are like stack blocks, but never move on to the next block.
    -   Example: ![Cap block example](https://owlbear-behaviors.pages.dev/docs/assets/cap-block-example.svg)
-   **C blocks**: Some blocks are C-shaped, and contain spaces to put other blocks inside them, such as conditionals and loops.
    -   Example: ![C block example](https://owlbear-behaviors.pages.dev/docs/assets/c-block-example.svg)
-   **Reporter blocks**: These rounded blocks output a value, and can be plugged into other blocks to alter their behavior.
    -   Example: ![Reporter block example](https://owlbear-behaviors.pages.dev/docs/assets/reporter-block-example.svg)
-   **Boolean blocks**: Like reporter blocks, these hexagonal blocks output a value, but the value is either `true` or `false`. They can be used in control flow to check conditions.
    -   Example: ![Boolean block example](https://owlbear-behaviors.pages.dev/docs/assets/boolean-block-example.svg)

### Tags

Tokens can be labelled with tags, which are bits of text attached to a token.

-   **Add tags** to tokens to group them or create specialized behaviors
-   Drag blocks onto the tag field in tag blocks to dynamically choose or construct tags at runtime
-   Edit tags from the right-click behaviors menu for an item
-   All tags in the scene are visible in the main Behaviors panel for easy management

### Messages

-   **Send messages** between tokens using broadcast blocks
-   Broadcast messages from the main Behaviors panel as well as from behavior scripts
-   Drag blocks onto the message field in message blocks to dynamically choose or construct tags at runtime

![Sending a Message](https://owlbear-behaviors.pages.dev/docs/assets/sending-message.gif)

### Sounds

-   **Add sound effects** through the sound management panel in the action window
-   See [FreeSound](https://freesound.org/) for a royalty-free sound effects library, or [Kevin MacLeod](https://incompetech.com/music/royalty-free/music.html) for royalty-free music.
-   Sounds are loaded from URLs. You can upload sounds to a hosting service like Dropbox to get a persistent URL for them.

## Notes on Features

### Variables

-   Create variables to store and manipulate data
-   Variables accept any type of value, and can be used in place of any type of data
-   Variables reset when the page is reloaded or when you save a behavior script

### Motion

-   Move tokens smoothly with glide blocks
-   Note that when players switch back to Owlbear Rodeo after being in another tab, all updates that occurred since their last visit will play forward, so your animations may appear jerky.
-   In the 'go' block, the '⏩' option means to move the token in the direction it's facing. In Owlbear Rodeo, 0 degrees rotation means a token is facing up. A token will face in the direction of its rotation handle.

### Selection Control

-   'When I am selected' blocks fire no matter who selects the token
-   'Deselect' blocks apply to all players

### Cloning

-   The clone block produces an effect the same as if you duplicated the object in Owlbear Rodeo - editing the original will not edit the clone, and variables for the clone will be reset to their undefined state.

### Other Extensions and Integrations

-   Behaviors can integrate with other extensions. Blocks for controlling other extensions are in the 'extensions' section of the block toolbox. You must have the other extension installed in order for Behaviors to integrate with it.
-   The Google Sheets integration pulls the current value of a cell, not the text of the formula that produced it.

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
