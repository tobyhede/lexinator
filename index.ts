import * as AWS from 'aws-sdk';
// import * as _ from 'underscore';

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
        sampleUtterances: [
          // 'Pick your character',
        ],
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
]

async function main() {

  slots.forEach( async (slot: any) => {
    try {
      let latest = await lexMBS.getSlotType({name: slot.name, version: LATEST}).promise()

      if (latest) {
        slot = Object.assign(slot, { checksum: latest.checksum });
      }
    } catch(error) {
      console.log(error);
    }

    let result = await lexMBS.putSlotType(slot).promise()

    console.log(result);
  });

  intents.forEach( async (intent: any) => {
    try {
      let latest = await lexMBS.getIntent({name: intent.name, version: LATEST}).promise()
      if (latest) {
        intent = Object.assign(intent, { checksum: latest.checksum });
      }
    } catch(error) {
      console.log(error);
    }

    let result = await lexMBS.putIntent(intent).promise();

    console.log(result);
  });


  const latestBot = await lexMBS.getBot({ name: 'TextBot', versionOrAlias: '$LATEST'}).promise()

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
      // responseCard: 'STRING_VALUE'
    },
    clarificationPrompt: {
      maxAttempts: 5,
      messages: [
        {
          content: 'Sorry, can you please repeat that?',
          contentType: 'PlainText'
        },
      ],
      // responseCard: 'STRING_VALUE'
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
  await lexMBS.putBot(bot).promise()


}

main();
