'use strict' 

var socket = io.connect('/');

socket.on('open', function(data) {
  console.log("Connection established!");
  socket.send("Hello Server!")
  
  // socket.emit ('clientMessage', 'b');
   
});

socket.on('broadcast',function(data){
	displayResult(data); 
  	// document.body.innerHTML = '';
  	// document.write(data.description);
});

socket.on('testerEvent', function(data){document.write(data.description)});


socket.on('message', function(data) {
  // console.log(data);
});

function displayResult(data) { 
	console.log(data);
	if(data.msgType === 'update') {
		console.log('update msg received');
		var real = data.description; 
		console.log(real);
		var color = real ? '#42f489' : '#ff3a61'; 
		var msg = real ? 'This is a real airbag' : 'This is a fake airbag' ; 
		if(real) { 
			socket.emit('beep', 'true');
		} else {
			socket.emit('beep', 'false');
		}
		document.body.style.backgroundColor = color;
		$("#displaymsg").text(msg); 
	} else {
		console.log(data.description);
		$("#displaymsg").text(data.description);
	}

}

$("#scan-btn").click(function() {
	console.log('button clicked');
	socket.emit('clientEvent', 'k');
	console.log('button pressed, ready to scan');

}); 
