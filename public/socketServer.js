'use strict'


/**********************************************/
// Setting up Server 
/**********************************************/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8000);
app.use(express.static('.'))

/**********************************************/
// Setting up Database
/**********************************************/

var db = require('lowdb')('db.json');
db.defaults({ events: [] }).write();


/**********************************************/
// Setting up HTTP Request stuff
/**********************************************/

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var http = require('http');

/**********************************************/
// Setting up Tierion
/**********************************************/

var user = "cjmg2006@gmail.com"
var key = "DiMw7Lp4WmuAK0cxMKxRLwQUlnaZEhmNBJ6LancuWuo="
var dataStoreID = "1778" // CarChain C
var tierionURL = "https://api.tierion.com/v1/records"
var method = "POST"

/**********************************************/
// Setting up stuff required to read from Arduino
/**********************************************/

var readline = require('readline');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
});

/**********************************************/
// Setting up Merkle Tree generation stuff
/**********************************************/

var crypto = require('crypto');
var MerkleTools = require('../merkle-tools/merkletools.js');


/**********************************************/
// Refresh page with latest database at connection
/**********************************************/

io.on('connection', function(socket){
	socket.emit('allEvents', db.read().get('events').value());
});

/*******************************************************/
// Code for sending datapoints to Tierion and front-end
/*******************************************************/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseDataPoint(d1, d2, d3) {
	var num = getRandomInt(1, 100);
	if(num % 3 == 0) return d1;
	if(num % 3 == 1) return d2;
	if(num % 3 == 2) return d3;

}

function writeToTierion(payload)  {

	console.log(payload);
	var request = new XMLHttpRequest(); 
	// UPDATE PAYLOAD TO INCLUDE DATASTORE ID ETC 
	request.open(method, tierionURL, false); 
	var response; 
	request.onload = function () {
		var status = request.status; 
		console.log("Status of request: " + status); 
		response = request.responseText; 
	}

	request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	request.setRequestHeader('X-Username', user);
	request.setRequestHeader('X-Api-Key',key);
	request.send(payload); 

	console.log("Received response: " + response.id);

}

function writeToDisplay(chosen) { 
	db.read().get('events').unshift(chosen).write();
	io.emit('newEvent', chosen);
}

function generatePayload(record, status) { 
	record.datastoreId = dataStoreID; 
	nonce++;
	return JSON.stringify(record); 
}



/*******************************************************/
// CODE: Code for reading from Arduino
/*******************************************************/

var EPCTags = []; 
var nonce = 0; 

function hexToAscii(tagCharArray) { // tagCharArray is a character array e.g. [ '32', '44', '43', '30', '33', '33', '44', '31', '34', '32', '33', '33' ]
	var result = ""; 
 	for (var i = 0; i < tagCharArray.length ; i++) { 
		var ch = String.fromCharCode(parseInt(tagCharArray[i], 16));
		result += ch;
	}
	return result;
}

function parseAndAddTags(tagString) { // returns the status as 'r' or 'w' sot that server knows what to do with it
	 
	var tagLength = 12; 

	// console.log(tagString);
	var tagChars = tagString.split(" ");

	// console.log(tagChars);

	for (var i = 0; i < 3 ; i++) {
		var startIndex = (tagLength + 2) * i;
		var tagChar = tagChars.slice(startIndex , startIndex + tagLength); 
		var tag = hexToAscii(tagChar);
		EPCTags.push(tag);
	}

	var status = tagChars[(tagLength + 2) * 3];
	// console.log(status);
	
	return status;
	
		// tagChars.splice(-1,1);
 	// 	var tag = hexToAscii(tagChars);  // tag is a 12-char string e.g. "ST31D12dEWG"
		// EPCTags.push(tag); 

}

function resetTags() {
	EPCTags = [];
}


/**********************************************/
// Merkle Tree formation and checking
/**********************************************/

function createMerkleTree(components) { 
	var tree = new MerkleTools(); 
	tree.addLeaves(components, true); 
	tree.makeTree();

	return tree; 
} 

function generateCombinations(a, b, c) {
	var result = []; 
	result.push([a, b, c]); 
	result.push([a, c, b]); 
	result.push([b, a, c]); 
	result.push([b, c, a]); 
	result.push([c, a, b]); 
	result.push([c, b, a]); 
	return result;
}


function writeTagsToBlockchain(status) {  // writes all variants to blockchain 

	var combinations = generateCombinations(EPCTags[0], EPCTags[1], EPCTags[2]); 
	for(var i = 0 ; i < combinations.length; i++) {
		var combo = combinations[i]; 
		// console.log("Combos: " + combo);
		var tree = createMerkleTree(combo); 
		var root = tree.getMerkleRoot(); 

		var aID = root.toString('hex');
		var data = {airbagID: nonce + aID, status: 'Manufactured',  vin: '1HGCM2633A' + nonce, location: 'San Francisco, CA' , statusCode: 0}
		if(i == 0) writeToDisplay(data); // DISPLAY ON FRONT-END

		var payload = generatePayload(data, status); 
		writeToTierion(payload); 
 		// TODO: Update database with 1st ROOT ONLY 
		
		// console.log(root.inspect()); 
	}
	 
}

function scanBlockchainForTag() {
	// use the airbagID + add '0' as nonce
	// search for that in database 
	// if there, then good. if not, then bad. 
}


/**********************************************/
// Read from serial port 
/**********************************************/
function openFn() { 
	console.log('Communication is on! Successfully connected to Arduino');
}

function dataFn(data) {
	console.log("Serial: " + data);

	if (data.match(/(([a-zA-Z0-9]{2}\s){12}\s\s){3}w/)) { 

		var status = parseAndAddTags(data);   // parse from string to array 
		console.log("Status: " + status);
		if(status === 'w\r') { // write tags to blockchain (generate for all 6 combinations, but only display 1)
			console.log("Calling write"); 
			writeTagsToBlockchain(status);
		} else if (status === 'r\r') {
			scanBlockchainForTag(); 
		}

		resetTags(); 
		 
	}


}

function errorFn() {}
function closeFn() {}

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 

function sendToSerial(data) { // data = 'k'
	port.write(data);
	console.log('Sent to serial');
}






/*******************************************************/
// Test code to send random fake airbags every 1 second
/*******************************************************/

// setInterval(function(){
// 	var datapoint1 = {airbagID: 'A00812345' + i, status: 'Manufactured',  vin: '1HGCM2633A' + i, location: 'San Francisco, CA' , statusCode: 0}
// 	var datapoint2 = {airbagID: 'A00898765' + i, status: 'Installed (Verified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 1 }
// 	var datapoint3 = {airbagID: 'A00898765' + i, status: 'Installed (Unverified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 2} 
// 	var chosen = chooseDataPoint(datapoint1, datapoint2, datapoint3); 
// 	writeAndDisplay(chosen); 
// 	i++; 
// }, 1000)


setInterval(function(){
	sendToSerial('k');
}, 10000);

if (EPCTags.length == 3) {
	console.log(EPCTags);
} 
