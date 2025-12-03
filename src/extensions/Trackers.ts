import OBR, { type Player } from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";

const METADATA_KEY = "rodeo.owlbear.trackers/trackers";

interface Tracker {
    // readonly id: string;
    readonly name: string;
    readonly current: number;
    readonly max: number;
}

function isTracker(t: unknown): t is Tracker {
    return (
        isObject(t) &&
        "name" in t &&
        typeof t.name === "string" &&
        "current" in t &&
        typeof t.current === "number" &&
        "max" in t &&
        typeof t.max === "number"
    );
}

function isTrackerArray(ts: unknown): ts is Tracker[] {
    return Array.isArray(ts) && ts.every(isTracker);
}

async function getTracker(
    playerName: string,
    trackerName: string,
): Promise<Tracker | undefined> {
    const party: Pick<Player, "name" | "metadata">[] = [
        ...(await OBR.party.getPlayers()),
        {
            name: await OBR.player.getName(),
            metadata: await OBR.player.getMetadata(),
        },
    ];
    console.log(party);
    const trackers = party.find((p) => p.name === playerName)?.metadata?.[
        METADATA_KEY
    ];
    if (isTrackerArray(trackers)) {
        return trackers.find((t) => t.name === trackerName);
    } else {
        return undefined;
    }
}

export const Trackers = {
    getTrackerValue: async (
        playerName: string,
        trackerName: string,
    ): Promise<number | undefined> =>
        (await getTracker(playerName, trackerName))?.current,

    getTrackerMax: async (
        playerName: string,
        trackerName: string,
    ): Promise<number | undefined> =>
        (await getTracker(playerName, trackerName))?.max,
};
