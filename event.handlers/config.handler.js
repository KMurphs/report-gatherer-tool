
const { WebSocketMessage } = require("../helpers/ws.message.helper")

const config = {
  data: null,
  handle: function(connection, data){
    if(data) {
      config.receive(data)
    }
    else {
      let payload = WebSocketMessage("config", data);
      connection.sendUTF(payload.toMessage());
    }
  },
  send: function(){

  }
}

module.exports = { config }