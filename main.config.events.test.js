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







describe('WebSocket Server Functionality: Config Data Endpoint for CRUD Operations', () => {

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

});