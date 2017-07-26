'use strict'

var assert = require('assert');
var crypto = require('crypto');
var MerkleTools = require('./merkle-tools/merkletools.js');
var readline = require('readline');
var SerialPort = require('serialport');
var express = require('express');
var path = require('path');
var app = express();


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

var realAirbagRoots = []; 

// Merkle tree related variables 
var treeOptions = {
  hashType: 'sha256' // optional, defaults to 'sha256'
};

/*******************************************/
// Express.js related variables 
/*******************************************/

var message;

// Define the port to run on
app.set('port', 8080);
app.use(express.static(path.join(__dirname, 'public')));

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.use('/data', function (req, res) {
  console.log("i'm trying");
  res.json(message);
});

/*******************************************/
// Part A1: Merkle Tree Functions 
/*******************************************/

function convertToComponentString(a) { 
  return componentBank[a];
}

// Function: Gets 3 alphanumeric letters and returns a Merkle tree built from the corresponding components 
function createMerkleTreeAlpha(array) {
	var components = [convertToComponentString(array[0]), convertToComponentString(array[1]), convertToComponentString(array[2])];
	var tree = new MerkleTools(treeOptions); 

	// TODO: add proofs to each individual leaf? 

	return createMerkleTree (components); 
}

function createMerkleTree(components) { 
	var tree = new MerkleTools(treeOptions); 
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

function createMerkleRoots(a, b, c) { 
  var result = [];
  var combinations = generateCombinations(a, b, c);
  for (var i = 0; i < combinations.length; i++) { 
    var combo = combinations[i];
    var tree = createMerkleTreeAlpha(combo);
    var root = tree.getMerkleRoot(); 
    result.push(root);
  } 
  return result;
}

function verifyRoot(r, roots)  {
  for (var i = 0; i < roots.length; i++) {
    var root = roots[i];
    if(r.equals(root)) return true;
  }

  return false;
}

/*******************************************/
// Part A2: Generate Merkle Tree for Legits
/*******************************************/
realAirbagRoots = createMerkleRoots('A', 'C', 'E');
// console.log(realAirbagRoots);

/*******************************************/
// Part B1: Functions for serialport and checking
/*******************************************/

function openFn() { 
	console.log('Communication is on!');
}

function dataFn(data) {
	if (data ===  "Scanning\r" || data === "Go!\r" || data === "Module continuously reading. Asking it to stop...\r") {
		 
	} else { 
		numTagsRead++;
		EPCTagStrings.push(data); 
		console.log("Num tags read: " + numTagsRead);
		// console.log(EPCTagStrings);
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
		// console.log(tagChars);
		var tag = hexToAscii(tagChars);  // tag is a 12-char string e.g. "ST31D12dEWG"
		EPCTags.push(tag); 
	}
	// console.log(EPCTags);
}

// Function: takes the EPC tags stored in the global array, creates a Merkle root, and checks whether it exists in realAirbagRoots
function checkAgainstMerkleTree() { 
	var tree = createMerkleTree(EPCTags); 
	var root = tree.getMerkleRoot(); 
	var match = verifyRoot(root, realAirbagRoots); 
	message = "We have a match? " + match;
	console.log("Do we have the correct parts? " + match);
}

function errorFn() {}
function closeFn() {}

/*******************************************/
// Part B2: Reading from Arduino code 
/*******************************************/

var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
});

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 


