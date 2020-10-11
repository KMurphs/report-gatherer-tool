const WebSocket = require('ws');
const fs = require("fs")
const path = require("path")

const { WebSocketMessage } = require("./helpers/ws.message.helper")
const { createAppFolders, prepareArchiveFolder, finalizeArchiveFolder } = require("./helpers/app.file.system.helper");
const { rejects } = require('assert');


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


const setupWBConnection = (msg, data, cb, closeCb, autoCloseConnection = true)=>{
  
  const ws = new WebSocket(serverURL);


  // ws.on('error', err => { console.error(err); expect(1).toBe(2); terminate(); });
  ws.on('close', (evt) => {});
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



class QueuedWebSocket{
  
  constructor(url = serverURL){
    this.serverURL = url;
    this.ws = new WebSocket(this.serverURL);
    this.isWSopened = false;
    this.items = [];


    this.ws.on('close', (evt) => {});
    this.ws.on('open', () => { this.isWSopened = true; })
    this.ws.on('message', res => {
      const payload = WebSocketMessage.fromString(res);
      const event = payload.getEvent();
      const data = payload.getData();
      
      this.items.push({ event, data })
    });
  }


  close(){
    this.ws.close();
  }


  send(event, data, timeoutMs = 1000){

    let tickCounter = 0;
    let tickMs = 100;
    timeoutMs = (typeof(timeoutMs) === 'number' && timeoutMs > tickMs) ? timeoutMs: 1000;

    const tick = ()=>{
      setTimeout(()=>{
        tickCounter = tickCounter + 1;
  
        if(this.isWSopened) return this.ws.send(new WebSocketMessage(event, data).toMessage());
        if(tickCounter === (timeoutMs/tickMs)) throw new Error("Unable to open Websocket to remote device");
  
        tick();
      }, tickMs)
    }
    tick();

  }


  receive(timeoutMs = 1000){
    return new Promise((resolve, reject) => {

      let tickCounter = 0;
      let tickMs = 100;
      timeoutMs = (typeof(timeoutMs) === 'number' && timeoutMs > tickMs) ? timeoutMs: 1000;

      
      const tick = ()=>{
        setTimeout(()=>{
          tickCounter = tickCounter + 1;
    
          if(this.items.length !== 0) return resolve(this.items.shift());
          if(tickCounter === (timeoutMs/tickMs)) return reject("timeout while waiting on websocket");
    
          tick();
        }, tickMs)
      }
      tick();



    })
  }

}













const beforeAllTestUtil = function(){
  
  let configFind;
  let serialsToFind;
  let tests = [];


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
  // console.log(configFind)

  serialsToFind = [];
  for(let i = 1 ; i <= filesPerLoc * locs.length ; i = i + 2){
    serialsToFind.push(`serial_number_${i}`);
  }
  // console.log(serialsToFind)


  tests.push({css_selector: "div > div.class3", name: "Test 1", expected_value: "SOME Content"});
  tests.push({css_selector: "div > div.class4", name: "Test 2", expected_value: "SOME Other Content"});



  return { configFind, serialsToFind, tests, appFolder }
}

module.exports = { serverURL, sendMessageToServer, beforeAllTestUtil, QueuedWebSocket }