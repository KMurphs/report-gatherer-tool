const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { sendMessageToServer, beforeAllTestUtil } = require("./test.utils")



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

    const event = 'find-sn'
    const project_name = 'test-project'
    const serial_number = serialsToFind[0]
    let eventCounter = -1;
    
    await new Promise(resolve => {
      sendMessageToServer('config', {
        project_name: project_name,
        regex_template: configFind.regexExpression,
        regex_template_placeholder: configFind.regexPlaceholder,
        directories_to_look_for_reports: [...(configFind.from)],
      }, (rEvent, rData) => {
        // console.log(rData)
        expect(rEvent).toBe('config');
        expect(rData.isReply).toBe(true);
        resolve()
      })
    })


    let ws = null
    const r1 = new RegExp("^.*(processing){1}.*$");
    const r2 = new RegExp(
      configFind.regexExpression.replace(
        configFind.regexPlaceholder, 
        serial_number
      )
    );




    ws = sendMessageToServer(event, {project_name, serial_number}, (rEvent, rData) => {

      eventCounter = eventCounter + 1;

      if(eventCounter === 0){

        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);
        expect(r1.test(rData.reply)).toBe(true);

      }else{

        expect(rEvent).toBe(event);
        expect(r2.test(rData.name)).toBe(true);
        expect(fs.existsSync(rData.path)).toBe(true);

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

    expect(1).toBe(1);
    ws.close();
    done();
    

  })
























  test('Should handle invalid project name or serial number during request to find report file for serial number', done => {

    const event = 'find-sn'
    const serial_number = "123456789"
    const project_name = 'test-project'

    
    sendMessageToServer(event, serial_number, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", serial_number: serial_number}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: project_name, serial_number: ""}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Serial){1}.*(Number){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", serial_number: ""}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", serial_number1: 123456789}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: project_name, serial_number1: 123456789}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Serial){1}.*(Number){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
  })
});