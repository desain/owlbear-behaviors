import { notifyGmOfNewSelections } from "../broadcast/broadcast";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { BEHAVIOR_REGISTRY } from "./BehaviorRegistry";

export function watchSelection() {
    return usePlayerStorage.subscribe(
        (store) => store.selection,
        (selection, previousSelection) => {
            const deselectedSet = new Set(previousSelection);
            const newlySelectedSet = new Set(selection);

            previousSelection.forEach((item) => {
                newlySelectedSet.delete(item);
            });

            selection.forEach((item) => deselectedSet.delete(item));

            if (usePlayerStorage.getState().role === "GM") {
                BEHAVIOR_REGISTRY.handleNewSelection(
                    newlySelectedSet,
                    deselectedSet,
                );
            } else {
                void notifyGmOfNewSelections(newlySelectedSet, deselectedSet);
            }
        },
    );
}
