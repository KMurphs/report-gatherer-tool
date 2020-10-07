// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;


const { WebSocketMessage } = require("./ws-message")
const { greetings } = require("./greetings.handler")



const server = http.createServer();
server.listen(9898, 'localhost', 0, ()=>{
  console.log("Server Started at 'localhost:9898' ")
});

const wsServer = new WebSocketServer({
    httpServer: server
});








wsServer.on('request', function(request) {

    const connection = request.accept(null, request.origin);
    connection.on('close', function(reasonCode, description) {
      console.log('Client has disconnected.');
    });




    connection.on('message', function(message) {

      console.log('Received Message:', message.utf8Data);
      let payload = WebSocketMessage.fromString(message.utf8Data)
      let reply = WebSocketMessage.buildReply(message.utf8Data, "received")
      connection.sendUTF(reply);

      
      let event = payload.getEvent();
      let data = payload.getData();



      if(event === 'greetings') greetings.handle(connection, data)
      else console.warn(`Server received message with unknown event: '${event}'`);
  
      
    });


});