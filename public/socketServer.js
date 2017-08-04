'use strict'


// Setting up server 
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8000);
app.use(express.static('.'))

// Setting up database 
var db = require('lowdb')('db.json');
db.defaults({ events: [] }).write();


// Setting up HTTP Request stuff
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var http = require('http');

// Setting up Tierion 
var user = "cjmg2006@gmail.com"
var key = "DiMw7Lp4WmuAK0cxMKxRLwQUlnaZEhmNBJ6LancuWuo="
var dataStoreID = "1778" // CarChain C
var tierionURL = "https://api.tierion.com/v1/records"
var method = "POST"

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


// Refresh page with latest database at connection
io.on('connection', function(socket){
	socket.emit('allEvents', db.read().get('events').value());
});


/*******************************************************/
// Code for sending datapoints to Tierion and front-end
/*******************************************************/

function openFn() { 
	console.log('Communication is on! Successfully connected to Arduino');
}

function dataFn(data) {
	console.log(data);
	if (data ===  "Scanning\r" || data === "Go!\r" || data === "Module continuously reading. Asking it to stop...\r" || data === "Enter 'k' to begin read\r" || data === "Read all 3 tags\r" || data === "Ready to read!\r") {
		 
	} else if (data === "Enter 'k' to begin read\r") {
		console.log("Click button to scan"); 
	} else { 

		numTagsRead++;
		EPCTagStrings.push(data); 
		console.log("Data: " + data);
		console.log("Num tags read: " + numTagsRead);
		// console.log(EPCTagStrings);

		if(numTagsRead % 3 == 0) {
			
			console.log("Collected all tags! Woohoo!");
			processTags(); 
			console.log(EPCTags);
			checkAgainstMerkleTree(); 
			resetTags();

		}
	}


}

function errorFn() {}
function closeFn() {}

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 


/*******************************************************/
// Code for sending datapoints to Tierion and front-end
/*******************************************************/

var i = 0; // Internal counter for the number of airbag records generated

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseDataPoint(d1, d2, d3) {
	var num = getRandomInt(1, 100);
	if(num % 3 == 0) return d1;
	if(num % 3 == 1) return d2;
	if(num % 3 == 2) return d3;

}

function writeToTierion(chosen) {
	var request = new XMLHttpRequest(); 
	// UPDATE PAYLOAD TO INCLUDE DATASTORE ID ETC 
	chosen.datastoreId = dataStoreID; 
	var payload = JSON.stringify(chosen); 

	console.log("Successfully created payload: " + payload);
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

function writeAndDisplay(chosen) { 
	writeToTierion(chosen);
	db.read().get('events').unshift(chosen).write();
	io.emit('newEvent', chosen);
}

/*******************************************************/
// Test code to send random fake airbags every 1 second
/*******************************************************/

setInterval(function(){
	var datapoint1 = {airbagID: 'A00812345' + i, status: 'Manufactured',  vin: '1HGCM2633A' + i, location: 'San Francisco, CA' , statusCode: 0}
	var datapoint2 = {airbagID: 'A00898765' + i, status: 'Installed (Verified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 1 }
	var datapoint3 = {airbagID: 'A00898765' + i, status: 'Installed (Unverified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 2} 
	var chosen = chooseDataPoint(datapoint1, datapoint2, datapoint3); 
	writeAndDisplay(chosen); 
	i++; 
}, 1000)
