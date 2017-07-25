'use strict'

var assert = require('assert');
var crypto = require('crypto');
var MerkleTools = require('./merkle-tools/merkletools.js');
var readline = require('readline');
var SerialPort = require('serialport');


/*******************************************/
// Global Variables
/*******************************************/
var numTagsRead = 0; 
var EPCTagStrings = [];
var EPCTags = []; 

// Stored components for Merkle Tree
var componentA = "SDR170318466"
var componentB = "3DC027D13824"
var componentC = "2DC033D14233"
var componentD = "3DC027D1fake"
var componentE = "2DC033D1fake"

var componentBank = { 'A': componentA, 'B': componentB, 'C': componentC, 'D': componentD, 'E': componentE }


/*******************************************/
// Part A: Generate initial Merkle Tree
/*******************************************/



/*******************************************/
// Part B: Reading from Arduino code 
/*******************************************/

var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
});

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 


function openFn() { 
	console.log('Communication is on!');
}

function dataFn(data) {
	console.log(data);
	 
	if (data ===  "Scanning\r" || data === "Go!\r" || data === "Module continuously reading. Asking it to stop...\r") {
		 
	} else {
		 
		numTagsRead++;
		EPCTagStrings.push(data); 
		console.log(EPCTagStrings);
	}

	if(numTagsRead == 3) {
		console.log("Collected all tags! Woohoo!");
		processTags(); 
		checkAgainstMerkleTree(); 
	}
}

function hexToAscii(tagCharArray) { // tagCharArray is a character array e.g. [ '32', '44', '43', '30', '33', '33', '44', '31', '34', '32', '33', '33' ]
	var result = ""; 
 	for (var i = 0; i < tagCharArray.length ; i++) { 
		var ch = String.fromCharCode(parseInt(tagCharArray[i], 16));
		result += ch;
	}

	return result;

}

function processTags() { 
	for (var i = 0; i < 3 ; i++) {
		var tagString = EPCTagStrings[i]; 
		var tagChars = tagString.split(" ");
		tagChars.splice(-1,1);
		console.log(tagChars);
		var tag = hexToAscii(tagChars);  // tag is a 12-char string e.g. "ST31D12dEWG"
		EPCTags.push(tag); 
	}
	// console.log(EPCTags);
}

function errorFn() {

}

function closeFn() {

}