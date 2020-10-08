const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { WebSocketMessage } = require("./helpers/ws.message.helper")
const { createAppFolders, prepareArchiveFolder, finalizeArchiveFolder } = require("./helpers/app.file.system.helper")

const serverURL = "ws://localhost:9898/"

const sendMessageToServer = (msg, data, cb, closeCb, autoCloseConnection = true)=>{
  const ws = new WebSocket(serverURL);


  // ws.on('error', err => { console.error(err); expect(1).toBe(2); terminate(); });
  ws.on('close', err => { closeCb && closeCb();});
  ws.on('open', async () => { ws.send(new WebSocketMessage(msg, data).toMessage()); })

  ws.on('message', res => {
    const payload = WebSocketMessage.fromString(res);
    const event = payload.getEvent();
    const data = payload.getData();

    cb && cb(event, data);
    if(autoCloseConnection) ws.close();
    
  });

  return ws;
}

let configFind;
let serialsToFind;
let tests = [];
beforeAll(() => {
  appFolder = createAppFolders();
  var fs = require('fs');
  var path = require('path');


  const testFolder = path.join(appFolder, "tests");
  if (!fs.existsSync(testFolder)){
      fs.mkdirSync(testFolder);
  }

  let fileCounter = 0;
  let filesPerLoc = 3;
  let locs = [1,2,3].map(i => path.join(testFolder, `location_${i}`));
  locs.forEach(loc => {

    // Create a test location
    if (!fs.existsSync(loc)){
      fs.mkdirSync(loc);
    }

    const testFileHTML = "\
      <!DOCTYPE html>\
      <head><title>Document</title></head>\
      <body><div class=\"class1\"><div class=\"class2\"><div class=\"class3\">Some Content</div><div class=\"class4\">Some Other Content</div></div></div></body>\
      </html>\
    "

    // Create so many test files per test locations
    for(let i = 0; i < filesPerLoc; i++){
      fileCounter++;

      let file = path.join(loc, `Dummy_Test_File_[serial_number_${fileCounter}][02 04 43 PM][2020-09-03][Passed].html`);
      fs.writeFileSync(file, testFileHTML, function (err) {
          if (err) console.log(err);
          // console.log(`[Test]: Created File: '${file}'`)
      })
      

    }
  })

  
  configFind = {
    from: [...locs],
    regexExpression: "^((Dummy_Test_File_).*(\\[{{serial_number}}\\]).*(\.html))$",
    regexPlaceholder: "{{serial_number}}"
  }
  console.log(configFind)

  serialsToFind = [];
  for(let i = 1 ; i <= filesPerLoc * locs.length ; i = i + 2){
    serialsToFind.push(`serial_number_${i}`);
  }
  console.log(serialsToFind)


  tests.push({css_selector: "div > div.class3", name: "Test 1", expected_value: "SOME Content"});
  tests.push({css_selector: "div > div.class4", name: "Test 2", expected_value: "SOME Other Content"});
});







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

    await new Promise(resolve => {
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(project_name){1}.*(missing){1}.*(empty){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })

    await new Promise(resolve => {
      data.project_name = project_name;
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(order_number){1}.*(field){1}.*(invalid){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })

    await new Promise(resolve => {
      data.order_number = 222222;
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(regex_template){1}.*(field){1}.*(invalid){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })

    await new Promise(resolve => {
      data.regex_template = configFind.regexExpression;
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(regex_template_placeholder){1}.*(field){1}.*(invalid){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })
    
    await new Promise(resolve => {
      data.regex_template_placeholder = configFind.regexPlaceholder;
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(directories_to_look_for_reports){1}.*(field){1}.*(invalid){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })
    
    await new Promise(resolve => {
      data.directories_to_look_for_reports = [...(configFind.from)];
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);

        let r = new RegExp("^.*(tests_to_validate_reports){1}.*(field){1}.*(invalid){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        resolve()
      }, done)
    })
        
    await new Promise(resolve => {
      data.tests_to_validate_reports = [...tests];
      sendMessageToServer(event, data, (rEvent, rData) => {
        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);


        resolve()
      }, done)
    })

    


  }, 10000)




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
        console.log(rData)
        expect(rEvent).toBe('config');
        expect(rData.isReply).toBe(true);
        resolve()
      })
    })


    let ws = null
    ws = sendMessageToServer(event, {project_name: project_name, serial_number: serial_number}, (rEvent, rData) => {
      eventCounter = eventCounter + 1;
      if(eventCounter === 0){

        expect(rEvent).toBe(event);
        expect(rData.isReply).toBe(true);
        const r = new RegExp("^.*(processing){1}.*$")
        expect(r.test(rData.reply)).toBe(true);
        // console.log(eventCounter)
      }else{
        // console.log(rEvent, rData);
        
        expect(rEvent).toBe(event);

        const r = new RegExp(
          configFind.regexExpression.replace(
            configFind.regexPlaceholder, 
            serial_number
          )
        );
        expect(r.test(rData.name)).toBe(true);
        expect(fs.existsSync(rData.path)).toBe(true);

        // console.log(eventCounter);
        eventCounter = eventCounter + 1;
      }


    }, false)


    await new Promise((resolve)=>{
      setTimeout(()=>{
        if(eventCounter >= 2){/*console.log("++++++", eventCounter);*/resolve();}
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