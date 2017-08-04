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
var MerkleTools = require('./merkle-tools/merkletools.js');


function openFn() { 
	console.log('Communication is on! Successfully connected to Arduino');
}

function dataFn(data) {
	console.log(data);
	// if (data ===  "Scanning\r" || data === "Go!\r" || data === "Module continuously reading. Asking it to stop...\r" || data === "Enter 'k' to begin read\r" || data === "Read all 3 tags\r" || data === "Ready to read!\r") {
		 
	// } else if (data === "Enter 'k' to begin read\r") {
	// 	console.log("Click button to scan"); 
	// } else { 

	// 	numTagsRead++;
	// 	EPCTagStrings.push(data); 
	// 	console.log("Data: " + data);
	// 	console.log("Num tags read: " + numTagsRead);
	// 	// console.log(EPCTagStrings);

	// 	if(numTagsRead % 3 == 0) {
			
	// 		console.log("Collected all tags! Woohoo!");
	// 		processTags(); 
	// 		console.log(EPCTags);
	// 		checkAgainstMerkleTree(); 
	// 		resetTags();

	// 	}
	// }


}

function errorFn() {}
function closeFn() {}

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 