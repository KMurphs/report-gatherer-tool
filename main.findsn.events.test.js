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




describe('WebSocket Server Functionality: Find-SN Endpoint', () => {

  test('Should find report file for serial number', async (done) => {

    const event = 'find-sn-file'
    const project_name = 'test-project'
    const serial_number = serialsToFind[0]




    let ws = new QueuedWebSocket();
    ws.send('config', {
      project_name: project_name,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    });
    const {event: rEvent1, data: rData1} = await ws.receive();
    ws.close();

    expect(rEvent1).toBe('config');
    expect(rData1.isReply).toBe(true);







    const r1 = new RegExp("^.*(processing){1}.*$");
    const r2 = new RegExp(
      configFind.regexExpression.replace(
        configFind.regexPlaceholder, 
        serial_number
      )
    );



    ws = new QueuedWebSocket();
    ws.send(event, {project_name, serial_number});

    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe(event);
    expect(rData2.isReply).toBe(true);
    expect(r1.test(rData2.reply)).toBe(true);

    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe(event);
    expect(r2.test(rData3.name)).toBe(true);
    expect(fs.existsSync(rData3.path)).toBe(true);

    ws.close();



    done();
  })
  test('Should handle invalid project name or serial number during request to find report file for serial number', async done => {

    const event = 'find-sn-file'
    const serial_number = "123456789"
    const project_name = 'test-project'

    
    let r1 = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
    let r2 = new RegExp("^.*(Serial){1}.*(Number){1}.*(provided){1}.*(Invalid){1}.*$")



    ws = new QueuedWebSocket();
    ws.send(event, serial_number);

    const {event: rEvent1, data: rData1} = await ws.receive();
    expect(rEvent1).toBe(event);
    expect(rData1.isReply).toBe(true);
    expect(r1.test(rData1.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: "", serial_number: serial_number});

    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe(event);
    expect(rData2.isReply).toBe(true);
    expect(r1.test(rData2.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, serial_number: ""});

    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe(event);
    expect(rData3.isReply).toBe(true);
    expect(r2.test(rData3.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: "", serial_number: ""});

    const {event: rEvent4, data: rData4} = await ws.receive();
    expect(rEvent4).toBe(event);
    expect(rData4.isReply).toBe(true);
    expect(r1.test(rData4.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: "", serial_number1: 123456789});

    const {event: rEvent5, data: rData5} = await ws.receive();
    expect(rEvent5).toBe(event);
    expect(rData5.isReply).toBe(true);
    expect(r1.test(rData5.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, serial_number1: 123456789});

    const {event: rEvent6, data: rData6} = await ws.receive();
    expect(rEvent6).toBe(event);
    expect(rData6.isReply).toBe(true);
    expect(r2.test(rData6.reply)).toBe(true);

    ws.close();


    done();
  })

});