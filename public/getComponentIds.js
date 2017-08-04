'use strict' 

// Setting up stuff required to read from Arduino
var readline = require('readline');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
});

// Setting up Merkle Tree generation stuff
var crypto = require('crypto');
var MerkleTools = require('../merkle-tools/merkletools.js');


/**********************************************/
// Store tags in global variable 
/**********************************************/
var EPCTags = []; 

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


function writeTagsToBlockchain() {  // writes all variants to blockchain 

	var combinations = generateCombinations(EPCTags[0], EPCTags[1], EPCTags[2]); 
	for(var i = 0 ; i < combinations.length; i++) {
		var combo = combinations[i]; 
		console.log("Combos: " + combo);
		var tree = createMerkleTree(combo); 
		var root = tree.getMerkleRoot(); 
		// TODO: Write root to blockchain 
		console.log(root.inspect()); 
	}
	 
}

function scanBlockchainForTag() {

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
			writeTagsToBlockchain();
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

setInterval(function(){
	sendToSerial('k');
}, 10000);

if (EPCTags.length == 3) {
	// PROBLEM: Now reading the last line of the data instead of all the data. Need to put all data one 1 line
	console.log(EPCTags);
}