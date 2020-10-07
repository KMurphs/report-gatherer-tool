const { WebSocketMessage } = require("./ws.message.helper")


class AppRequestContext{

  constructor(connection, messageRef, event){
    this.connection = connection;
    this.messageRef = messageRef;
    this.event = event;
  }


  reply(replyObj = "received"){ 
    const payload = WebSocketMessage.buildReply(this.messageRef, replyObj); 
    this.connection.sendUTF(payload);
  };
  push(event = null, data = null){ 
    const payload = new WebSocketMessage(event || this.event, data); 
    this.connection.sendUTF(payload.toMessage());
  };

}

module.exports = { AppRequestContext }