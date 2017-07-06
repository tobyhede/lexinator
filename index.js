"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-east-1' });
const lexMBS = new AWS.LexModelBuildingService();
const ARN = process.env.ARN;
const LATEST = '$LATEST';
const slots = [
    {
        name: 'Colour',
        description: 'Colour Example',
        enumerationValues: [
            {
                value: 'Red'
            },
            {
                value: 'Green'
            },
            {
                value: 'Blue'
            },
            {
                value: 'Yellow'
            },
            {
                value: 'Orange'
            },
            {
                value: 'Black'
            },
            {
                value: 'White'
            }
        ]
    }
];
const intents = [
    {
        name: 'Colour',
        description: 'Sets a Colour',
        fulfillmentActivity: {
            type: 'CodeHook',
            codeHook: {
                uri: ARN,
                messageVersion: '1.0'
            }
        },
        dialogCodeHook: {
            uri: ARN,
            messageVersion: '1.0'
        },
        sampleUtterances: [
            'Colour',
            'Make it {Colour}',
            'My favourite colour is {Colour}',
            'My favorite color is {Colour}',
            '{Colour} is my favorite color'
        ],
        slots: [
            {
                name: 'Colour',
                slotConstraint: 'Required',
                description: 'Colour',
                priority: 1,
                sampleUtterances: [],
                slotType: 'Colour',
                slotTypeVersion: '$LATEST',
                valueElicitationPrompt: {
                    maxAttempts: 1,
                    messages: [
                        {
                            content: 'What is your favourite colour?',
                            contentType: 'PlainText'
                        },
                    ],
                    responseCard: JSON.stringify({
                        contentType: "application/vnd.amazonaws.card.generic",
                        genericAttachments: [
                            {
                                buttons: [
                                    {
                                        text: "Red", value: "Red"
                                    },
                                    {
                                        text: "Green", value: "Green"
                                    },
                                    {
                                        text: "Blue", value: "Blue"
                                    },
                                ],
                                title: " ++ Colour ++"
                            }
                        ]
                    })
                }
            },
        ]
    }
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        slots.forEach((slot) => __awaiter(this, void 0, void 0, function* () {
            try {
                let latest = yield lexMBS.getSlotType({ name: slot.name, version: LATEST }).promise();
                if (latest) {
                    slot = Object.assign(slot, { checksum: latest.checksum });
                }
            }
            catch (error) {
                console.log(error);
            }
            let result = yield lexMBS.putSlotType(slot).promise();
            console.log(result);
        }));
        intents.forEach((intent) => __awaiter(this, void 0, void 0, function* () {
            try {
                let latest = yield lexMBS.getIntent({ name: intent.name, version: LATEST }).promise();
                if (latest) {
                    intent = Object.assign(intent, { checksum: latest.checksum });
                }
            }
            catch (error) {
                console.log(error);
            }
            let result = yield lexMBS.putIntent(intent).promise();
            console.log(result);
        }));
        const latestBot = yield lexMBS.getBot({ name: 'TextBot', versionOrAlias: '$LATEST' }).promise();
        const bot = {
            checksum: latestBot.checksum,
            childDirected: false,
            locale: 'en-US',
            name: 'TextBot',
            abortStatement: {
                messages: [
                    {
                        content: 'Sorry, I could not understand. Goodbye.',
                        contentType: 'PlainText'
                    },
                ],
            },
            clarificationPrompt: {
                maxAttempts: 5,
                messages: [
                    {
                        content: 'Sorry, can you please repeat that?',
                        contentType: 'PlainText'
                    },
                ],
            },
            description: 'STRING_VALUE',
            idleSessionTTLInSeconds: 18000,
            intents: [
                {
                    intentName: 'Start',
                    intentVersion: '$LATEST'
                },
            ],
            processBehavior: 'BUILD'
        };
        console.log('Put TextBot');
        yield lexMBS.putBot(bot).promise();
    });
}
main();
