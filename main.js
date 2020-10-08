// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;


const { WebSocketMessage } = require("./helpers/ws.message.helper")
const { AppSendMessageHelper } = require("./helpers/app.request.helpers")
const { ping } = require("./event.handlers/ping.handler")
const { config } = require("./event.handlers/config.handler")



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
      const payload = WebSocketMessage.fromString(message.utf8Data)


      const event = payload.getEvent();
      const data = payload.getData();
      const sendMsgHelper = new AppSendMessageHelper(connection, message.utf8Data, event);




      if(event === 'ping') ping.handle(sendMsgHelper, data)
      else if(event === 'config') config.handle(sendMsgHelper, data)
      else console.warn(`Server received message with unknown event: '${event}'`);
  
      
    });


});