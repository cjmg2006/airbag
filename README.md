# BlokMotiv
A physical/digital tagging system that enables transparency and traceability through aggregated identity and shared truth

## Packages used 

Download these packages before you run the code. 

- Node JS (https://nodejs.org/en/)
- Express JS (https://expressjs.com/)
- Serialport JS (https://www.npmjs.com/package/serialport, v4.0.7)
- Merkle Tools JS (https://github.com/Tierion/merkle-tools)
- Socket I/O (https://socket.io/)

Other code references used: 
- Sparkfun Simultaneous RFID Tag Reader Library (for Arduino: https://github.com/sparkfun/SparkFun_Simultaneous_RFID_Tag_Reader_Library)
- Tierion Data API (https://tierion.com/docs/dataapi)

## How to Run 

1. Upload 'Manufacture' code into 1 Arduino  
	- File name: arduino.ino
	- Set line 87 to "Serial.println('w')"
	- Upload file to Arduino 

2. Upload 'Install' code into another Arduino
	- File name: arduino.ino
	- Set line 87 to "Serial.println('r')"
	- Upload file to Arduino 

3. Connect Arduino (w/ RFID readers attached) to computer 

4. Run server
	- In terminal, run "node server.js"
	- Currently, server is running on localhost:8000

5. Open index.html in browser
 
## Hardware 

