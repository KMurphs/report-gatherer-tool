const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { QueuedWebSocket, beforeAllTestUtil } = require("./test.utils")



let configFind;
let serialsToFind;
let tests = [];
let appFolder;
beforeAll(() => {
  const res = beforeAllTestUtil()
  configFind = res.configFind
  serialsToFind = res.serialsToFind
  tests = res.tests
  appFolder = res.appFolder
});




describe('WebSocket Server Functionality: Archiving Endpoints', () => {

  test('Should prepare project folder', async (done) => {

    const event = 'order-number'
    const project_name = 'test-project-1'
    const order_number = 1234567890
    let eventCounter = -1;
    const serial_number = serialsToFind[0];
    let file_path = null
    let archive_destination = null





    let ws = new QueuedWebSocket();
    ws.send('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    });


    const {event: rEvent1, data: rData1} = await ws.receive();
    expect(rEvent1).toBe('config');
    expect(rData1.isReply).toBe(true);


    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe('config');
    expect(fs.existsSync(rData2.destination)).toBe(true);
    archive_destination = rData2.destination;

    ws.close();



    done();
    

  }, 10000)























  test('Should move serial number file folder', async (done) => {

    const project_name = 'test-project-1'
    const order_number = 1234567890
    const serial_number = serialsToFind[0];
    let file_path = null
    let archive_destination = null









    let ws = new QueuedWebSocket();
    ws.send('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    });


    const {event: rEvent1, data: rData1} = await ws.receive();
    expect(rEvent1).toBe('config');
    expect(rData1.isReply).toBe(true);


    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe('config');
    expect(fs.existsSync(rData2.destination)).toBe(true);
    archive_destination = rData2.destination;

    ws.close();









    ws = new QueuedWebSocket();
    ws.send('find-sn-file', {project_name, serial_number});


    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe('find-sn-file');
    expect(rData3.isReply).toBe(true);

    const {event: rEvent4, data: rData4} = await ws.receive();
    expect(rEvent4).toBe('find-sn-file');
    expect(fs.existsSync(rData4.path)).toBe(true);
    file_path = rData4.path;

    ws.close();










    ws = new QueuedWebSocket();
    ws.send('move-sn-file', {project_name, file_path});

    
    const {event: rEvent5, data: rData5} = await ws.receive();
    expect(rEvent5).toBe('move-sn-file');
    expect(rData5.isReply).toBe(true);
    expect(fs.existsSync(rData5.reply.new_file_path)).toBe(true);
    const srcFile = fs.promises.readFile(file_path);
    const dstFile = fs.promises.readFile(rData5.reply.new_file_path);
    expect(await srcFile).toStrictEqual(await dstFile);

    ws.close();

    done();
    

  })
  test('Should archive destination folder', async (done) => {

    const project_name = 'test-project-1'
    const order_number = 1234567890
    const serial_number = serialsToFind[0];
    let file_path = null
    let archive_destination = null









    let ws = new QueuedWebSocket();
    ws.send('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    });


    const {event: rEvent1, data: rData1} = await ws.receive();
    expect(rEvent1).toBe('config');
    expect(rData1.isReply).toBe(true);


    const {event: rEvent2, data: rData2} = await ws.receive();
    expect(rEvent2).toBe('config');
    expect(fs.existsSync(rData2.destination)).toBe(true);
    archive_destination = rData2.destination;

    ws.close();









    ws = new QueuedWebSocket();
    ws.send('find-sn-file', {project_name, serial_number});


    const {event: rEvent3, data: rData3} = await ws.receive();
    expect(rEvent3).toBe('find-sn-file');
    expect(rData3.isReply).toBe(true);

    const {event: rEvent4, data: rData4} = await ws.receive();
    expect(rEvent4).toBe('find-sn-file');
    expect(fs.existsSync(rData4.path)).toBe(true);
    file_path = rData4.path;

    ws.close();










    ws = new QueuedWebSocket();
    ws.send('move-sn-file', {project_name, file_path});

    
    const {event: rEvent5, data: rData5} = await ws.receive();
    expect(rEvent5).toBe('move-sn-file');
    expect(rData5.isReply).toBe(true);
    expect(fs.existsSync(rData5.reply.new_file_path)).toBe(true);

    ws.close();

    







    let r = new RegExp("^.*(repository).*(archived)", "i");
    ws = new QueuedWebSocket();
    ws.send('archive-sn-files', {project_name, file_path});

    
    const {event: rEvent6, data: rData6} = await ws.receive(5000);
    expect(rEvent6).toBe('archive-sn-files');
    expect(rData6.isReply).toBe(true);
    expect(r.test(rData6.reply.message)).toBe(true);
    expect(fs.existsSync(rData6.reply.zip_file_path)).toBe(true);

    ws.close();

    done();
  }, 10000)






















  // test('Should handle invalid project name or file path during request to test report file for serial number', done => {

  //   const event = 'test-sn-file'
  //   const file_path = "some\\path"
  //   const project_name = 'test-project'

    
  //   sendMessageToServer(event, file_path, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  //   sendMessageToServer(event, {project_name: "", file_path: file_path}, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  //   sendMessageToServer(event, {project_name: project_name, file_path: ""}, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(File){1}.*(Path){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  //   sendMessageToServer(event, {project_name: "", file_path: ""}, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  //   sendMessageToServer(event, {project_name: "", file_path: 123456789}, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  //   sendMessageToServer(event, {project_name: project_name, file_path: 123456789}, (rEvent, rData) => {
  //     expect(rEvent).toBe(event);
  //     expect(rData.isReply).toBe(true);

  //     let r = new RegExp("^.*(File){1}.*(Path){1}.*(provided){1}.*(Invalid){1}.*$")
  //     expect(r.test(rData.reply)).toBe(true);
  //   }, done)
  // })

});