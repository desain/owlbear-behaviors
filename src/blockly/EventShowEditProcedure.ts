import * as Blockly from "blockly";

interface ShowEditProcedureJson extends Blockly.Events.AbstractEventJson {
    procedureId: string | null;
}

export function isShowEditProcedure(
    event: Blockly.Events.Abstract,
): event is EventShowEditProcedure {
    return event.type === EventShowEditProcedure.TYPE;
}

/**
 * Custom event to trigger the display of the new block modal
 */
export class EventShowEditProcedure extends Blockly.Events.Abstract {
    #procedureId: string | null;

    static readonly TYPE = "show_new_block_modal";

    override type = EventShowEditProcedure.TYPE;

    constructor(workspace: Blockly.Workspace, procedureId?: string) {
        super();
        this.workspaceId = workspace.id;
        this.recordUndo = false;
        this.group = Blockly.Events.getGroup();
        this.#procedureId = procedureId ?? null;
    }

    /**
     * Encode the event as JSON.
     * @returns JSON representation.
     */
    override toJson(): ShowEditProcedureJson {
        return {
            type: this.type,
            group: this.group,
            procedureId: this.#procedureId,
        };
    }

    /**
     * Decode the JSON event.
     * @param json JSON representation.
     */
    fromJson(json: ShowEditProcedureJson): void {
        this.type = json.type;
        this.group = json.group;
        this.isBlank = false;
        this.#procedureId = json.procedureId;
    }

    /**
     * Does this event record any change of state?
     * @returns False - technically it doesn't, but listeners don't get
     *          triggered if this returns true.
     */
    // eslint-disable-next-line class-methods-use-this
    override isNull = (): boolean => false;

    override isBlank = false;

    /**
     * Run the event.
     */
    override run = (): void => {
        void this;
        // This event doesn't actually change the workspace state
        // It's just used to trigger the modal display
    };

    getProcedureId(): string | null {
        return this.#procedureId;
    }
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT,
    EventShowEditProcedure.TYPE,
    EventShowEditProcedure,
);
