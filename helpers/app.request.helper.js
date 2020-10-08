const { WebSocketMessage } = require("./ws.message.helper")

// Encapsulate the mechanics and knowledge of message sending
// to allow the handlers not to concern themselves with knowledge
// they have no business having
class AppSendMessageHelper{

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
    console.log(payload.toMessage())
    this.connection.sendUTF(payload.toMessage());
  };

}

module.exports = { AppSendMessageHelper }