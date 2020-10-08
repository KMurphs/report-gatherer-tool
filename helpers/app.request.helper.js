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


  reply(replyObj){ 
    const payload = WebSocketMessage.buildReply(this.messageRef, replyObj || "received"); 
    this.connection.sendUTF(payload);
  };
  push(event, data){ 
    const payload = new WebSocketMessage(event || this.event, data); 
    this.connection.sendUTF(payload.toMessage());
  };

}



module.exports = { AppSendMessageHelper }