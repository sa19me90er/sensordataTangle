const { composeAPI } = require('@iota/core');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')
const { createChannel, createMessage, parseMessage, mamAttach, mamFetch } = require('@iota/mam.js');
const crypto = require('crypto');
const fs = require('fs');
const ruuvi = require('node-ruuvitag')
const moment = require('moment')


//empty json to put ruuvi sensor data later in + empty ID to add the sensor id later to the json
var ruuvi_data = {}
var ruuviID = ''

//search for ruuvi sensor get ID from every sensor,get the data and update every several seconds
//resource : https://www.npmjs.com/package/node-ruuvitag
const findRuuvi= async function(){	
	ruuvi.on('found', tag => {
		console.log('Our ruuvitag sensor id is :' + tag.id);
		ruuviID = tag.id;
		tag.on('updated', data => {
		ruuvi_data=((data))
	//to test if we can get the data from the ruuvi sensor:
//		console.log('Got data from RuuviTag ' + tag.id + ':\n' +
//		   JSON.stringify(ruuvi_data, null, '\t'));
		})
	})
}

// To Generate JSON from the sensor data
const generateJSON = async function() {
	// Generate some random numbers simulating sensor data
	const data = Math.floor((Math.random()*89)+10);
    const dateTime = moment().utc().local().format('DD/MM/YYYY HH:mm:ss');
	//   const json = {"data": ruuvi_data, "dateTime": dateTime};
	const json= {};
	json.sensorID= ruuviID;
    json.data= ruuvi_data; 
	json.dateTime= dateTime;
	return json;
}


async function run(asciiMessage) {
    // Setup the details for the channel.
//	const mode = 'public'
    const mode = 'restricted';
    const sideKey = 'UWVUW';
    let channelState;

    // Try and load the channel state from json file
    try {
        const currentState = fs.readFileSync('./channelState.json');
        if (currentState) {
            channelState = JSON.parse(currentState.toString());
        }
    } catch (e) { }

    // If we couldn't load the details then create a new channel.
    if (!channelState) {

        channelState = createChannel(generateSeed(81), 2, mode, sideKey)
    }

    // Create a MAM message using the channel state.
    const mamMessage = createMessage(channelState, asciiToTrytes(asciiMessage));

    // Display the details for the MAM message.
    console.log('Seed:', channelState.seed);
    console.log('Address:', mamMessage.address);
    console.log('Root:', mamMessage.root);
    console.log('NextRoot:', channelState.nextRoot);

    // Decode the message using the root and sideKey.
    // The decode is for demonstration purposes, there is no reason to decode at this point.

	const decodedMessage = parseMessage(mamMessage.payload, mamMessage.root, sideKey);

    // Display the decoded data.
//   console.log('Decoded NextRoot', decodedMessage.nextRoot);
    console.log('Decoded Message', decodedMessage.message);

    // Store the channel state.
    try {
        fs.writeFileSync('./channelState.json', JSON.stringify(channelState, undefined, "\t"));
    } catch (e) {
        console.error(e)
    }

    // So far we have shown how to create and parse a message
    // but now we actually want to attach the message to the tangle
    const api = composeAPI({ provider: "http://bare01.devnet.iota.cafe:14265" });

    // Attach the message.
    console.log('Attaching to tangle, please wait...')
    await mamAttach(api, mamMessage, 3, 9, "MY9MAM");
    console.log(`You can view the mam channel here https://utils.iota.org/mam/${mamMessage.root}/${mode}/${sideKey}/devnet`);

    // Try fetching it as well.
    console.log('Fetching from tangle, please wait...');


    const fetched = await mamFetch(api, mamMessage.root, mode, sideKey)
    if (fetched) {
        console.log(JSON.parse(trytesToAscii(fetched.message)));
    } else {
        console.log('Nothing was fetched from the MAM channel');
    }
}

function generateSeed(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let seed = '';
    while (seed.length < length) {
        const byte = crypto.randomBytes(1)
        if (byte[0] < 243) {
            seed += charset.charAt(byte[0] % 27);
        }
    }
    return seed;
}

//	generateJSON();
 const startProgram = async function() {

	findRuuvi();
	const jsonSensorData =await generateJSON()
	await run(JSON.stringify(jsonSensorData))
	  
}

findRuuvi();
const TIMEINTERVAL  = 30; // seconds
setInterval(startProgram, TIMEINTERVAL*1000);
