
const { WebSocketMessage } = require("./ws-message")

const greetings = {
  handle: function(connection, event){
    setTimeout(()=>{
      let payload = WebSocketMessage("third-party-event", "some-data");
      connection.sendUTF(payload.toMessage());
    }, 1000)
  }
}

module.exports = { greetings }