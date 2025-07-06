import OBR from "@owlbear-rodeo/sdk";

interface RunScriptMessage {
    readonly type: "RUN_SCRIPT";
    readonly name: string;
}

export const Codeo = {
    runScript: (scriptName: string): Promise<void> => {
        const message = {
            type: "RUN_SCRIPT",
            name: scriptName,
        } satisfies RunScriptMessage;

        return OBR.broadcast.sendMessage("com.desain.codeo/message", message, {
            destination: "LOCAL",
        });
    },
};
