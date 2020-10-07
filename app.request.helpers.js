const { WebSocketMessage } = require("./ws-message")


class AppRequestContext{

  constructor(connection, messageRef, event){
    this.connection = connection;
    this.messageRef = messageRef;
    this.event = event;
  }


  sendReply(replyObj = "received"){ 
    const payload = WebSocketMessage.buildReply(this.messageRef, replyObj); 
    this.connection.sendUTF(payload);
  };
  sendMessage(data = null, event = null){ 
    const payload = new WebSocketMessage(event || this.event, data); 
    this.connection.sendUTF(payload.toMessage());
  };

}

module.exports = { AppRequestContext }