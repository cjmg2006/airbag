'use strict'

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var db = require('lowdb')('db.json');
db.defaults({ events: [] }).write();

server.listen(8000);

app.use(express.static('.'))

io.on('connection', function(socket){
	socket.emit('allEvents', db.read().get('events').value());
});

var i = 0;


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseDataPoint(d1, d2, d3) {
	var num = getRandomInt(1, 100);
	if(num % 3 == 0) return d1;
	if(num % 3 == 1) return d2;
	if(num % 3 == 2) return d3;

}

setInterval(function(){
	var datapoint1 = {airbagID: 'A00812345' + i, status: 'Manufactured',  vin: '1HGCM2633A' + i, location: 'San Francisco, CA' , statusCode: 0}
	var datapoint2 = {airbagID: 'A00898765' + i, status: 'Installed (Verified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 1 }
	var datapoint3 = {airbagID: 'A00898765' + i, status: 'Installed (Unverified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 2}
	 
	var chosen = chooseDataPoint(datapoint1, datapoint2, datapoint3); 
	db.read().get('events').unshift(chosen).write();
	io.emit('newEvent', chosen);

	i++; 
},5000)
