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




describe('WebSocket Server Functionality: Test-SN Endpoint', () => {

  test('Should test report file of serial number', async (done) => {

    const event = 'test-sn-file'
    const project_name = 'test-project'
    const serial_number = serialsToFind[0]
    let file_path = null
    let eventCounter = -1;


    let ws = new QueuedWebSocket();
    ws.send('config', {
      project_name: project_name,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
      tests_to_validate_reports: [...tests],
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
    ws.send('find-sn-file', {project_name, serial_number});

    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe('find-sn-file');
    expect(rData2.isReply).toBe(true);
    expect(r1.test(rData2.reply)).toBe(true);

    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe('find-sn-file');
    expect(r2.test(rData3.name)).toBe(true);
    expect(fs.existsSync(rData3.path)).toBe(true);
    file_path = rData3.path;

    ws.close();






    ws = new QueuedWebSocket();
    ws.send(event, {project_name, file_path});

    const {event: rEvent4, data: rData4} = await ws.receive();
    expect(rEvent4).toBe(event);
    expect(rData4.isReply).toBe(true);
    expect(r1.test(rData4.reply)).toBe(true);

    const {event: rEvent5, data: rData5} = await ws.receive();
    expect(rEvent5).toBe(event);

    expect(rData5.hasPassed).toBe(true);
    tests.forEach((test, index) => {
      expect(rData5.items[index].hasPassed).toBe(true);
      expect(rData5.items[index].test.name).toBe(test.name);
      expect(rData5.items[index].test.expected_value).toBe(test.expected_value);
      expect(rData5.items[index].test.actual_value.toLowerCase()).toBe(test.expected_value.toLowerCase());
      expect(rData5.items[index].test.css_selector).toBe(test.css_selector);
    })  

    ws.close();


    done();
  })
























  test('Should handle invalid project name or file path during request to test report file for serial number', async done => {

    const event = 'test-sn-file'
    const file_path = "some\\path"
    const project_name = 'test-project'




    let r1 = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
    let r2 = new RegExp("^.*(File){1}.*(Path){1}.*(provided){1}.*(Invalid){1}.*$")




    ws = new QueuedWebSocket();
    ws.send(event, file_path);

    const {event: rEvent1, data: rData1} = await ws.receive();
    expect(rEvent1).toBe(event);
    expect(rData1.isReply).toBe(true);
    expect(r1.test(rData1.reply)).toBe(true);

    ws.close();




    ws = new QueuedWebSocket();
    ws.send(event, {project_name: "", file_path: file_path});

    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe(event);
    expect(rData2.isReply).toBe(true);
    expect(r1.test(rData2.reply)).toBe(true);

    ws.close();



    
    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, file_path: ""});

    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe(event);
    expect(rData3.isReply).toBe(true);
    expect(r2.test(rData3.reply)).toBe(true);

    ws.close();



    
    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, file_path: ""});

    const {event: rEvent4, data: rData4} = await ws.receive();
    expect(rEvent4).toBe(event);
    expect(rData4.isReply).toBe(true);
    expect(r2.test(rData4.reply)).toBe(true);

    ws.close();



    
    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, file_path: ""});

    const {event: rEvent5, data: rData5} = await ws.receive();
    expect(rEvent5).toBe(event);
    expect(rData5.isReply).toBe(true);
    expect(r2.test(rData5.reply)).toBe(true);

    ws.close();



    
    ws = new QueuedWebSocket();
    ws.send(event, {project_name: "", file_path: 123456789});

    const {event: rEvent6, data: rData6} = await ws.receive();
    expect(rEvent6).toBe(event);
    expect(rData6.isReply).toBe(true);
    expect(r1.test(rData6.reply)).toBe(true);

    ws.close();



    
    ws = new QueuedWebSocket();
    ws.send(event, {project_name: project_name, file_path: 123456789});

    const {event: rEvent7, data: rData7} = await ws.receive();
    expect(rEvent7).toBe(event);
    expect(rData7.isReply).toBe(true);
    expect(r2.test(rData7.reply)).toBe(true);

    ws.close();


    done();
  })

});