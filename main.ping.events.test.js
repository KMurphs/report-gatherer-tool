const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { WebSocketMessage } = require("./helpers/ws.message.helper")
const { sendMessageToServer } = require("./test.utils")




describe('WebSocket Server Functionality: Ping Endpoint', () => {

  test('Should respond to pings', done => {

    sendMessageToServer('ping', null, (event, data) => {
      expect(event).toBe('ping');
      expect(data.isReply).toBe(true);
      expect(data.reply).toBe('PONG');
    }, done)

  })

});