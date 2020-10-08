const WebSocket = require('ws');
const { WebSocketMessage } = require("./helpers/ws.message.helper")

const serverURL = "ws://localhost:9898/"

const sendMessageToServer = (msg, data, cb, closeCb)=>{
  const ws = new WebSocket(serverURL);


  // ws.on('error', err => { console.error(err); expect(1).toBe(2); terminate(); });
  ws.on('close', err => { closeCb();});
  ws.on('open', async () => { ws.send(new WebSocketMessage(msg, data).toMessage()); })

  ws.on('message', res => {
    const payload = WebSocketMessage.fromString(res);
    const event = payload.getEvent();
    const data = payload.getData();

    cb(event, data)
    ws.close();
  });
}

describe('WebSocket Server Functionality', () => {

  test('Should respond to pings', done => {

    sendMessageToServer('ping', null, (event, data) => {
      expect(event).toBe('ping');
      expect(data.isReply).toBe(true);
      expect(data.reply).toBe('PONG');
    }, done)

  })


  test('Should send project config data', done => {

    const event = 'config'
    const project = 'my-project'

    sendMessageToServer(event, project, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      expect('project_name' in rData.reply).toBe(true);
      expect('order_number' in rData.reply).toBe(true);
      expect('directories_to_look_for_reports' in rData.reply).toBe(true);
      expect('regex_template' in rData.reply).toBe(true);
      expect('regex_template_placeholder' in rData.reply).toBe(true);
      expect('tests_to_validate_reports' in rData.reply).toBe(true);

      expect(rData.reply.project_name).toBe(project);
    }, done)

  })

  test('Should handle get config with no project name', done => {

    const event = 'config'
    const project = ''

    sendMessageToServer(event, project, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(project_name){1}.*(invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
  
  })


  test('Should update config', done => {

    const event = 'config'
    const data = {
      project_name: 'test-project',
      order_number: 111111
    }
  
    sendMessageToServer(event, data, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);
  
      expect('project_name' in rData.reply).toBe(true);
      expect('order_number' in rData.reply).toBe(true);
      expect('directories_to_look_for_reports' in rData.reply).toBe(true);
      expect('regex_template' in rData.reply).toBe(true);
      expect('regex_template_placeholder' in rData.reply).toBe(true);
      expect('tests_to_validate_reports' in rData.reply).toBe(true);

      expect(rData.reply.project_name).toBe(data.project_name);
      expect(rData.reply.order_number).toBe(data.order_number);
    }, done)

  })
  test('Should handle update config with no project name', done => {

    const event = 'config'
    const data = {
      order_number: 111111
    }
    const data2 = {
      order_number: 111111,
      project_name: ''
    }
    sendMessageToServer(event, data, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(project_name){1}.*(missing){1}.*(empty){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, data2, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(project_name){1}.*(missing){1}.*(empty){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
  
  })
});