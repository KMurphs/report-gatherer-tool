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

  test('Should test report file of serial number', async (done) => {

    const event = 'test-sn-file'
    const project_name = 'test-project'
    const serial_number = serialsToFind[0]
    let file_path = null
    let eventCounter = -1;
    
    await new Promise(resolve => {
      sendMessageToServer('config', {
        project_name: project_name,
        regex_template: configFind.regexExpression,
        regex_template_placeholder: configFind.regexPlaceholder,
        directories_to_look_for_reports: [...(configFind.from)],
        tests_to_validate_reports: [...tests],
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




    ws = sendMessageToServer('find-sn', {project_name, serial_number}, (rEvent, rData) => {

      eventCounter = eventCounter + 1;

      if(eventCounter === 0){

        expect(rEvent).toBe('find-sn');
        expect(rData.isReply).toBe(true);
        expect(r1.test(rData.reply)).toBe(true);

      }else{

        expect(rEvent).toBe('find-sn');
        expect(r2.test(rData.name)).toBe(true);
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




    eventCounter = -1;
    console.log(file_path)
    ws = sendMessageToServer(event, {project_name, file_path}, (rEvent, rData) => {

      eventCounter = eventCounter + 1;

      if(eventCounter === 0){

        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);
        expect(r1.test(rData.reply)).toBe(true);

      }else{

        expect(rEvent).toBe(event);

        expect(rData.hasPassed).toBe(true);
        tests.forEach((test, index) => {
          expect(rData.items[index].hasPassed).toBe(true);
          expect(rData.items[index].test.name).toBe(test.name);
          expect(rData.items[index].test.expected_value).toBe(test.expected_value);
          expect(rData.items[index].test.actual_value.toLowerCase()).toBe(test.expected_value.toLowerCase());
          expect(rData.items[index].test.css_selector).toBe(test.css_selector);
        })  

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
    

  }, 10000)
























  test('Should handle invalid project name or file path during request to test report file for serial number', done => {

    const event = 'test-sn-file'
    const file_path = "some\\path"
    const project_name = 'test-project'

    
    sendMessageToServer(event, file_path, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", file_path: file_path}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: project_name, file_path: ""}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(File){1}.*(Path){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", file_path: ""}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: "", file_path: 123456789}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(Project){1}.*(Name){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
    sendMessageToServer(event, {project_name: project_name, file_path: 123456789}, (rEvent, rData) => {
      expect(rEvent).toBe(event);
      expect(rData.isReply).toBe(true);

      let r = new RegExp("^.*(File){1}.*(Path){1}.*(provided){1}.*(Invalid){1}.*$")
      expect(r.test(rData.reply)).toBe(true);
    }, done)
  })

});