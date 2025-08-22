import * as Blockly from "blockly";
import { beforeAll, describe, expect, it } from "vitest";
import { compileBehavior } from "../src/behaviors/compileBehavior";
import { BehaviorJavascriptGenerator } from "../src/blockly/BehaviorJavascriptGenerator";
import {
    BLOCK_GOTO,
    BLOCK_REPEAT,
    BLOCK_REPEAT_UNTIL,
} from "../src/blockly/blocks";
import { setupBlocklyGlobals } from "../src/blockly/setupBlocklyGlobals";

function checkCompiles(workspace: Blockly.Workspace) {
    const code = new BehaviorJavascriptGenerator().workspaceToCode(workspace);
    expect(typeof code).toBe("string");
    expect(code).not.toBe("");
    compileBehavior(String(code));
}

function addImmediatelyWith(
    workspace: Blockly.Workspace,
    blockType: Blockly.Block["type"],
) {
    const immediately = workspace.newBlock("event_immediately");
    const block = workspace.newBlock(blockType);
    expect(block.previousConnection).not.toBeNull();
    immediately.nextConnection?.connect(block.previousConnection!);
    return block;
}

describe("Blockly JavaScript Generation", () => {
    beforeAll(() => {
        setupBlocklyGlobals();
    });

    describe("control_repeat_until block", () => {
        it("should generate syntactically valid JavaScript for basic repeat until loop", () => {
            const workspace = new Blockly.Workspace();

            // Create the repeat until block
            const repeatBlock = addImmediatelyWith(
                workspace,
                BLOCK_REPEAT_UNTIL.type,
            );

            // Create a simple boolean condition block (true)
            const conditionBlock = workspace.newBlock("logic_boolean");
            conditionBlock.setFieldValue("TRUE", "BOOL");

            // Connect condition to the repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT_UNTIL.args0[0].name)
                ?.connection?.connect(conditionBlock.outputConnection!);

            // Should be syntactically valid JavaScript
            checkCompiles(workspace);
        });

        it("should handle empty condition gracefully", () => {
            const workspace = new Blockly.Workspace();

            // Create repeat block without connecting a condition
            addImmediatelyWith(workspace, BLOCK_REPEAT_UNTIL.type);

            // Should be syntactically valid JavaScript
            checkCompiles(workspace);
        });
    });

    describe("control_repeat block", () => {
        it("should generate syntactically valid JavaScript for basic repeat loop", () => {
            const workspace = new Blockly.Workspace();

            // Create the repeat block
            const repeatBlock = addImmediatelyWith(
                workspace,
                BLOCK_REPEAT.type,
            );

            // Create a number block for times (e.g., 5)
            const timesBlock = workspace.newBlock("math_number");
            timesBlock.setFieldValue("5", "NUM");
            expect(timesBlock.outputConnection).not.toBeNull();

            // Connect times to the repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT.args0[0].name)
                ?.connection?.connect(timesBlock.outputConnection!);

            checkCompiles(workspace);
        });

        it("should handle mathematical expressions for repeat count", () => {
            const workspace = new Blockly.Workspace();

            // Create the repeat block
            const repeatBlock = addImmediatelyWith(
                workspace,
                BLOCK_REPEAT.type,
            );

            // Create a math arithmetic block (e.g., 3 + 2)
            const mathBlock = workspace.newBlock("math_arithmetic");
            mathBlock.setFieldValue("ADD", "OP");

            // Create number blocks for the math operation
            const leftNumber = workspace.newBlock("math_number");
            leftNumber.setFieldValue("3", "NUM");
            const rightNumber = workspace.newBlock("math_number");
            rightNumber.setFieldValue("2", "NUM");

            // Connect numbers to math block
            mathBlock
                .getInput("A")
                ?.connection?.connect(leftNumber.outputConnection!);
            mathBlock
                .getInput("B")
                ?.connection?.connect(rightNumber.outputConnection!);

            // Connect math block to repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT.args0[0].name)
                ?.connection?.connect(mathBlock.outputConnection!);

            checkCompiles(workspace);
        });

        it("should handle empty times input gracefully", () => {
            const workspace = new Blockly.Workspace();
            addImmediatelyWith(workspace, BLOCK_REPEAT.type);
            checkCompiles(workspace);
        });
    });

    describe("motion blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "W[eE5Czq/sQ7+NW4EM02",
                                x: -150,
                                y: 230,
                                next: {
                                    block: {
                                        type: "motion_turnright",
                                        id: "cq!]N#[.}$0Txsn2T^b.",
                                        inputs: {
                                            DEGREES: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "%xW+;y-~d).1ohl;@@l5",
                                                    fields: {
                                                        NUM: 15,
                                                    },
                                                },
                                                block: {
                                                    type: "motion_direction",
                                                    id: "(x4JUBuyx00d!?#syVfd",
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "motion_glide_turnright",
                                                id: "Mjvl^KqSgE,SEoK_=%d-",
                                                inputs: {
                                                    DURATION: {
                                                        shadow: {
                                                            type: "math_number",
                                                            id: "F?VlgS15|(P)m8G8;Uc5",
                                                            fields: {
                                                                NUM: 1,
                                                            },
                                                        },
                                                    },
                                                    DEGREES: {
                                                        shadow: {
                                                            type: "math_number",
                                                            id: "oJjqU^@!S9^x{IE~OU4X",
                                                            fields: {
                                                                NUM: 90,
                                                            },
                                                        },
                                                        block: {
                                                            type: "motion_direction",
                                                            id: "inEd0]B|F^M7;w2vMMV/",
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "motion_turnleft",
                                                        id: "v{QQtcx{YCCkho*mc{mI",
                                                        inputs: {
                                                            DEGREES: {
                                                                shadow: {
                                                                    type: "math_number",
                                                                    id: "_T3~+Al$|gk3+#WUcTPP",
                                                                    fields: {
                                                                        NUM: 15,
                                                                    },
                                                                },
                                                                block: {
                                                                    type: "motion_direction",
                                                                    id: "Rk:-S0!04W3EPW}1I_@y",
                                                                },
                                                            },
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "motion_glide_turnleft",
                                                                id: "ohY=sgDR1apuqkyz1N[w",
                                                                inputs: {
                                                                    DURATION: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: "-J2aOd`0bNuwpo%qjTD.",
                                                                            fields: {
                                                                                NUM: 1,
                                                                            },
                                                                        },
                                                                    },
                                                                    DEGREES: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: ",Y^ILbWOEcaCaQ#j`,pc",
                                                                            fields: {
                                                                                NUM: 90,
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "motion_direction",
                                                                            id: "=^DaC`]3,@DUCYG-}:Y0",
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "motion_move_direction",
                                                                        id: "[iOq#Q;^2HJTdNm!,,w}",
                                                                        fields: {
                                                                            DIRECTION:
                                                                                "FORWARD",
                                                                            UNITS: "UNITS",
                                                                        },
                                                                        inputs: {
                                                                            AMOUNT: {
                                                                                shadow: {
                                                                                    type: "math_number",
                                                                                    id: "g]Z9~(Pf~*%Um.nR_o##",
                                                                                    fields: {
                                                                                        NUM: 1,
                                                                                    },
                                                                                },
                                                                                block: {
                                                                                    type: "motion_xposition",
                                                                                    id: "+[$foyUIbEV14-(z~jp:",
                                                                                },
                                                                            },
                                                                        },
                                                                        next: {
                                                                            block: {
                                                                                type: "motion_gotoxy",
                                                                                id: "XsuHpRm(IRR_4vGwp2@x",
                                                                                inputs: {
                                                                                    X: {
                                                                                        shadow: {
                                                                                            type: "math_number",
                                                                                            id: "$*t@DqwlO/lm/n45=C{z",
                                                                                            fields: {
                                                                                                NUM: -7479,
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "motion_xposition",
                                                                                            id: "%6@T!2V+?4YtuC;+9#YD",
                                                                                        },
                                                                                    },
                                                                                    Y: {
                                                                                        shadow: {
                                                                                            type: "math_number",
                                                                                            id: "4@FQGoe|jl)wU2JFX#JB",
                                                                                            fields: {
                                                                                                NUM: 0,
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "motion_yposition",
                                                                                            id: "d.sNVw|iaiKXfk9!`vg9",
                                                                                        },
                                                                                    },
                                                                                },
                                                                                next: {
                                                                                    block: {
                                                                                        type: "motion_glidesecstoxy",
                                                                                        id: "AUiEmSBcL6P{wAckoLWj",
                                                                                        inputs: {
                                                                                            DURATION:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "8^Wj?IM7BXuEo4jK~ft^",
                                                                                                        fields: {
                                                                                                            NUM: 1,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            X: {
                                                                                                shadow: {
                                                                                                    type: "math_number",
                                                                                                    id: "IR]u,7v5?=~wzQfj-X_i",
                                                                                                    fields: {
                                                                                                        NUM: -7179,
                                                                                                    },
                                                                                                },
                                                                                                block: {
                                                                                                    type: "motion_xposition",
                                                                                                    id: "o@|i}6y)Z[`.w=|EZ,rW",
                                                                                                },
                                                                                            },
                                                                                            Y: {
                                                                                                shadow: {
                                                                                                    type: "math_number",
                                                                                                    id: "L=wpks1|CQ}t^X:hiv~w",
                                                                                                    fields: {
                                                                                                        NUM: 0,
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "motion_snap",
                                                                                                id: "b4i5/E5A9I;gF1.iw#=x",
                                                                                                next: {
                                                                                                    block: {
                                                                                                        type: "motion_pointindirection",
                                                                                                        id: ".4aRT{A~;$M2U~qfr]ja",
                                                                                                        inputs: {
                                                                                                            DIRECTION:
                                                                                                                {
                                                                                                                    shadow: {
                                                                                                                        type: "math_angle",
                                                                                                                        id: "m70rs2Rm9iIey,_-#S]R",
                                                                                                                        fields: {
                                                                                                                            NUM: 0,
                                                                                                                        },
                                                                                                                    },
                                                                                                                    block: {
                                                                                                                        type: "motion_direction",
                                                                                                                        id: "q1?{,@+NWjM5]XC]we?z",
                                                                                                                    },
                                                                                                                },
                                                                                                        },
                                                                                                        next: {
                                                                                                            block: {
                                                                                                                type: "motion_pointtowards",
                                                                                                                id: "N~35dEn+(6ic}S}pm4jM",
                                                                                                                inputs: {
                                                                                                                    TARGET: {
                                                                                                                        block: {
                                                                                                                            type: "motion_my_parent",
                                                                                                                            id: "Y]Djea!]BU_rf4_tuV}r",
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                                next: {
                                                                                                                    block: {
                                                                                                                        type: "motion_attach",
                                                                                                                        id: "Y^/qO5^yedd=P$TO5e%/",
                                                                                                                        next: {
                                                                                                                            block: {
                                                                                                                                type: "motion_detach",
                                                                                                                                id: "SgT]`2-m,{qy92:+A1Xz",
                                                                                                                                next: {
                                                                                                                                    block: {
                                                                                                                                        type: "looks_lock",
                                                                                                                                        id: "%A7[%,l@2zw_(e1JLpIQ",
                                                                                                                                        next: {
                                                                                                                                            block: {
                                                                                                                                                type: "looks_unlock",
                                                                                                                                                id: "}Uor8V**{G~8#UwFKnfP",
                                                                                                                                                next: {
                                                                                                                                                    block: {
                                                                                                                                                        type: "control_behavior_if",
                                                                                                                                                        id: "[)tE8O2*N@8($2:/Oyl3",
                                                                                                                                                        inputs: {
                                                                                                                                                            CONDITION:
                                                                                                                                                                {
                                                                                                                                                                    block: {
                                                                                                                                                                        type: "logic_operation",
                                                                                                                                                                        id: ":zLG|k(0)p]vk*if8Dx5",
                                                                                                                                                                        fields: {
                                                                                                                                                                            OP: "AND",
                                                                                                                                                                        },
                                                                                                                                                                        inputs: {
                                                                                                                                                                            A: {
                                                                                                                                                                                block: {
                                                                                                                                                                                    type: "motion_attached",
                                                                                                                                                                                    id: "|=G-#x@0b6G}}p%o.`F@",
                                                                                                                                                                                },
                                                                                                                                                                            },
                                                                                                                                                                            B: {
                                                                                                                                                                                block: {
                                                                                                                                                                                    type: "looks_locked",
                                                                                                                                                                                    id: "ZbhEj)%1Z~Fk]2:%p*E(",
                                                                                                                                                                                },
                                                                                                                                                                            },
                                                                                                                                                                        },
                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("sound blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "%eZ2EpjBglEfkEWnZ1J+",
                                x: 490,
                                y: 510,
                                next: {
                                    block: {
                                        type: "sound_play",
                                        id: "ygo#BZYJrw}{R-|QM2zi",
                                        inputs: {
                                            SOUND: {
                                                shadow: {
                                                    type: "menu_sound",
                                                    id: "~y)dM=QN.e0O982Tl-bF",
                                                    fields: {
                                                        FIELD_SOUND: "meow",
                                                    },
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "sound_playuntildone",
                                                id: "[3L{{OGaKXb?dojD%y~R",
                                                inputs: {
                                                    SOUND: {
                                                        shadow: {
                                                            type: "menu_sound",
                                                            id: "tnF_%ru[/WR8otiu.]WM",
                                                            fields: {
                                                                FIELD_SOUND:
                                                                    "meow",
                                                            },
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "sound_stopallsounds",
                                                        id: "[6sVN+*Y{W?vR_9Nqy]6",
                                                        next: {
                                                            block: {
                                                                type: "sound_changevolumeby",
                                                                id: ",-.8hU=x?m6*|Ao%4Q.Y",
                                                                inputs: {
                                                                    VOLUME: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: "!pO-aUTBK[i{V6up},)b",
                                                                            fields: {
                                                                                NUM: -10,
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "motion_xposition",
                                                                            id: "fSs{_8N;)={F,z)3T30v",
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "sound_setvolumeto",
                                                                        id: "hu7Pu-c97W7j4Bw3LwB!",
                                                                        inputs: {
                                                                            VOLUME: {
                                                                                shadow: {
                                                                                    type: "math_number",
                                                                                    id: "c5TdqY{}tDpeYD/:Ec*8",
                                                                                    fields: {
                                                                                        NUM: 100,
                                                                                    },
                                                                                },
                                                                                block: {
                                                                                    type: "motion_xposition",
                                                                                    id: "x,$*Uib.T1M~gZGyNqb)",
                                                                                },
                                                                            },
                                                                        },
                                                                        next: {
                                                                            block: {
                                                                                type: "looks_sayforsecs",
                                                                                id: ")4+jBgjWM4r]q1bsoInq",
                                                                                inputs: {
                                                                                    MESSAGE:
                                                                                        {
                                                                                            shadow: {
                                                                                                type: "behavior_dynamic_val",
                                                                                                id: "JIG{@`qOp(U1?DtV[h-e",
                                                                                                fields: {
                                                                                                    TEXT: "Hello!",
                                                                                                },
                                                                                            },
                                                                                            block: {
                                                                                                type: "sound_volume",
                                                                                                id: "Cu3T0cw:W|*a-%Z@_tL~",
                                                                                            },
                                                                                        },
                                                                                    SECS: {
                                                                                        shadow: {
                                                                                            type: "math_number",
                                                                                            id: "5Je;,eDgeC(iUCLp4!!b",
                                                                                            fields: {
                                                                                                NUM: 2,
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("looks blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "W[eE5Czq/sQ7+NW4EM02",
                                x: -150,
                                y: 230,
                                next: {
                                    block: {
                                        type: "looks_sayforsecs",
                                        id: "]apy+p2g+]8K+f5iHYXY",
                                        inputs: {
                                            MESSAGE: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "jhhKFE_2|WX`6PElN]om",
                                                    fields: {
                                                        TEXT: "Hello!",
                                                    },
                                                },
                                                block: {
                                                    type: "looks_get_label",
                                                    id: "]=.D31gTfYHviEzWi31Y",
                                                },
                                            },
                                            SECS: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "$ERMd8HnqqRp;fC[t2*|",
                                                    fields: {
                                                        NUM: 2,
                                                    },
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "looks_replace_image",
                                                id: "w!m)Rb`NiAtOnNv(!2dA",
                                                fields: {
                                                    IMAGE: {
                                                        image: {
                                                            width: 150,
                                                            height: 150,
                                                            mime: "image/png",
                                                            url: "https://owlbear-behaviors.pages.dev/default.png",
                                                        },
                                                        grid: {
                                                            dpi: 150,
                                                            offset: {
                                                                x: 0,
                                                                y: 0,
                                                            },
                                                        },
                                                        imageName:
                                                            "Click to change",
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "looks_setsizeto",
                                                        id: "d9#1)-{m.`ls4;1YtB}K",
                                                        inputs: {
                                                            SIZE: {
                                                                shadow: {
                                                                    type: "math_number",
                                                                    id: "|.301}L~o|*1GoKS;._r",
                                                                    fields: {
                                                                        NUM: 100,
                                                                    },
                                                                },
                                                                block: {
                                                                    type: "looks_size",
                                                                    id: "p+ps$YF1[!I+b()$r@C|",
                                                                },
                                                            },
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "looks_changesizeby",
                                                                id: "%bfC.:`V~{w}Xo7xc(WK",
                                                                inputs: {
                                                                    CHANGE: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: "/tnV0{YDEz`/RDgLqEnM",
                                                                            fields: {
                                                                                NUM: 10,
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "looks_size",
                                                                            id: "!A/Ts6olAEh-aA}1L.zK",
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "looks_show",
                                                                        id: "/!a]Shlg~Pr1x$krhtlM",
                                                                        next: {
                                                                            block: {
                                                                                type: "looks_hide",
                                                                                id: "QIkU?:(:RGlu2pf@(z~x",
                                                                                next: {
                                                                                    block: {
                                                                                        type: "looks_set_layer",
                                                                                        id: "|?Iyi4X2lk1jskzCLpwL",
                                                                                        inputs: {
                                                                                            LAYER: {
                                                                                                shadow: {
                                                                                                    type: "menu_layer",
                                                                                                    id: ";]B,syA1MCOsYH?S__Z@",
                                                                                                    fields: {
                                                                                                        LAYER: "CHARACTER",
                                                                                                    },
                                                                                                },
                                                                                                block: {
                                                                                                    type: "looks_get_layer",
                                                                                                    id: "PmThd?PDLk9|Jdea4?Dg",
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "looks_set_label",
                                                                                                id: "6k*yFM[Hd3l*7=7QPv~+",
                                                                                                inputs: {
                                                                                                    LABEL: {
                                                                                                        shadow: {
                                                                                                            type: "behavior_dynamic_val",
                                                                                                            id: "Qtuow/p)Kx@(H`J^CkAo",
                                                                                                            fields: {
                                                                                                                TEXT: "Undead A",
                                                                                                            },
                                                                                                        },
                                                                                                        block: {
                                                                                                            type: "looks_get_label",
                                                                                                            id: "N*vMhH4uiAds577*15KW",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                                next: {
                                                                                                    block: {
                                                                                                        type: "looks_set_name",
                                                                                                        id: "~N=XLZoJysoee;/2^C1f",
                                                                                                        inputs: {
                                                                                                            NAME: {
                                                                                                                shadow: {
                                                                                                                    type: "behavior_dynamic_val",
                                                                                                                    id: "(8,O(Zm8ahw2H[2|pNRY",
                                                                                                                    fields: {
                                                                                                                        TEXT: "Undead",
                                                                                                                    },
                                                                                                                },
                                                                                                                block: {
                                                                                                                    type: "looks_get_name",
                                                                                                                    id: "CJ[e~V:nrzL!WBPPfj=w",
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                        next: {
                                                                                                            block: {
                                                                                                                type: "looks_set_description",
                                                                                                                id: "0u.]h0KBbD?tM|cW9rbq",
                                                                                                                inputs: {
                                                                                                                    DESCRIPTION:
                                                                                                                        {
                                                                                                                            shadow: {
                                                                                                                                type: "behavior_dynamic_val",
                                                                                                                                id: "304Xe4@!?WFr^U?8{pz/",
                                                                                                                                fields: {
                                                                                                                                    TEXT: "",
                                                                                                                                },
                                                                                                                            },
                                                                                                                            block: {
                                                                                                                                type: "looks_get_description",
                                                                                                                                id: "G1KfaE/R]gXQq[ga=h;=",
                                                                                                                            },
                                                                                                                        },
                                                                                                                },
                                                                                                                next: {
                                                                                                                    block: {
                                                                                                                        type: "looks_set_viewport",
                                                                                                                        id: "m{.UNPIQ22`Kz!jfeh#n",
                                                                                                                        fields: {
                                                                                                                            TARGET: "MY",
                                                                                                                        },
                                                                                                                        inputs: {
                                                                                                                            X: {
                                                                                                                                shadow: {
                                                                                                                                    type: "math_number",
                                                                                                                                    id: "@o;-%`0se8pJ*+?78oD2",
                                                                                                                                    fields: {
                                                                                                                                        NUM: -7179,
                                                                                                                                    },
                                                                                                                                },
                                                                                                                                block: {
                                                                                                                                    type: "looks_size",
                                                                                                                                    id: "tu_is+[c;!hMS{oWfEnD",
                                                                                                                                },
                                                                                                                            },
                                                                                                                            Y: {
                                                                                                                                shadow: {
                                                                                                                                    type: "math_number",
                                                                                                                                    id: "ybd(v_,bWG$-7TLto%0U",
                                                                                                                                    fields: {
                                                                                                                                        NUM: 750,
                                                                                                                                    },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                        next: {
                                                                                                                            block: {
                                                                                                                                type: "control_behavior_if",
                                                                                                                                id: "N,rd_|V*6L=$ty#K|Bm/",
                                                                                                                                inputs: {
                                                                                                                                    CONDITION:
                                                                                                                                        {
                                                                                                                                            block: {
                                                                                                                                                type: "looks_visible",
                                                                                                                                                id: "*oXghBDhv~`8Px4die$N",
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                    SUBSTACK:
                                                                                                                                        {
                                                                                                                                            block: {
                                                                                                                                                type: "looks_changeeffectby",
                                                                                                                                                id: "!U]YjqU6|)@7@|x7yT@V",
                                                                                                                                                fields: {
                                                                                                                                                    EFFECT: "monochrome",
                                                                                                                                                },
                                                                                                                                                inputs: {
                                                                                                                                                    VALUE: {
                                                                                                                                                        shadow: {
                                                                                                                                                            type: "math_number",
                                                                                                                                                            id: "(H[N)gh$cPTi_wR}^Q{_",
                                                                                                                                                            fields: {
                                                                                                                                                                NUM: 25,
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                                next: {
                                                                                                                                                    block: {
                                                                                                                                                        type: "looks_seteffectto",
                                                                                                                                                        id: "K`brO7}D(8i:Dh.xaG/B",
                                                                                                                                                        fields: {
                                                                                                                                                            EFFECT: "monochrome",
                                                                                                                                                        },
                                                                                                                                                        inputs: {
                                                                                                                                                            VALUE: {
                                                                                                                                                                shadow: {
                                                                                                                                                                    type: "math_number",
                                                                                                                                                                    id: "QvPaxt:J!Sc)`k`_:^m)",
                                                                                                                                                                    fields: {
                                                                                                                                                                        NUM: 100,
                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                        next: {
                                                                                                                                                            block: {
                                                                                                                                                                type: "looks_cleargraphiceffects",
                                                                                                                                                                id: "#eQ9T,))ipjs$sgC1*SV",
                                                                                                                                                                next: {
                                                                                                                                                                    block: {
                                                                                                                                                                        type: "looks_set_fill_color",
                                                                                                                                                                        id: "}${n[wj*)X/B1S(u?~sA",
                                                                                                                                                                        inputs: {
                                                                                                                                                                            COLOUR: {
                                                                                                                                                                                shadow: {
                                                                                                                                                                                    type: "color_hsv_sliders",
                                                                                                                                                                                    id: "R}Eo]z1p~q5:DZJ!5Wf9",
                                                                                                                                                                                    fields: {
                                                                                                                                                                                        COLOR: "#1a6aff",
                                                                                                                                                                                    },
                                                                                                                                                                                },
                                                                                                                                                                                block: {
                                                                                                                                                                                    type: "looks_get_fill_color",
                                                                                                                                                                                    id: "7PHX]a-sd3WC%o;PM*7}",
                                                                                                                                                                                },
                                                                                                                                                                            },
                                                                                                                                                                        },
                                                                                                                                                                        next: {
                                                                                                                                                                            block: {
                                                                                                                                                                                type: "looks_set_fill_opacity",
                                                                                                                                                                                id: "ga$D#b*@5w`~|f#Rz8{,",
                                                                                                                                                                                inputs: {
                                                                                                                                                                                    OPACITY:
                                                                                                                                                                                        {
                                                                                                                                                                                            shadow: {
                                                                                                                                                                                                type: "looks_opacity_slider",
                                                                                                                                                                                                id: "@opt7Nk*wU[3e;t~g[kP",
                                                                                                                                                                                                fields: {
                                                                                                                                                                                                    OPACITY: 0,
                                                                                                                                                                                                },
                                                                                                                                                                                            },
                                                                                                                                                                                            block: {
                                                                                                                                                                                                type: "looks_get_fill_opacity",
                                                                                                                                                                                                id: "!fP86dgQqPey-RuxL=b6",
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                },
                                                                                                                                                                                next: {
                                                                                                                                                                                    block: {
                                                                                                                                                                                        type: "looks_set_stroke_color",
                                                                                                                                                                                        id: "o_f$C(v($;xA3r1D_+]8",
                                                                                                                                                                                        inputs: {
                                                                                                                                                                                            COLOR: {
                                                                                                                                                                                                shadow: {
                                                                                                                                                                                                    type: "color_hsv_sliders",
                                                                                                                                                                                                    id: "U3ejx;WhC%$Gl7c$p1td",
                                                                                                                                                                                                    fields: {
                                                                                                                                                                                                        COLOR: "#1a6aff",
                                                                                                                                                                                                    },
                                                                                                                                                                                                },
                                                                                                                                                                                                block: {
                                                                                                                                                                                                    type: "looks_get_stroke_color",
                                                                                                                                                                                                    id: "bE/n0$I^h@BhIFPu4wWH",
                                                                                                                                                                                                },
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                        next: {
                                                                                                                                                                                            block: {
                                                                                                                                                                                                type: "looks_set_stroke_opacity",
                                                                                                                                                                                                id: "9=ii]n8+G.2.BOTCPVW0",
                                                                                                                                                                                                inputs: {
                                                                                                                                                                                                    OPACITY:
                                                                                                                                                                                                        {
                                                                                                                                                                                                            shadow: {
                                                                                                                                                                                                                type: "looks_opacity_slider",
                                                                                                                                                                                                                id: "M0zE{e`s81z#o|O1OcmT",
                                                                                                                                                                                                                fields: {
                                                                                                                                                                                                                    OPACITY: 100,
                                                                                                                                                                                                                },
                                                                                                                                                                                                            },
                                                                                                                                                                                                            block: {
                                                                                                                                                                                                                type: "looks_get_stroke_opacity",
                                                                                                                                                                                                                id: "z/:L$JeXcXx_GTmbI(^m",
                                                                                                                                                                                                            },
                                                                                                                                                                                                        },
                                                                                                                                                                                                },
                                                                                                                                                                                                next: {
                                                                                                                                                                                                    block: {
                                                                                                                                                                                                        type: "looks_set_zoom",
                                                                                                                                                                                                        id: "zoom_test_block_id",
                                                                                                                                                                                                        fields: {
                                                                                                                                                                                                            TARGET: "MY",
                                                                                                                                                                                                        },
                                                                                                                                                                                                        inputs: {
                                                                                                                                                                                                            ZOOM: {
                                                                                                                                                                                                                shadow: {
                                                                                                                                                                                                                    type: "math_number",
                                                                                                                                                                                                                    id: "zoom_test_input_id",
                                                                                                                                                                                                                    fields: {
                                                                                                                                                                                                                        NUM: 100,
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                },
                                                                                                                                                                                                            },
                                                                                                                                                                                                        },
                                                                                                                                                                                                    },
                                                                                                                                                                                                },
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                    },
                                                                                                                                                                                },
                                                                                                                                                                            },
                                                                                                                                                                        },
                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("control blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "control_start_as_clone",
                                id: ")VDQ,@V`Ik]]E0sjsW*]",
                                x: 130,
                                y: 230,
                                next: {
                                    block: {
                                        type: "control_wait",
                                        id: "$.N.f;h8QmW*z]qrA(c+",
                                        inputs: {
                                            DURATION: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "1jY|u]`q_I5UawnZ,l4T",
                                                    fields: {
                                                        NUM: 1,
                                                    },
                                                },
                                                block: {
                                                    type: "motion_xposition",
                                                    id: "cri1[;M=:@D-,jN[EB!x",
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "control_repeat",
                                                id: "sf2}Y)6zZsCsF#K}:ZiI",
                                                inputs: {
                                                    TIMES: {
                                                        shadow: {
                                                            type: "math_number",
                                                            id: "%wPg=R#CyE9HaYEhFm}e",
                                                            fields: {
                                                                NUM: 5,
                                                            },
                                                        },
                                                        block: {
                                                            type: "motion_xposition",
                                                            id: "ID1]F.W(PB=vy;O}yA/J",
                                                        },
                                                    },
                                                    SUBSTACK: {
                                                        block: {
                                                            type: "control_forever",
                                                            id: ":(^cH9/2wm(6i_%Xz3Du",
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "control_behavior_if",
                                                        id: "!?foXon%_}gu?o]gjwOf",
                                                        inputs: {
                                                            CONDITION: {
                                                                block: {
                                                                    type: "looks_locked",
                                                                    id: "@{Lq=i|vf+2NPoR?)awj",
                                                                },
                                                            },
                                                            SUBSTACK: {
                                                                block: {
                                                                    type: "control_behavior_stop",
                                                                    id: "/~xQfqACr([_~(Kq849w",
                                                                    fields: {
                                                                        STOP_TARGET:
                                                                            "OTHER_SCRIPTS",
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "control_behavior_if_else",
                                                                id: "??)-4A4AZD=TxQ|+=_Hs",
                                                                inputs: {
                                                                    CONDITION: {
                                                                        block: {
                                                                            type: "looks_locked",
                                                                            id: "h]ibGOyF6~YGxOkTq,p`",
                                                                        },
                                                                    },
                                                                    SUBSTACK: {
                                                                        block: {
                                                                            type: "control_behavior_stop",
                                                                            id: "9|.u9w?!pKI7-~M4hA|*",
                                                                            fields: {
                                                                                STOP_TARGET:
                                                                                    "THIS_SCRIPT",
                                                                            },
                                                                        },
                                                                    },
                                                                    SUBSTACK2: {
                                                                        block: {
                                                                            type: "control_behavior_stop",
                                                                            id: "~B^;6`n^Ce/G1`;e`0(e",
                                                                            fields: {
                                                                                STOP_TARGET:
                                                                                    "ALL",
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "control_wait_until",
                                                                        id: "9s8*x/4*NJ8tU=(rn~*^",
                                                                        inputs: {
                                                                            CONDITION:
                                                                                {
                                                                                    block: {
                                                                                        type: "looks_locked",
                                                                                        id: "{$K8S4Y.P(O81uq?.OSy",
                                                                                    },
                                                                                },
                                                                        },
                                                                        next: {
                                                                            block: {
                                                                                type: "control_repeat_until",
                                                                                id: "xB+W:*iIIYlp-`~)a2da",
                                                                                inputs: {
                                                                                    CONDITION:
                                                                                        {
                                                                                            block: {
                                                                                                type: "looks_locked",
                                                                                                id: ";Qgn1uNbc:h0gI5nU~3d",
                                                                                            },
                                                                                        },
                                                                                    SUBSTACK:
                                                                                        {
                                                                                            block: {
                                                                                                type: "control_delete_this",
                                                                                                id: "0i=DyD!Q{Uxb$#=o-^q`",
                                                                                            },
                                                                                        },
                                                                                },
                                                                                next: {
                                                                                    block: {
                                                                                        type: "control_create_clone_of",
                                                                                        id: "j.NS*%_0:$F3rMMzq:Ej",
                                                                                        inputs: {
                                                                                            ITEM: {
                                                                                                shadow: {
                                                                                                    type: "control_menu_item",
                                                                                                    id: "b(}H}!5vX|4S][MHCsZ5",
                                                                                                    fields: {
                                                                                                        ITEM: "MYSELF",
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "control_behavior_stop",
                                                                                                id: "9VOuRgcfyH`qM}~vvhe)",
                                                                                                fields: {
                                                                                                    STOP_TARGET:
                                                                                                        "ALL",
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("sensing blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "tj?+sK_qF7L3?u0`bIx0",
                                x: 28,
                                y: 17,
                                next: {
                                    block: {
                                        type: "sensing_tag",
                                        id: "A#USw2YL7%spidH;/i!a",
                                        inputs: {
                                            TARGET: {
                                                shadow: {
                                                    type: "menu_item",
                                                    id: "Ha+MNN]JiN@5Do|N]ueZ",
                                                    fields: {
                                                        ITEM: "MYSELF",
                                                    },
                                                },
                                            },
                                            INPUT_TAG: {
                                                shadow: {
                                                    type: "menu_tag",
                                                    id: "#HDDhJ`9!gfJ?lUx%4VC",
                                                    fields: {
                                                        FIELD_TAG: "player",
                                                    },
                                                },
                                                block: {
                                                    type: "looks_get_label",
                                                    id: "bC]~0t!)qENpq@{OJ)b~",
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "sensing_remove_tag",
                                                id: "G9W!VN-jIN1c-S}rUSIz",
                                                inputs: {
                                                    TARGET: {
                                                        shadow: {
                                                            type: "menu_item",
                                                            id: "F~4R$Px;R=4,4QQ696Zf",
                                                            fields: {
                                                                ITEM: "MYSELF",
                                                            },
                                                        },
                                                    },
                                                    INPUT_TAG: {
                                                        shadow: {
                                                            type: "menu_tag",
                                                            id: ".WnW#]NUYC3ykg+dQ;sg",
                                                            fields: {
                                                                FIELD_TAG:
                                                                    "player",
                                                            },
                                                        },
                                                        block: {
                                                            type: "looks_get_label",
                                                            id: "=h4$@a0%i6e/`G[Ofy{v",
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "sensing_deselect",
                                                        id: "q!J/Y1@fgogzo$~gE;$j",
                                                        fields: {
                                                            TARGET: "THIS",
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "control_behavior_if",
                                                                id: "R!#U^dw2o(U9RgvxeO%D",
                                                                inputs: {
                                                                    CONDITION: {
                                                                        block: {
                                                                            type: "logic_operation",
                                                                            id: "JRuE*x(RI/NNE2(x)(;P",
                                                                            fields: {
                                                                                OP: "AND",
                                                                            },
                                                                            inputs: {
                                                                                A: {
                                                                                    block: {
                                                                                        type: "sensing_has_tag_self",
                                                                                        id: "Z/a7cMXzN7etB%4o,4FB",
                                                                                        inputs: {
                                                                                            INPUT_TAG:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "menu_tag",
                                                                                                        id: "Gw6d6D}@6=B`Q%ri]UM*",
                                                                                                        fields: {
                                                                                                            FIELD_TAG:
                                                                                                                "player",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "looks_get_label",
                                                                                                        id: "gxq?!;i(W3!x1-Q(v^1w",
                                                                                                    },
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                                B: {
                                                                                    block: {
                                                                                        type: "sensing_touchingobject",
                                                                                        id: "vOq=!HY(9BscS|#Bbh1L",
                                                                                        inputs: {
                                                                                            ITEM: {
                                                                                                block: {
                                                                                                    type: "sensing_closest_tagged",
                                                                                                    id: "-utly8HP)}]~1}@j01=1",
                                                                                                    inputs: {
                                                                                                        INPUT_TAG:
                                                                                                            {
                                                                                                                shadow: {
                                                                                                                    type: "menu_tag",
                                                                                                                    fields: {
                                                                                                                        FIELD_TAG:
                                                                                                                            "player",
                                                                                                                    },
                                                                                                                },
                                                                                                                block: {
                                                                                                                    type: "looks_get_label",
                                                                                                                    id: "V,x;8)$MU{1DrCr8*4j+",
                                                                                                                },
                                                                                                            },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    SUBSTACK: {
                                                                        block: {
                                                                            type: "looks_sayforsecs",
                                                                            id: "+zbxBE^RB]k{r/Q?JN3J",
                                                                            inputs: {
                                                                                MESSAGE:
                                                                                    {
                                                                                        shadow: {
                                                                                            type: "behavior_dynamic_val",
                                                                                            id: "u.R5WDCyLZ])n5H@[5#;",
                                                                                            fields: {
                                                                                                TEXT: "Hello!",
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "math_arithmetic",
                                                                                            id: "Pd~`P_;ufZQJel((#lmL",
                                                                                            fields: {
                                                                                                OP: "ADD",
                                                                                            },
                                                                                            inputs: {
                                                                                                A: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "C1?mgD7.KkSf@pnQJOI.",
                                                                                                        fields: {
                                                                                                            NUM: 0,
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "sensing_distanceto",
                                                                                                        id: "ecb#rW/)_Y9;YgW.V#9f",
                                                                                                        inputs: {
                                                                                                            ITEM: {
                                                                                                                block: {
                                                                                                                    type: "sensing_closest_tagged",
                                                                                                                    id: "ohl6P%J!(;]K|bO:oaau",
                                                                                                                    inputs: {
                                                                                                                        INPUT_TAG:
                                                                                                                            {
                                                                                                                                shadow: {
                                                                                                                                    type: "menu_tag",
                                                                                                                                    id: "SUjF#LRAEMpq0}8r6^nc",
                                                                                                                                    fields: {
                                                                                                                                        FIELD_TAG:
                                                                                                                                            "player",
                                                                                                                                    },
                                                                                                                                },
                                                                                                                                block: {
                                                                                                                                    type: "looks_get_label",
                                                                                                                                    id: "gnFCl;s3sQQo[N{.=jHw",
                                                                                                                                },
                                                                                                                            },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                                B: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "*7t!pGDXSseMzwCyD`E.",
                                                                                                        fields: {
                                                                                                            NUM: 0,
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "math_arithmetic",
                                                                                                        id: "Xk`X_t66}~f=uiHs~YV$",
                                                                                                        fields: {
                                                                                                            OP: "ADD",
                                                                                                        },
                                                                                                        inputs: {
                                                                                                            A: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "C1?mgD7.KkSf@pnQJOI.",
                                                                                                                    fields: {
                                                                                                                        NUM: 0,
                                                                                                                    },
                                                                                                                },
                                                                                                                block: {
                                                                                                                    type: "sensing_of",
                                                                                                                    id: "62.jUT!b6h[}R`@Q~T_l",
                                                                                                                    fields: {
                                                                                                                        PROPERTY:
                                                                                                                            "X_POSITION",
                                                                                                                    },
                                                                                                                    inputs: {
                                                                                                                        ITEM: {
                                                                                                                            shadow: {
                                                                                                                                type: "menu_item",
                                                                                                                                id: "R/T2/G,zS)vr_{9?lNP]",
                                                                                                                                fields: {
                                                                                                                                    ITEM: "MYSELF",
                                                                                                                                },
                                                                                                                            },
                                                                                                                            block: {
                                                                                                                                type: "sensing_closest_tagged",
                                                                                                                                id: "wQ)Ra(Q9zV,s8zwui;gk",
                                                                                                                                inputs: {
                                                                                                                                    INPUT_TAG:
                                                                                                                                        {
                                                                                                                                            shadow: {
                                                                                                                                                type: "menu_tag",
                                                                                                                                                id: "hf10WhK|bJ;y`tih=DU7",
                                                                                                                                                fields: {
                                                                                                                                                    FIELD_TAG:
                                                                                                                                                        "player",
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                            block: {
                                                                                                                                                type: "looks_get_label",
                                                                                                                                                id: "3R:mp{pe9EowJ1XY!(4M",
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                            B: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "Je`(*{tkGR7Im-BF^X|M",
                                                                                                                    fields: {
                                                                                                                        NUM: 0,
                                                                                                                    },
                                                                                                                },
                                                                                                                block: {
                                                                                                                    type: "sensing_current_time",
                                                                                                                    id: "dW#mz!#zwYhG%Sq6dp@S",
                                                                                                                    fields: {
                                                                                                                        UNIT: "YEAR",
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                SECS: {
                                                                                    shadow: {
                                                                                        type: "math_number",
                                                                                        id: "PeMZlDJl9PT!1iDa!D+`",
                                                                                        fields: {
                                                                                            NUM: 2,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("operator blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "tj?+sK_qF7L3?u0`bIx0",
                                x: -350,
                                y: 130,
                                next: {
                                    block: {
                                        type: "control_behavior_if",
                                        id: "h~a^GEhy=}ws#l(zi/81",
                                        inputs: {
                                            CONDITION: {
                                                block: {
                                                    type: "logic_operation",
                                                    id: ";9~{?,7GY0=@[tv;0r4J",
                                                    fields: {
                                                        OP: "OR",
                                                    },
                                                    inputs: {
                                                        A: {
                                                            block: {
                                                                type: "logic_operation",
                                                                id: "NH~2e]+u;p{89P%y?ZDE",
                                                                fields: {
                                                                    OP: "AND",
                                                                },
                                                                inputs: {
                                                                    A: {
                                                                        block: {
                                                                            type: "logic_operation",
                                                                            id: "@r5SrN8[opBW1_|Pc8D3",
                                                                            fields: {
                                                                                OP: "AND",
                                                                            },
                                                                            inputs: {
                                                                                A: {
                                                                                    block: {
                                                                                        type: "operator_gt",
                                                                                        id: "^2#]wUa2x)+!YWmsdR;z",
                                                                                        inputs: {
                                                                                            OPERAND1:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "piiL;o:jwklq^#+/`whz",
                                                                                                        fields: {
                                                                                                            TEXT: "",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "math_arithmetic",
                                                                                                        id: "eN3+yuC@)Q0Z@RP9Chpg",
                                                                                                        fields: {
                                                                                                            OP: "ADD",
                                                                                                        },
                                                                                                        inputs: {
                                                                                                            A: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "),]^#:XMbsBCmxL|n[;r",
                                                                                                                    fields: {
                                                                                                                        NUM: 0,
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                            B: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "Wn;6Hc{qe^0|8T:;Z53I",
                                                                                                                    fields: {
                                                                                                                        NUM: 0,
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            OPERAND2:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "*FE27Eu|#Y0lgKL(mX=w",
                                                                                                        fields: {
                                                                                                            TEXT: "",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "math_random_int",
                                                                                                        id: "Tw,q1zP*U26D@R4(7O$5",
                                                                                                        inputs: {
                                                                                                            FROM: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "`Q+5PO?k{z#*`+5w.Usf",
                                                                                                                    fields: {
                                                                                                                        NUM: 1,
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                            TO: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "lH%rzl@JhB[0CPGqg70l",
                                                                                                                    fields: {
                                                                                                                        NUM: 10,
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                                B: {
                                                                                    block: {
                                                                                        type: "operator_lt",
                                                                                        id: "jGE@_-Sh@M~f1[c|U`8G",
                                                                                        inputs: {
                                                                                            OPERAND1:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "+c}_JlbVwNT^w-GW^r=*",
                                                                                                        fields: {
                                                                                                            TEXT: "",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "math_modulo",
                                                                                                        id: ":o~z^C/DD_$LVafP/L2=",
                                                                                                        inputs: {
                                                                                                            DIVIDEND:
                                                                                                                {
                                                                                                                    shadow: {
                                                                                                                        type: "math_number",
                                                                                                                        id: "$Z-SGnlnbIBaEPJxU[4.",
                                                                                                                        fields: {
                                                                                                                            NUM: 0,
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            DIVISOR:
                                                                                                                {
                                                                                                                    shadow: {
                                                                                                                        type: "math_number",
                                                                                                                        id: "k*MS3S|K8,@|kj_vt0;%",
                                                                                                                        fields: {
                                                                                                                            NUM: 10,
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            OPERAND2:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "NFf$t:`~VrqXs2s6L1CE",
                                                                                                        fields: {
                                                                                                            TEXT: "",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "math_round",
                                                                                                        id: "WiB4CN+`Wm%/jr]vY=L3",
                                                                                                        fields: {
                                                                                                            OP: "ROUND",
                                                                                                        },
                                                                                                        inputs: {
                                                                                                            NUM: {
                                                                                                                shadow: {
                                                                                                                    type: "math_number",
                                                                                                                    id: "DG3De(,#rzfEQXdkg$Rr",
                                                                                                                    fields: {
                                                                                                                        NUM: 0,
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    B: {
                                                                        block: {
                                                                            type: "operator_equals",
                                                                            id: "Iu-d.-NHV3Sc`xS^%Ycn",
                                                                            inputs: {
                                                                                OPERAND1:
                                                                                    {
                                                                                        shadow: {
                                                                                            type: "behavior_dynamic_val",
                                                                                            id: "FB`C3tj+xTV:`dW(ily=",
                                                                                            fields: {
                                                                                                TEXT: "",
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "math_constrain",
                                                                                            id: "CZ|muIZ1iJEZ4Y!P@=cL",
                                                                                            inputs: {
                                                                                                VALUE: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "_Qr(s9/VN}2u`n#?){Dr",
                                                                                                        fields: {
                                                                                                            NUM: 0,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                                LOW: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "9j65DKQd3%Fv^,%SEkN`",
                                                                                                        fields: {
                                                                                                            NUM: 0,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                                HIGH: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "X!mgmNebgt8ja6)]BS%O",
                                                                                                        fields: {
                                                                                                            NUM: 100,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                OPERAND2:
                                                                                    {
                                                                                        shadow: {
                                                                                            type: "behavior_dynamic_val",
                                                                                            id: "@MZaT1XOx.{_Tp=oU%zN",
                                                                                            fields: {
                                                                                                TEXT: "",
                                                                                            },
                                                                                        },
                                                                                    },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        B: {
                                                            block: {
                                                                type: "logic_operation",
                                                                id: "9{zhM:sOC6!7Jod-(duj",
                                                                fields: {
                                                                    OP: "AND",
                                                                },
                                                                inputs: {
                                                                    A: {
                                                                        block: {
                                                                            type: "logic_negate",
                                                                            id: "R7.(W}SZxk9Cnb}I@_g+",
                                                                            inputs: {
                                                                                BOOL: {
                                                                                    block: {
                                                                                        type: "operator_contains",
                                                                                        id: "*AmuX[kRTI^uscWR?~Vh",
                                                                                        inputs: {
                                                                                            STRING1:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "{(X1Y#Scy/oAD=9e]NA@",
                                                                                                        fields: {
                                                                                                            TEXT: "apple",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            STRING2:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "so1(OV*j-eO:WLV9Yc{H",
                                                                                                        fields: {
                                                                                                            TEXT: "a",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    B: {
                                                                        block: {
                                                                            type: "math_number_property",
                                                                            id: "T%6D_#JaR8;rtl#neudf",
                                                                            extraState:
                                                                                '<mutation divisor_input="false"></mutation>',
                                                                            fields: {
                                                                                PROPERTY:
                                                                                    "EVEN",
                                                                            },
                                                                            inputs: {
                                                                                NUMBER_TO_CHECK:
                                                                                    {
                                                                                        shadow: {
                                                                                            type: "math_number",
                                                                                            id: "M+Qo.Q,;D4ty2VyO0O[^",
                                                                                            fields: {
                                                                                                NUM: 0,
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "math_single",
                                                                                            id: "XOvu$R9_/D:a.^a6hBKo",
                                                                                            fields: {
                                                                                                OP: "ROOT",
                                                                                            },
                                                                                            inputs: {
                                                                                                NUM: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "1{X*@y`dXROPCZJ;{32L",
                                                                                                        fields: {
                                                                                                            NUM: 0,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                            SUBSTACK: {
                                                block: {
                                                    type: "looks_sayforsecs",
                                                    id: "39+E5?|X3]no,2j=#{gf",
                                                    inputs: {
                                                        MESSAGE: {
                                                            shadow: {
                                                                type: "behavior_dynamic_val",
                                                                id: "|k8zqf!}|f4tX9%%f:+e",
                                                                fields: {
                                                                    TEXT: "Hello!",
                                                                },
                                                            },
                                                            block: {
                                                                type: "operator_join",
                                                                id: "3E5R~j]3w#caiwI)i3zQ",
                                                                inputs: {
                                                                    STRING1: {
                                                                        shadow: {
                                                                            type: "behavior_dynamic_val",
                                                                            id: "9./:|#iUFc#VrVRRIG{,",
                                                                            fields: {
                                                                                TEXT: "apple ",
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "operator_letter_of",
                                                                            id: "IfpT0ll_=@bi1de{{tp4",
                                                                            inputs: {
                                                                                LETTER: {
                                                                                    shadow: {
                                                                                        type: "math_number",
                                                                                        id: "04p:Ys/zsV8uy:A{plH/",
                                                                                        fields: {
                                                                                            NUM: 1,
                                                                                        },
                                                                                    },
                                                                                },
                                                                                STRING: {
                                                                                    shadow: {
                                                                                        type: "behavior_dynamic_val",
                                                                                        id: "]+U$n1WD5|0WO^w/N@4o",
                                                                                        fields: {
                                                                                            TEXT: "apple",
                                                                                        },
                                                                                    },
                                                                                    block: {
                                                                                        type: "text_length",
                                                                                        id: "S9EAL4wS(S0s$%2e=.DJ",
                                                                                        inputs: {
                                                                                            VALUE: {
                                                                                                shadow: {
                                                                                                    type: "behavior_dynamic_val",
                                                                                                    id: "6DQ-1884W[ujZ7GC@]N5",
                                                                                                    fields: {
                                                                                                        TEXT: "apple",
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    STRING2: {
                                                                        shadow: {
                                                                            type: "behavior_dynamic_val",
                                                                            id: "{0XxR#6H1e)yyTIxe*wz",
                                                                            fields: {
                                                                                TEXT: "banana",
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "math_trig",
                                                                            id: "~.k4JDw3sx`W`2boYdHw",
                                                                            fields: {
                                                                                OP: "SIN",
                                                                            },
                                                                            inputs: {
                                                                                NUM: {
                                                                                    shadow: {
                                                                                        type: "math_number",
                                                                                        id: "E*6PEYc9(b1ZTAAV8_k`",
                                                                                        fields: {
                                                                                            NUM: 0,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        SECS: {
                                                            shadow: {
                                                                type: "math_number",
                                                                id: "]=[=hcCsh=NA7bbj[;hX",
                                                                fields: {
                                                                    NUM: 2,
                                                                },
                                                            },
                                                            block: {
                                                                type: "math_constant",
                                                                id: "?I6Q;9Kg[y=/8-DQ0mRf",
                                                                fields: {
                                                                    CONSTANT:
                                                                        "PI",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("variable blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "tj?+sK_qF7L3?u0`bIx0",
                                x: -350,
                                y: 130,
                                next: {
                                    block: {
                                        type: "data_setvariableto",
                                        id: "L-2xtv~pT{aE[J[;3+gv",
                                        fields: {
                                            VAR: {
                                                id: "Tv`qsbxQ;MaZmAXDwiD-",
                                            },
                                        },
                                        inputs: {
                                            VALUE: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "[HMX$L+hTT)#|m%l`gA:",
                                                    fields: {
                                                        TEXT: "0",
                                                    },
                                                },
                                                block: {
                                                    type: "data_variable",
                                                    id: ",@-rVAb,OsQ{f$b]Te;u",
                                                    fields: {
                                                        VAR: {
                                                            id: "Tv`qsbxQ;MaZmAXDwiD-",
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "data_changevariableby",
                                                id: "M75Mr4I+`j?:R~Ta!fA:",
                                                fields: {
                                                    VAR: {
                                                        id: "Tv`qsbxQ;MaZmAXDwiD-",
                                                    },
                                                },
                                                inputs: {
                                                    DELTA: {
                                                        shadow: {
                                                            type: "math_number",
                                                            id: "%Gaa1-2q00ml6-x}0TAH",
                                                            fields: {
                                                                NUM: 1,
                                                            },
                                                        },
                                                        block: {
                                                            type: "data_variable",
                                                            id: "}FaV3=[g]M;!S0%vM2yK",
                                                            fields: {
                                                                VAR: {
                                                                    id: "Tv`qsbxQ;MaZmAXDwiD-",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "data_addtolist",
                                                        id: "Sn{L52`b_|,T)i(Q;ey)",
                                                        fields: {
                                                            VAR: {
                                                                id: "Gih0mzA,|Q%j#XH`O4Af",
                                                            },
                                                        },
                                                        inputs: {
                                                            ITEM: {
                                                                shadow: {
                                                                    type: "behavior_dynamic_val",
                                                                    id: "*MSA;|rf@;=mBXD0H~[E",
                                                                    fields: {
                                                                        TEXT: "thing",
                                                                    },
                                                                },
                                                                block: {
                                                                    type: "data_listcontents",
                                                                    id: "E/z!dYKZ{hYvE{)zy5+l",
                                                                    fields: {
                                                                        VAR: {
                                                                            id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "data_deleteoflist",
                                                                id: "G7uVI+(zzuklM-?PlxUp",
                                                                fields: {
                                                                    VAR: {
                                                                        id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                    },
                                                                },
                                                                inputs: {
                                                                    INDEX: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: "Rw9=}k:K2$q|Oap4j8[k",
                                                                            fields: {
                                                                                NUM: 1,
                                                                            },
                                                                        },
                                                                        block: {
                                                                            type: "data_listcontents",
                                                                            id: "Rv$-)]ng_ifob)d$b!c~",
                                                                            fields: {
                                                                                VAR: {
                                                                                    id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "data_deletealloflist",
                                                                        id: "r82.O{W_QqwboHlv9_hI",
                                                                        fields: {
                                                                            VAR: {
                                                                                id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                            },
                                                                        },
                                                                        next: {
                                                                            block: {
                                                                                type: "data_insertatlist",
                                                                                id: "P.MfQrpOFwf?fG5IEIC%",
                                                                                fields: {
                                                                                    VAR: {
                                                                                        id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                    },
                                                                                },
                                                                                inputs: {
                                                                                    ITEM: {
                                                                                        shadow: {
                                                                                            type: "behavior_dynamic_val",
                                                                                            id: "3*O~{tM`T4rT!/scD8L!",
                                                                                            fields: {
                                                                                                TEXT: "thing",
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    INDEX: {
                                                                                        shadow: {
                                                                                            type: "math_number",
                                                                                            id: "xv8O*9`/,en-Wqa?kK]G",
                                                                                            fields: {
                                                                                                NUM: 1,
                                                                                            },
                                                                                        },
                                                                                        block: {
                                                                                            type: "data_itemoflist",
                                                                                            id: "TN0-+_O1}K8jU/3K%.sT",
                                                                                            fields: {
                                                                                                VAR: {
                                                                                                    id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                                },
                                                                                            },
                                                                                            inputs: {
                                                                                                INDEX: {
                                                                                                    shadow: {
                                                                                                        type: "math_number",
                                                                                                        id: "Rq`uN$75~cFkUe9K{YCQ",
                                                                                                        fields: {
                                                                                                            NUM: 1,
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                                next: {
                                                                                    block: {
                                                                                        type: "data_replaceitemoflist",
                                                                                        id: "}d^#KYlu*kTz5xT1D4Pl",
                                                                                        fields: {
                                                                                            VAR: {
                                                                                                id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                            },
                                                                                        },
                                                                                        inputs: {
                                                                                            INDEX: {
                                                                                                shadow: {
                                                                                                    type: "math_number",
                                                                                                    id: ";ZdECrL9#z!z}t?@^W}m",
                                                                                                    fields: {
                                                                                                        NUM: 1,
                                                                                                    },
                                                                                                },
                                                                                                block: {
                                                                                                    type: "data_itemnumoflist",
                                                                                                    id: "|VCvwk)4B%(M:O|3hHw?",
                                                                                                    fields: {
                                                                                                        VAR: {
                                                                                                            id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                                        },
                                                                                                    },
                                                                                                    inputs: {
                                                                                                        ITEM: {
                                                                                                            shadow: {
                                                                                                                type: "behavior_dynamic_val",
                                                                                                                id: "Fm:v)yF+ksi9Lu,LTMLZ",
                                                                                                                fields: {
                                                                                                                    TEXT: "thing",
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                            ITEM: {
                                                                                                shadow: {
                                                                                                    type: "behavior_dynamic_val",
                                                                                                    id: ".H;]o~yy+!oOF@pe#@9h",
                                                                                                    fields: {
                                                                                                        TEXT: "thing",
                                                                                                    },
                                                                                                },
                                                                                                block: {
                                                                                                    type: "data_lengthoflist",
                                                                                                    id: "3ifVcGRUln9`8Ac%qZW[",
                                                                                                    fields: {
                                                                                                        VAR: {
                                                                                                            id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "control_behavior_if",
                                                                                                id: ".,~{eBC)CoeMcQV^WWxX",
                                                                                                inputs: {
                                                                                                    CONDITION:
                                                                                                        {
                                                                                                            block: {
                                                                                                                type: "data_listcontainsitem",
                                                                                                                id: "aM$B]y^5wCL9Fbg3l^)V",
                                                                                                                fields: {
                                                                                                                    VAR: {
                                                                                                                        id: "Gih0mzA,|Q%j#XH`O4Af",
                                                                                                                    },
                                                                                                                },
                                                                                                                inputs: {
                                                                                                                    ITEM: {
                                                                                                                        shadow: {
                                                                                                                            type: "behavior_dynamic_val",
                                                                                                                            id: "h}m-PO-)iNo-Y;R|~2gL",
                                                                                                                            fields: {
                                                                                                                                TEXT: "thing",
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    variables: [
                        {
                            name: "v",
                            id: "Tv`qsbxQ;MaZmAXDwiD-",
                        },
                        {
                            name: "l",
                            id: "Gih0mzA,|Q%j#XH`O4Af",
                            type: "List",
                        },
                    ],
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("variable blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "#7Uj,,]gB=X^p5v=i/Yb",
                                x: 150,
                                y: 350,
                                next: {
                                    block: {
                                        type: "call",
                                        id: "OOu@{L=:}SDP%osE=(3.",
                                        extraState: {
                                            procedure: {
                                                id_: "cTi,7dWczaExErg~13!2",
                                            },
                                        },
                                        inputs: {
                                            i1755748732924: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "Kv=hWT@zCC1qq]%qm^@v",
                                                    fields: {
                                                        TEXT: "",
                                                    },
                                                },
                                                block: {
                                                    type: "motion_xposition",
                                                    id: "F$wfHJf/;Q5Z7NLu`Z}C",
                                                },
                                            },
                                            i1755748733325: {
                                                block: {
                                                    type: "operator_gt",
                                                    id: "Em.!KS0jn0?7HBj8O0`K",
                                                    inputs: {
                                                        OPERAND1: {
                                                            shadow: {
                                                                type: "behavior_dynamic_val",
                                                                id: "C4{vhmaf(SmN[`e]+8{!",
                                                                fields: {
                                                                    TEXT: "",
                                                                },
                                                            },
                                                        },
                                                        OPERAND2: {
                                                            shadow: {
                                                                type: "behavior_dynamic_val",
                                                                id: ",uKJ;KhDI4sopABnT}{~",
                                                                fields: {
                                                                    TEXT: "",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "define",
                                id: "~PX1M0D6^i#KVAjuO-lh",
                                x: 21,
                                y: 9,
                                extraState: {
                                    procedure: {
                                        id_: "cTi,7dWczaExErg~13!2",
                                    },
                                },
                                next: {
                                    block: {
                                        type: "control_behavior_if",
                                        id: "gu!;QE?igO$eyS-sBeDB",
                                        inputs: {
                                            CONDITION: {
                                                block: {
                                                    type: "argument_reporter",
                                                    id: "?.^cw|3u{N8g_;L}yhN0",
                                                    extraState: {
                                                        parameterId:
                                                            "i1755748733325",
                                                        procedure: {
                                                            id_: "cTi,7dWczaExErg~13!2",
                                                        },
                                                    },
                                                },
                                            },
                                            SUBSTACK: {
                                                block: {
                                                    type: "looks_sayforsecs",
                                                    id: "uar3qe-HN,e%}Eb~mj{2",
                                                    inputs: {
                                                        MESSAGE: {
                                                            shadow: {
                                                                type: "behavior_dynamic_val",
                                                                id: "N4VO+YM*jY~2c}WcilVk",
                                                                fields: {
                                                                    TEXT: "Hello!",
                                                                },
                                                            },
                                                            block: {
                                                                type: "argument_reporter",
                                                                id: ".}!gx4Xi)h8UUg/`fv-o",
                                                                extraState: {
                                                                    parameterId:
                                                                        "i1755748732924",
                                                                    procedure: {
                                                                        id_: "cTi,7dWczaExErg~13!2",
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        SECS: {
                                                            shadow: {
                                                                type: "math_number",
                                                                id: "jJ1EE%:-cQ4?)d}W~VdK",
                                                                fields: {
                                                                    NUM: 2,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    procedures: [
                        {
                            id: "cTi,7dWczaExErg~13!2",
                            id_: "cTi,7dWczaExErg~13!2",
                            name: "f1755748734449",
                            returnTypes: null,
                            parameters: [
                                {
                                    id: "arg0",
                                    id_: "arg0",
                                    name: "block name",
                                    types: [],
                                },
                                {
                                    id: "i1755748732924",
                                    id_: "i1755748732924",
                                    name: "number or text",
                                    types: ["String", "Number", "ItemId"],
                                },
                                {
                                    id: "i1755748733325",
                                    id_: "i1755748733325",
                                    name: "boolean",
                                    types: ["Boolean"],
                                },
                            ],
                        },
                    ],
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("extension blocks", () => {
        it("should generate syntactially valid JavaScript for all blocks", () => {
            const workspace = new Blockly.Workspace();
            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: [
                            {
                                type: "event_immediately",
                                id: "#7Uj,,]gB=X^p5v=i/Yb",
                                x: 10,
                                y: 10,
                                next: {
                                    block: {
                                        type: "extension_announcement",
                                        id: "~kgMO5Wu$sf32Hl!s!p+",
                                        inputs: {
                                            CONTENT: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "Ra~1g$0WwfjPka6L)rz8",
                                                    fields: {
                                                        TEXT: "# *Hello*",
                                                    },
                                                },
                                            },
                                            DURATION: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "@0Df^IL~sgZ!b:@vx8|m",
                                                    fields: {
                                                        NUM: 3,
                                                    },
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "extension_auras_add",
                                                id: "@$GL=YX%=_~#N*U5q/5+",
                                                fields: {
                                                    STYLE: "Bubble",
                                                },
                                                inputs: {
                                                    RADIUS: {
                                                        shadow: {
                                                            type: "math_number",
                                                            id: "[L^jB:UW$qjHp3LRez.i",
                                                            fields: {
                                                                NUM: 1,
                                                            },
                                                        },
                                                    },
                                                    COLOR: {
                                                        shadow: {
                                                            type: "color_hsv_sliders",
                                                            id: "*xLWk+Hv}eA)fFA`JirF",
                                                            fields: {
                                                                COLOR: "#facade",
                                                            },
                                                        },
                                                    },
                                                },
                                                next: {
                                                    block: {
                                                        type: "extension_auras_remove",
                                                        id: "s87*B9q|I`4JDs5]L@K;",
                                                        next: {
                                                            block: {
                                                                type: "extension_fog_add",
                                                                id: "yHQQi=}FwvSM_ArFOY:]",
                                                                fields: {
                                                                    SHAPE: "circle",
                                                                },
                                                                inputs: {
                                                                    RADIUS: {
                                                                        shadow: {
                                                                            type: "math_number",
                                                                            id: "HJYr(TC{}ci/S*Uhybrh",
                                                                            fields: {
                                                                                NUM: 1,
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "extension_fog_remove",
                                                                        id: "o*D@VDbZ(CxLankhl4:e",
                                                                        next: {
                                                                            block: {
                                                                                type: "control_behavior_if",
                                                                                id: "fm[3SEl|^#~/w]Rr}[M:",
                                                                                inputs: {
                                                                                    CONDITION:
                                                                                        {
                                                                                            block: {
                                                                                                type: "extension_fog_lit",
                                                                                                id: "jqMirdfGV:cWb:asm;:}",
                                                                                            },
                                                                                        },
                                                                                },
                                                                                next: {
                                                                                    block: {
                                                                                        type: "looks_sayforsecs",
                                                                                        id: "89pl:SdC{Ni~snuROs$a",
                                                                                        inputs: {
                                                                                            MESSAGE:
                                                                                                {
                                                                                                    shadow: {
                                                                                                        type: "behavior_dynamic_val",
                                                                                                        id: "FxDuin3Y5#)pt}AW2xk5",
                                                                                                        fields: {
                                                                                                            TEXT: "Hello!",
                                                                                                        },
                                                                                                    },
                                                                                                    block: {
                                                                                                        type: "extension_daggerheart_stat",
                                                                                                        id: ")7f$Je((pAVj)}8p[RY}",
                                                                                                        fields: {
                                                                                                            STAT: "hp_current",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            SECS: {
                                                                                                shadow: {
                                                                                                    type: "math_number",
                                                                                                    id: "aTd5oR9~R(;w,Vm4rd!I",
                                                                                                    fields: {
                                                                                                        NUM: 2,
                                                                                                    },
                                                                                                },
                                                                                                block: {
                                                                                                    type: "extension_daggerheart_fear",
                                                                                                    id: "Hi#xZ^i|a#UiUD=BoBpX",
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "looks_sayforsecs",
                                                                                                id: "wVXq,U614we+e1V?L}}[",
                                                                                                inputs: {
                                                                                                    MESSAGE:
                                                                                                        {
                                                                                                            shadow: {
                                                                                                                type: "behavior_dynamic_val",
                                                                                                                id: "T`7g@,zjAJV)6#^irGxp",
                                                                                                                fields: {
                                                                                                                    TEXT: "Hello!",
                                                                                                                },
                                                                                                            },
                                                                                                            block: {
                                                                                                                type: "extension_sheets_get",
                                                                                                                id: "i,[xX?EO@|1t;`xJiZ(Z",
                                                                                                                inputs: {
                                                                                                                    CELL: {
                                                                                                                        shadow: {
                                                                                                                            type: "behavior_dynamic_val",
                                                                                                                            id: "4I4R=:3Th6^}E!hZ~M(D",
                                                                                                                            fields: {
                                                                                                                                TEXT: "A1",
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                    SHEET: {
                                                                                                                        shadow: {
                                                                                                                            type: "behavior_dynamic_val",
                                                                                                                            id: "rfFMU2CSoe(qqw?G#`XR",
                                                                                                                            fields: {
                                                                                                                                TEXT: "Sheet1",
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                    ID: {
                                                                                                                        shadow: {
                                                                                                                            type: "behavior_url",
                                                                                                                            id: "0?mK_tps~@I=ZqhX4};R",
                                                                                                                            fields: {
                                                                                                                                URL: "https://docs.google.com/spreadsheets/d/1ZVKsRBdWjpWXt9c7cJSI2-EEiUOvBFDbNjmpa8m-9Gw",
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    SECS: {
                                                                                                        shadow: {
                                                                                                            type: "math_number",
                                                                                                            id: "]E=8q~:z{fot}ucxOF(J",
                                                                                                            fields: {
                                                                                                                NUM: 2,
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                                next: {
                                                                                                    block: {
                                                                                                        type: "extension_hoot_play",
                                                                                                        id: "NYG_)1Wx+A8V7vzTG6OF",
                                                                                                        inputs: {
                                                                                                            TRACK: {
                                                                                                                shadow: {
                                                                                                                    type: "behavior_dynamic_val",
                                                                                                                    id: "R0(F;)eE${WtiZ5b{u5a",
                                                                                                                    fields: {
                                                                                                                        TEXT: "",
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                            PLAYLIST:
                                                                                                                {
                                                                                                                    shadow: {
                                                                                                                        type: "behavior_dynamic_val",
                                                                                                                        id: "u^:*d0G=!;`VTLVba@@R",
                                                                                                                        fields: {
                                                                                                                            TEXT: "",
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                        },
                                                                                                        next: {
                                                                                                            block: {
                                                                                                                type: "extension_codeo_run",
                                                                                                                id: "?hELaG3]O`O7|F(^K#.g",
                                                                                                                inputs: {
                                                                                                                    SCRIPT_NAME:
                                                                                                                        {
                                                                                                                            shadow: {
                                                                                                                                type: "behavior_dynamic_val",
                                                                                                                                id: "-*E:;E021d:GVC(h3Vb|",
                                                                                                                                fields: {
                                                                                                                                    TEXT: "My New Script",
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                },
                                                                                                                next: {
                                                                                                                    block: {
                                                                                                                        type: "extension_owl_trackers_set_field",
                                                                                                                        id: "wn9HmG[=a)7@QOJ~;t~m",
                                                                                                                        inputs: {
                                                                                                                            FIELD: {
                                                                                                                                shadow: {
                                                                                                                                    type: "behavior_dynamic_val",
                                                                                                                                    id: "sF1Iue$?ou^z`4`7?h%a",
                                                                                                                                    fields: {
                                                                                                                                        TEXT: "HP",
                                                                                                                                    },
                                                                                                                                },
                                                                                                                            },
                                                                                                                            VALUE: {
                                                                                                                                shadow: {
                                                                                                                                    type: "math_number",
                                                                                                                                    id: "h*F[3_Qn*Q|D{$2ZuVUr",
                                                                                                                                    fields: {
                                                                                                                                        NUM: 10,
                                                                                                                                    },
                                                                                                                                },
                                                                                                                                block: {
                                                                                                                                    type: "extension_owl_trackers_field",
                                                                                                                                    id: "^A;H.tcm6R82d:bmb/zK",
                                                                                                                                    inputs: {
                                                                                                                                        FIELD_NAME:
                                                                                                                                            {
                                                                                                                                                shadow: {
                                                                                                                                                    type: "behavior_dynamic_val",
                                                                                                                                                    id: "}*JFLe^~{pZ+pl6lcd|v",
                                                                                                                                                    fields: {
                                                                                                                                                        TEXT: "HP",
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                    },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                        next: {
                                                                                                                            block: {
                                                                                                                                type: "extension_owl_trackers_set_checkbox",
                                                                                                                                id: ";pFg`:AR5%hT`B$FlCjK",
                                                                                                                                inputs: {
                                                                                                                                    FIELD: {
                                                                                                                                        shadow: {
                                                                                                                                            type: "behavior_dynamic_val",
                                                                                                                                            id: "!XLqdeuns6e@rrgHnicM",
                                                                                                                                            fields: {
                                                                                                                                                TEXT: "checkbox",
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                    CHECKED:
                                                                                                                                        {
                                                                                                                                            block: {
                                                                                                                                                type: "extension_owl_trackers_checkbox",
                                                                                                                                                id: "LyU{[}|RPkjW.M?Z]N:Z",
                                                                                                                                                inputs: {
                                                                                                                                                    FIELD_NAME:
                                                                                                                                                        {
                                                                                                                                                            shadow: {
                                                                                                                                                                type: "behavior_dynamic_val",
                                                                                                                                                                id: "5S7B=0Q||.s==.O4)dDv",
                                                                                                                                                                fields: {
                                                                                                                                                                    TEXT: "checkbox",
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                },
                                                                                                                                next: {
                                                                                                                                    block: {
                                                                                                                                        type: "extension_rumble_say",
                                                                                                                                        id: "qYR=Ekj#66vN^-;/ohKO",
                                                                                                                                        fields: {
                                                                                                                                            TARGET: "false",
                                                                                                                                        },
                                                                                                                                        inputs: {
                                                                                                                                            MESSAGE:
                                                                                                                                                {
                                                                                                                                                    shadow: {
                                                                                                                                                        type: "behavior_dynamic_val",
                                                                                                                                                        id: "#4?p#W%:BSezjD#/]),t",
                                                                                                                                                        fields: {
                                                                                                                                                            TEXT: "Hello!",
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                        },
                                                                                                                                        next: {
                                                                                                                                            block: {
                                                                                                                                                type: "extension_rumble_roll",
                                                                                                                                                id: "f(J,6q3wIlxTRKmlyf1g",
                                                                                                                                                inputs: {
                                                                                                                                                    NOTATION:
                                                                                                                                                        {
                                                                                                                                                            shadow: {
                                                                                                                                                                type: "behavior_dynamic_val",
                                                                                                                                                                id: "Ck/;sn7v@(Z?iZG_3$|n",
                                                                                                                                                                fields: {
                                                                                                                                                                    TEXT: "1d20",
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                },
                                                                                                                                                next: {
                                                                                                                                                    block: {
                                                                                                                                                        type: "extension_weather_add",
                                                                                                                                                        id: "787:H8yKD,kfEO[uEvWf",
                                                                                                                                                        fields: {
                                                                                                                                                            DIRECTION:
                                                                                                                                                                "NORTHWEST",
                                                                                                                                                            SPEED: "1",
                                                                                                                                                            DENSITY:
                                                                                                                                                                "1",
                                                                                                                                                            TYPE: "SNOW",
                                                                                                                                                        },
                                                                                                                                                        next: {
                                                                                                                                                            block: {
                                                                                                                                                                type: "extension_weather_remove",
                                                                                                                                                                id: "oCP4Cs8q2~NWdg_.fMO6",
                                                                                                                                                                next: {
                                                                                                                                                                    block: {
                                                                                                                                                                        type: "control_behavior_if",
                                                                                                                                                                        id: "A)MM@;ba:_e1G;Wf2t]]",
                                                                                                                                                                        inputs: {
                                                                                                                                                                            CONDITION:
                                                                                                                                                                                {
                                                                                                                                                                                    block: {
                                                                                                                                                                                        type: "extension_weather_has",
                                                                                                                                                                                        id: "9GOO%1~2}uB/B}pk~3c#",
                                                                                                                                                                                    },
                                                                                                                                                                                },
                                                                                                                                                                        },
                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                },
                                                                                                                            },
                                                                                                                        },
                                                                                                                    },
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "extension_bones_roll",
                                id: "o8U1`Z*W|}9bk_5W/uv^",
                                x: 10,
                                y: 2010,
                                fields: {
                                    DIE: "20",
                                    VALUE: 20,
                                },
                                next: {
                                    block: {
                                        type: "looks_sayforsecs",
                                        id: "+af|?C[68gEE=-ai#*,x",
                                        inputs: {
                                            MESSAGE: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "B,:#8_qKe6rL@Q.H)Co,",
                                                    fields: {
                                                        TEXT: "Hello!",
                                                    },
                                                },
                                                block: {
                                                    type: "extension_bones_dice",
                                                    id: "2LDNMTOA=~H:fhZ*Jj%v",
                                                    fields: {
                                                        WHO: "ALL",
                                                    },
                                                    inputs: {
                                                        DICE: {
                                                            shadow: {
                                                                type: "behavior_dynamic_val",
                                                                id: ",0s[8]KQZh?qTJhY+Dq3",
                                                                fields: {
                                                                    TEXT: "1d20",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                            SECS: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "aDE+U*I%T8g,*/Hby;]K",
                                                    fields: {
                                                        NUM: 2,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "extension_clash_hp_change",
                                id: "Xq.@z_a::--FO[K/~!/v",
                                x: 10,
                                y: 2190,
                                next: {
                                    block: {
                                        type: "looks_sayforsecs",
                                        id: "c4Ui(?5;LxJbbQcOaauA",
                                        inputs: {
                                            MESSAGE: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "kK:cyqq`k?$ewST!xCm9",
                                                    fields: {
                                                        TEXT: "Hello!",
                                                    },
                                                },
                                                block: {
                                                    type: "extension_clash_property",
                                                    id: "lZ9vfhn%^lQ1n@-$B:SE",
                                                    fields: {
                                                        PROP: "HP",
                                                    },
                                                },
                                            },
                                            SECS: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "`+9*.sA83P16LcNRLU-=",
                                                    fields: {
                                                        NUM: 2,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "extension_grimoire_hp_change",
                                id: "VZZQ/_4AftP}3t_P:0)9",
                                x: 10,
                                y: 2350,
                                next: {
                                    block: {
                                        type: "looks_sayforsecs",
                                        id: "UC5oOe(sgv:;5rDRdrPY",
                                        inputs: {
                                            MESSAGE: {
                                                shadow: {
                                                    type: "behavior_dynamic_val",
                                                    id: "WW}L7(r][39{@.;=H^+)",
                                                    fields: {
                                                        TEXT: "Hello!",
                                                    },
                                                },
                                                block: {
                                                    type: "extension_grimoire_hp",
                                                    id: "8Uu0u[oZ(]n%U;Z3W:m|",
                                                },
                                            },
                                            SECS: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "p^8NfjBq[WIIWkUmVR|;",
                                                    fields: {
                                                        NUM: 2,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "extension_phases_change",
                                id: "kGD=Zk.udwN31IN8`K|d",
                                x: 10,
                                y: 1890,
                                fields: {
                                    NAME: "Automation 1",
                                    PHASE: 1,
                                },
                            },
                            {
                                type: "extension_pretty_turn_change",
                                id: "#AKLgRoz[#4xC5m|Dy-M",
                                x: 10,
                                y: 1610,
                                fields: {
                                    TURN: "true",
                                },
                                next: {
                                    block: {
                                        type: "extension_pretty_set_initiative",
                                        id: "/n93b1Sc6H23U9cih9_h",
                                        inputs: {
                                            COUNT: {
                                                shadow: {
                                                    type: "math_number",
                                                    id: "p=]no-Q8E`?7`RR$i{yY",
                                                    fields: {
                                                        NUM: 10,
                                                    },
                                                },
                                                block: {
                                                    type: "extension_pretty_initiative",
                                                    id: "t8O5{%hS%9ss_)k}?#,K",
                                                },
                                            },
                                        },
                                        next: {
                                            block: {
                                                type: "control_behavior_if",
                                                id: "W?ge,*3FFvgWgV1ZT{`d",
                                                inputs: {
                                                    CONDITION: {
                                                        block: {
                                                            type: "extension_pretty_my_turn",
                                                            id: "kZB(p|^Nc#(*ac+Tkt1?",
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                type: "extension_smoke_when_door",
                                id: ".@(~]vp[+!}?Nl1B#ab2",
                                x: 10,
                                y: 1070,
                                fields: {
                                    OPEN: "true",
                                },
                                next: {
                                    block: {
                                        type: "extension_smoke_vision_line",
                                        id: "8U_ws,2z{CVVJ1-6a.*Y",
                                        fields: {
                                            ENABLED: "true",
                                        },
                                        next: {
                                            block: {
                                                type: "extension_smoke_wall",
                                                id: "!;/6WwU~73f.,oZ%qVrA",
                                                fields: {
                                                    PROP: "passable:true",
                                                },
                                                next: {
                                                    block: {
                                                        type: "extension_smoke_window",
                                                        id: "R+vbE(#T0t4)`,?/8BhM",
                                                        fields: {
                                                            PROP: "enabled:true",
                                                        },
                                                        next: {
                                                            block: {
                                                                type: "extension_smoke_door",
                                                                id: "}d)~Ztkq^Ehhn8adzaE1",
                                                                fields: {
                                                                    PROP: "open:true",
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: "control_behavior_if",
                                                                        id: "YG_B3TQm~{fS8*XKp%?b",
                                                                        inputs: {
                                                                            CONDITION:
                                                                                {
                                                                                    block: {
                                                                                        type: "extension_smoke_vision",
                                                                                        id: "%$04Xu0${{Dz7JhT,=}*",
                                                                                    },
                                                                                },
                                                                            SUBSTACK:
                                                                                {
                                                                                    block: {
                                                                                        type: "extension_smoke_add",
                                                                                        id: "[3Ri%VA{_D%JA]T8BI*n",
                                                                                        fields: {
                                                                                            SHAPE: "circle",
                                                                                        },
                                                                                        inputs: {
                                                                                            RADIUS: {
                                                                                                shadow: {
                                                                                                    type: "math_number",
                                                                                                    id: "`(LR54mC{eMO#tU@5nKW",
                                                                                                    fields: {
                                                                                                        NUM: 1,
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        next: {
                                                                                            block: {
                                                                                                type: "extension_smoke_remove",
                                                                                                id: "vIY}l@UCtdho~a!WJDsL",
                                                                                                next: {
                                                                                                    block: {
                                                                                                        type: "extension_smoke_blind",
                                                                                                        id: "}ZiO`T,d%!T8v%fq|M0@",
                                                                                                        fields: {
                                                                                                            ACTION: "true",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    backpack: [],
                },
                workspace,
            );

            checkCompiles(workspace);
        });
    });

    describe("motion_gotoxy block", () => {
        it("should handle empty coordinate inputs gracefully", () => {
            const workspace = new Blockly.Workspace();
            addImmediatelyWith(workspace, BLOCK_GOTO.type);
            checkCompiles(workspace);
        });
    });
});
