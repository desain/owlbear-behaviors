import { isHexColor } from "owlbear-utils";
import { sendMessage } from "../broadcast/broadcast";
import { CONTROL_BEHAVIORS } from "./impl/control";
import { EXTENSIONS_BEHAVIORS } from "./impl/extensions";
import { LOOKS_BEHAVIORS } from "./impl/looks";
import { MOTION_BEHAVIORS } from "./impl/motion";
import { SENSING_BEHAVIORS } from "./impl/sensing";
import { SOUND_BEHAVIORS } from "./impl/sound";

export const BEHAVIORS_IMPL = {
    sendMessage,
    isHexColor,

    ...MOTION_BEHAVIORS,

    ...LOOKS_BEHAVIORS,

    ...SOUND_BEHAVIORS,

    ...CONTROL_BEHAVIORS,

    ...SENSING_BEHAVIORS,

    ...EXTENSIONS_BEHAVIORS,
};
