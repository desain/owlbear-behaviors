import * as Blockly from "blockly";

interface ShowCreateVariableJson extends Blockly.Events.AbstractEventJson {
    variableType: string;
}

export function isShowCreateVariable(
    event: Blockly.Events.Abstract,
): event is EventShowCreateVariable {
    return event.type === EventShowCreateVariable.TYPE;
}

/**
 * Custom event to trigger the display of the create variable modal
 */
export class EventShowCreateVariable extends Blockly.Events.Abstract {
    #variableType: string;

    static readonly TYPE = "show_create_variable_modal";

    override type = EventShowCreateVariable.TYPE;

    constructor(workspace: Blockly.Workspace, variableType: string) {
        super();
        this.workspaceId = workspace.id;
        this.recordUndo = false;
        this.group = Blockly.Events.getGroup();
        this.#variableType = variableType;
    }

    /**
     * Encode the event as JSON.
     * @returns JSON representation.
     */
    override toJson(): ShowCreateVariableJson {
        return {
            type: this.type,
            group: this.group,
            variableType: this.#variableType,
        };
    }

    /**
     * Decode the JSON event.
     * @param json JSON representation.
     */
    fromJson(json: ShowCreateVariableJson): void {
        this.type = json.type;
        this.group = json.group;
        this.isBlank = false;
        this.#variableType = json.variableType;
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

    getVariableType(): string {
        return this.#variableType;
    }
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT,
    EventShowCreateVariable.TYPE,
    EventShowCreateVariable,
);