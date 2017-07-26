'use strict' 

var socket = io.connect('/');

socket.on('open', function(data) {
  console.log("Connection established!");
  socket.send("Hello Server!")
  
  // socket.emit ('clientMessage', 'b');
   
});

socket.on('broadcast',function(data){
	var real = data.description; 
	console.log(real);
	displayResult(real); 
	$("#displaymsg").text(data.description); 
  	// document.body.innerHTML = '';
  	// document.write(data.description);
});

socket.on('testerEvent', function(data){document.write(data.description)});


socket.on('message', function(data) {
  // console.log(data);
});

function displayResult(real) { 
	if(real.msgType === 'update') { 
		var color = real ? 'green' : 'red'; 
		// var msg = real ? 'This is a real airbag' : 'This is a fake airbag' ; 
		document.body.style.backgroundColor = color;
	}

}

$("#scan-btn").click(function() {
	console.log('button clicked');
	socket.emit('clientEvent', 'k');

}); 
