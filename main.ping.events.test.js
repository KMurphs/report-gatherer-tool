const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { WebSocketMessage } = require("./helpers/ws.message.helper")
const { sendMessageToServer, QueuedWebSocket } = require("./test.utils")




describe('WebSocket Server Functionality: Ping Endpoint', () => {

  test('Should respond to pings', async done => {


    const ws = new QueuedWebSocket();
    ws.send('ping', null);
    const {event, data} = await ws.receive();


    expect(event).toBe('ping');
    expect(data.isReply).toBe(true);
    expect(data.reply).toBe('PONG');
    

    ws.close();
    done();

  })

});