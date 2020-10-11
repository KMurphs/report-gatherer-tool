// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;


const { WebSocketMessage } = require("./helpers/ws.message.helper");
const { AppSendMessageHelper } = require("./helpers/app.request.helper");
const { createAppFolders } = require("./helpers/app.file.system.helper");
const { ping } = require("./event.handlers/ping.handler");
const { config } = require("./event.handlers/config.handler");
const { findFile } = require("./event.handlers/find.sn.file.handler");
const { testFile } = require("./event.handlers/test.sn.file.handler");
const { archiver } = require("./event.handlers/archive.handler");


const appFolder = createAppFolders();

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
      const payload = WebSocketMessage.fromString(message.utf8Data);

      // Prepare data for routes
      const event = payload.getEvent();
      const data = payload.getData();
      const sendMsgHelper = new AppSendMessageHelper(connection, message.utf8Data, event);



      // Routes: Events Handlers
      if(event === 'ping') {
        ping.handle(sendMsgHelper, data);

      } else if(event === 'config'){
        config.handle(sendMsgHelper, data);
        const {project_name, order_number} = data;
        if(order_number) archiver.prepare(sendMsgHelper, appFolder, {project_name}); 

      } else if(event === 'find-sn-file') {
        findFile.handle(sendMsgHelper, data);
      
      } else if(event === 'test-sn-file') { 
        testFile.handle(sendMsgHelper, data);   

      } else if(event === 'move-sn-file') { 
        archiver.move(sendMsgHelper, data);

      } else if(event === 'archive-sn-files') { 
        archiver.finalize(sendMsgHelper, data);

      }else {
        console.warn(`Server received message with unknown event: '${event}'`);
      }
  
      
    });


});