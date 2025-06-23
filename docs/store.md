---
title: Behaviors
description: Bring tokens to life with block-based automated behavior inspired by Scratch.
author: desain
image: https://owlbear-behaviors.pages.dev/docs/assets/creating-first-behavior.gif
icon: https://owlbear-behaviors.pages.dev/logo.svg
learn-more: https://github.com/desain/owlbear-behaviors
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

-   **Event blocks** (hat-shaped): Trigger when something happens (like "when selected" or "when message received")
-   **Action blocks**: Make your token do something (move, change appearance, play sound)
-   **Control blocks**: Add logic like loops, conditions, and delays
-   **Sensing blocks**: Check conditions about the token or scene

### Tags

-   **Add tags** to tokens to group them or create specialized behaviors
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

### Motion

-   Move tokens smoothly with glide blocks
-   Note that when players switch back to Owlbear Rodeo after being in another tab, all updates that occurred since their last visit will play forward, so your animations may appear jerky.
-   In the 'go' block, the '⏩' option means to move the token in the direction it's facing. In Owlbear Rodeo, 0 degrees rotation means a token is facing up. A token will face in the direction of its rotation handle.

### Selection Control

-   'When I am selected' blocks fire no matter who selects the token
-   'Deselect' blocks apply to all players

## Tips

### Best Practices

-   **Start simple**: Begin with basic "when message received" behaviors before building complex interactions
-   **Test frequently**: Save and test your behaviors often to catch issues early
-   **Use comments**: Add comment blocks to document complex behaviors
-   **Organize blocks**: Keep related blocks close together for easier reading

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.com/invite/u5RYMkV98s) @Nick or open an issue on [GitHub](https://github.com/desain/owlbear-behaviors/issues).
