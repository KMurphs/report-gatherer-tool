const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { QueuedWebSocket, beforeAllTestUtil } = require("./test.utils")



let configFind;
let serialsToFind;
let tests = [];
beforeAll(() => {
  const res = beforeAllTestUtil()
  configFind = res.configFind
  serialsToFind = res.serialsToFind
  tests = res.tests
});







describe('WebSocket Server Functionality: Config Data Endpoint for CRUD Operations', () => {

  test('Should send project config data', async done => {

    const event = 'config'
    const project = 'my-project'


    const ws = new QueuedWebSocket();
    ws.send(event, project);
    const {event: rEvent, data: rData} = await ws.receive();

    expect(rEvent).toBe(event);
    expect(rData.isReply).toBe(true);

    expect('project_name' in rData.reply).toBe(true);
    expect('order_number' in rData.reply).toBe(true);
    expect('directories_to_look_for_reports' in rData.reply).toBe(true);
    expect('regex_template' in rData.reply).toBe(true);
    expect('regex_template_placeholder' in rData.reply).toBe(true);
    expect('tests_to_validate_reports' in rData.reply).toBe(true);

    expect(rData.reply.project_name).toBe(project);

    
    ws.close();
    done();


  })
  test('Should handle get config with no project name', async done => {

    const event = 'config'
    const project = ''


    const ws = new QueuedWebSocket();
    ws.send(event, project);
    const {event: rEvent, data: rData} = await ws.receive();

    expect(rEvent).toBe(event);
    expect(rData.isReply).toBe(true);

    let r = new RegExp("^.*(project_name){1}.*(invalid){1}.*$")
    expect(r.test(rData.reply)).toBe(true);

    
    ws.close();
    done();
  })
  test('Should update config', async done => {

    const event = 'config'
    const data = {
      project_name: 'test-project',
      order_number: 111111
    }



    const ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent, data: rData} = await ws.receive();

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

    
    ws.close();
    done();
  })
  test('Should handle update config with no project name', async done => {

    const event = 'config'
    const data = {
      order_number: 111111
    }
    const data2 = {
      order_number: 111111,
      project_name: ''
    }

    let r = new RegExp("^.*(project_name){1}.*(missing){1}.*(empty){1}.*$")


    
    let ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent, data: rData} = await ws.receive();
    ws.close();

    expect(rEvent).toBe(event);
    expect(rData.isReply).toBe(true);
    expect(r.test(rData.reply)).toBe(true);




    ws = new QueuedWebSocket();
    ws.send(event, data2);
    const {event: rEvent2, data: rData2} = await ws.receive();
    ws.close();

    expect(rEvent2).toBe(event);
    expect(rData2.isReply).toBe(true);
    expect(r.test(rData2.reply)).toBe(true);


    done();
  })
  test('Should handle update config with invalid regex template, placeholder, locations', async (done) => {

    const event = 'config'
    const project_name = 'test-project'
    const data = {
      project_name: '',
      order_number: null,
      regex_template: "",
      regex_template_placeholder: "",
      directories_to_look_for_reports: [],
      tests_to_validate_reports: []

    }




    let r = new RegExp("^.*(project_name){1}.*(missing){1}.*(empty){1}.*$")
    let ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent1, data: rData1} = await ws.receive();
    ws.close();

    expect(rEvent1).toBe(event);
    expect(rData1.isReply).toBe(true);
    expect(r.test(rData1.reply)).toBe(true);




    data.project_name = project_name;
    r = new RegExp("^.*(order_number){1}.*(field){1}.*(invalid){1}.*$")
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent2, data: rData2} = await ws.receive();
    ws.close();

    expect(rEvent2).toBe(event);
    expect(rData2.isReply).toBe(true);
    expect(r.test(rData2.reply)).toBe(true);




    data.order_number = 222222;
    r = new RegExp("^.*(regex_template){1}.*(field){1}.*(invalid){1}.*$")
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent3, data: rData3} = await ws.receive();
    ws.close();

    expect(rEvent3).toBe(event);
    expect(rData3.isReply).toBe(true);
    expect(r.test(rData3.reply)).toBe(true);




    data.regex_template = configFind.regexExpression;
    r = new RegExp("^.*(regex_template_placeholder){1}.*(field){1}.*(invalid){1}.*$")
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent4, data: rData4} = await ws.receive();
    ws.close();

    expect(rEvent4).toBe(event);
    expect(rData4.isReply).toBe(true);
    expect(r.test(rData4.reply)).toBe(true);





    data.regex_template_placeholder = configFind.regexPlaceholder;
    r = new RegExp("^.*(directories_to_look_for_reports){1}.*(field){1}.*(invalid){1}.*$")
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent5, data: rData5} = await ws.receive();
    ws.close();

    expect(rEvent5).toBe(event);
    expect(rData5.isReply).toBe(true);
    expect(r.test(rData5.reply)).toBe(true);





    data.directories_to_look_for_reports = [...(configFind.from)];
    r = new RegExp("^.*(tests_to_validate_reports){1}.*(field){1}.*(invalid){1}.*$")
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent6, data: rData6} = await ws.receive();
    ws.close();

    expect(rEvent6).toBe(event);
    expect(rData6.isReply).toBe(true);
    expect(r.test(rData6.reply)).toBe(true);
    

    data.tests_to_validate_reports = [...tests];
    ws = new QueuedWebSocket();
    ws.send(event, data);
    const {event: rEvent7, data: rData7} = await ws.receive();
    ws.close();

    expect(rEvent7).toBe(event);
    expect(rData7.isReply).toBe(true);
    expect(rData7.reply.project_name).toBe(project_name);


    

    done();
  })

});