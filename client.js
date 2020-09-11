document.getElementById("save-btn").addEventListener('click', ()=>{
  console.log("Saving HTML file")
  var ws = new WebSocket("ws://127.0.0.1:5678/save")
  
  ws.onopen = function(evt) {
    let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`
    ws.send(html)
  };
  ws.onclose = function(evt) {
    console.log("HTML File was sent")
  };
})



document.getElementById("stop-btn").addEventListener('click', ()=>{
  console.log("Stopping Server")
  var ws = new WebSocket("ws://127.0.0.1:5678/stop")
  
  ws.onopen = function(evt) {
    let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`
    ws.send(html)
  };
  ws.onclose = function(evt) {
    console.log("Server was stopped")
  };
})




document.getElementById("process-btn").addEventListener('click', ()=>{
  console.log("Sending SN processing message")
  var ws = new WebSocket("ws://127.0.0.1:5678/monitor")
  
  ws.onopen = function(evt) {
    ws.send('1,2,3,4,5,6,7')
  };
  ws.onclose = function(evt) {
    console.log("SNs processing message was completed")
  };
})








var ws = new WebSocket("ws://127.0.0.1:5678/"),
    messages = document.createElement('ul');

ws.onmessage = function (event) {
    var messages = document.getElementsByTagName('ul')[0],
        message = document.createElement('li'),
        content = document.createTextNode(event.data);
    message.appendChild(content);
    messages.appendChild(message);
};

document.body.appendChild(messages);

