# Manual test steps for procedures

## Basic

-   Make a block, drag out a call, delete it
    -   Call shoud die
    -   Toolbox should remove call
-   Make a define, delete it, undo

## Serialization

Make define block with inputs, then:

### Defines

-   Copy paste define block
-   Copy define block, delete it, paste
-   Backpack define block, restore it
-   Backpack define block, delete original, restore

### Calls

-   Copy paste call block
-   Copy call block, delete its define, paste
    -   Should bring the define back
-   Backpack call block, restore it
-   Backpack call block, delete its define, restore

### Argument reporters

-   Copy paste argument reporter block
-   Copy reporter, delete its define, paste
    -   Should bring the define back
-   Copy reporter, remove its input from the define, paste
    -   it doesn't appear, which is fine, but there's an error in the console since it tries to dispose itself before its setup is done
        -   let it have a null model and onchange delete?
-   Backpack reporter, restore it
-   Backpack reporter, delete its define, restore

### Everything

-   Make recursive procedure and run
