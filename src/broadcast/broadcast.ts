import OBR from "@owlbear-rodeo/sdk";
import { CHANNEL_MESSAGE } from "../constants";

export function installBroadcastListener() {
    return OBR.broadcast.onMessage(CHANNEL_MESSAGE, ({ data }) => {
        console.log("TODO do something with", data);
    });
}
