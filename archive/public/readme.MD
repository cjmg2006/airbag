1. Upload code onto the Arduino
   - File name: ReadStreamEPC2 
   - For WRITE: change letter to 'w', change power to '1500' 
   - For READ: change letter to 'r', change power to '2000'


2. Open up server in Terminal 
	- Command line: node socketServer.js
	- Ensure that the serialPort names match those that you connect to 
	- Check that it is printing this line twice: 'Communication is on! Successfully connected to Arduino'
	- Note: we are using Serial port v4, not v5


3. Go to Chrome and load localhost:8000/table.html 

4. Scan! 