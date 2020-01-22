const { composeAPI } = require('@iota/core');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')
const { createChannel, createMessage, parseMessage, mamAttach, mamFetch, mamFetchAll } = require('@iota/mam.js');
const crypto = require('crypto');
const fs = require('fs');
//const moment = require('moment')


const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const objectCsvStringifier = require('csv-writer').objectCsvStringifier;

let root= 'SASVJMCVCOJZIJMYXBIYHLYKASUNFSKCDCPETVXYAVYEPKQRTMHRTQRMZKZPNPZUNMXIVRMHZBBPRPQBO';
	
	//CSV file fields
var fields = ['sensorID', 'dataFormat', 'rssi', 'humidity', 'temperature', 'pressure', 'accelerationX', 'accelerationY', 'accelerationZ', 'battery','dateTime'];

	
async function run() {
    // Setup the details for the channel.
    const mode = 'restricted';
    const sideKey = 'UWVUW';
    let channelState;
	
    const api = composeAPI({ provider: "http://bare01.devnet.iota.cafe:14265" });
//	const fetched = await mamFetchAll(api, root, mode, sideKey)
	
	// fetch one message everytime
	const fetched = await mamFetch(api, root, mode, sideKey)

    if (fetched) {		
		message = JSON.parse(trytesToAscii(fetched.message))
        console.log(message);
		root=fetched.nextRoot;			
		
		// get seperate data from json
		var sensorID = message.sensorID
		var dataFormat = message.data.dataFormat
		var rssi = message.data.rssi
		var humidity = message.data.humidity
		var temperature = message.data.temperature
		var pressure = message.data.pressure
		var accelerationX = message.data.accelerationX
		var accelerationY = message.data.accelerationY
		var accelerationZ = message.data.accelerationZ
		var battery = message.data.battery
		var dateTime = message.dateTime
		
		 // data= [{sensorID, dataFormat, rssi, temperature,
				// accelerationX, accelerationY, accelerationZ, battery, dateTime}]
				
				
		const records = [
		{sID: sensorID,  datform: dataFormat, rsi: rssi, hmdty: humidity, tmpr: temperature, prsr: pressure, accelX: accelerationX, accelY: accelerationY, accelZ: accelerationZ, btry: battery, dtTme: dateTime}
		];
		
		var fileHeader = [
			{id: 'sID', title: 'sensorID'},
			{id: 'datform', title: 'dataFormat'},
			{id: 'rsi', title: 'rssi'},
			{id: 'hmdty', title: 'humidity'},
			{id: 'tmpr', title: 'temperature'},
			{id: 'prsr', title: 'pressure'},
			{id: 'accelX', title: 'accelerationX'},
			{id: 'accelY', title: 'accelerationY'},
			{id: 'accelZ', title: 'accelerationZ'},
			{id: 'btry', title: 'battery'},
			{id: 'dtTme', title: 'dateTime'}
		]
		
		fs.stat('data.csv', function(err, stat) {
			// Check if the file alreay exists
			if(err == null) {
				console.log('File exists');
				const csvWriter = createCsvWriter({
					path: 'data.csv',
					header: fileHeader,
					// trure because the file exists already. there is no need to add header, just append
					append: true
				});
				csvWriter.writeRecords(records)       // returns a promise
				.then(() => {
					console.log('...Done');
				});
			} 
			else if(err.code === 'ENOENT') {
				// file does not exist
				const csvWriter = createCsvWriter({
					path: 'data.csv',
					header: fileHeader,
					// false here means add headers
					append: false
				});
				csvWriter.writeRecords(records)       // returns a promise
				.then(() => {
				console.log('...Done');
				});
			} 
			else {
				console.log('Some other error: ', err.code);
			}
			});
	}
	else{console.log('Waiting for new transactions')}
}

// run the code immediately
run()
// fetch every 2 seconds **for demo purpose**
const TIMEINTERVAL  = 2; // seconds
setInterval(run, TIMEINTERVAL*1000);