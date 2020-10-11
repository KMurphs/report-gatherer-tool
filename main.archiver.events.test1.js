const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { sendMessageToServer, beforeAllTestUtil } = require("./test.utils")



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


    let ws = sendMessageToServer('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    }, (rEvent, rData) => {

      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)

      if(eventCounter === 0){
        
        expect(rEvent).toBe('config');
        expect(rData.isReply).toBe(true);

      }else{

        expect(rEvent).toBe('config');
        expect(fs.existsSync(rData.destination)).toBe(true);
        archive_destination = rData.destination;
        eventCounter = eventCounter + 1;
      }

    }, null, false)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){ resolve(); }
      }, 1000)
    })
    ws.close();



    expect(1).toBe(1);
    // ws.close();
    done();
    

  }, 10000)
  test('Should move serial number file folder', async (done) => {

    const event = 'order-number'
    const project_name = 'test-project-1'
    const order_number = 1234567890
    let eventCounter = -1;
    const serial_number = serialsToFind[0];
    let file_path = null
    let archive_destination = null


    let ws = sendMessageToServer('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    }, (rEvent, rData) => {

      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)

      if(eventCounter === 0){
        
        expect(rEvent).toBe('config');
        expect(rData.isReply).toBe(true);

      }else{

        expect(rEvent).toBe('config');
        expect(fs.existsSync(rData.destination)).toBe(true);
        archive_destination = rData.destination;
        eventCounter = eventCounter + 1;
      }

    }, null, false)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){ resolve(); }
      }, 1000)
    })
    ws.close();


    eventCounter = -1;
    ws = sendMessageToServer('find-sn-file', {project_name, serial_number}, (rEvent, rData) => {

      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)
      if(eventCounter === 0){

        expect(rEvent).toBe('find-sn-file');
        expect(rData.isReply).toBe(true);

      }else{

        expect(rEvent).toBe('find-sn-file');
        expect(fs.existsSync(rData.path)).toBe(true);

        file_path = rData.path;

        eventCounter = eventCounter + 1;
      }
    }, null, false)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){ resolve(); }
      }, 1000)
    })
    ws.close();


    eventCounter = -1;
    ws = sendMessageToServer('move-sn-file', {project_name, file_path}, async (rEvent, rData) => {
      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)
      expect(rEvent).toBe('move-sn-file');
      expect(fs.existsSync(rData.reply.new_file_path)).toBe(true);

      const srcFile = fs.promises.readFile(file_path);
      const dstFile = fs.promises.readFile(rData.reply.new_file_path);
      expect(await srcFile).toStrictEqual(await dstFile);

      eventCounter = eventCounter + 1;
    }, null, true)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 1){ resolve(); }
      }, 1000)
    })
    // ws.close();






    expect(1).toBe(1);
    // ws.close();
    done();
    

  }, 10000)
  test('Should archive destination folder', async (done) => {

    const event = 'order-number'
    const project_name = 'test-project-1'
    const order_number = 1234567890
    let eventCounter = -1;
    const serial_number = serialsToFind[0];
    let file_path = null
    let archive_destination = null

    const r1 = new RegExp("^.*(archived){1}.*$", "i");

    let ws = sendMessageToServer('config', {
      project_name: project_name,
      order_number: order_number,
      regex_template: configFind.regexExpression,
      regex_template_placeholder: configFind.regexPlaceholder,
      directories_to_look_for_reports: [...(configFind.from)],
    }, (rEvent, rData) => {

      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)

      if(eventCounter === 0){
        
        expect(rEvent).toBe('config');
        expect(rData.isReply).toBe(true);

      }else{

        expect(rEvent).toBe('config');
        expect(fs.existsSync(rData.destination)).toBe(true);
        archive_destination = rData.destination;
        eventCounter = eventCounter + 1;
      }

    }, null, false)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){ resolve(); }
      }, 1000)
    })
    ws.close();


    eventCounter = -1;
    ws = sendMessageToServer('find-sn-file', {project_name, serial_number}, (rEvent, rData) => {

      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)
      if(eventCounter === 0){

        expect(rEvent).toBe('find-sn-file');
        expect(rData.isReply).toBe(true);

      }else{

        expect(rEvent).toBe('find-sn-file');
        expect(fs.existsSync(rData.path)).toBe(true);

        file_path = rData.path;

        eventCounter = eventCounter + 1;
      }
    }, null, false)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){ resolve(); }
      }, 1000)
    })
    ws.close();


    eventCounter = -1;
    ws = sendMessageToServer('move-sn-file', {project_name, file_path}, async (rEvent, rData) => {
      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)
      expect(rEvent).toBe('move-sn-file');
      expect(fs.existsSync(rData.reply.new_file_path)).toBe(true);

      const srcFile = fs.promises.readFile(file_path);
      const dstFile = fs.promises.readFile(rData.reply.new_file_path);
      expect(await srcFile).toStrictEqual(await dstFile);

      eventCounter = eventCounter + 1;
    }, null, true)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 1){ resolve(); }
      }, 1000)
    })
    // ws.close();




    eventCounter = -1;
    ws = sendMessageToServer('archive-sn-files', {project_name, file_path}, async (rEvent, rData) => {
      eventCounter = eventCounter + 1;
      console.log(rEvent, rData)
      expect(rEvent).toBe('archive-sn-files');
      // expect(fs.existsSync(rData.reply.new_file_path)).toBe(true);

      // const srcFile = fs.promises.readFile(file_path);
      // const dstFile = fs.promises.readFile(rData.reply.new_file_path);
      // expect(await srcFile).toStrictEqual(await dstFile);

      eventCounter = eventCounter + 1;
    }, null, true)
    // Wait for both the reply and the subsequent 
    // push message when serial number is found
    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 1){ resolve(); }
      }, 1000)
    })





    expect(1).toBe(1);
    // ws.close();
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