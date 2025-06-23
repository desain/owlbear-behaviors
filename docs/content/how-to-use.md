# How to Use

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
