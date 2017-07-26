'use strict' 

var socket = io.connect('/');

socket.on('open', function(data) {
  console.log("Connection established!");
  socket.send("Hello Server!")
  
  // socket.emit ('clientMessage', 'b');
   
});

socket.on('broadcast',function(data){
	var real = data.description; 
	displayResult(real); 
  	document.body.innerHTML = '';
  	document.write(data.description);
});

socket.on('testerEvent', function(data){document.write(data.description)});


socket.on('message', function(data) {
  // console.log(data);
});

function displayResult(real) { 
	var color = real ? 'green' : 'red'; 
	var msg = real ? 'This is a real airbag' : 'This is a fake airbag' ; 
	$('body').css("background-color", color);
}
