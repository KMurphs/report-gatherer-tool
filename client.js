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
  console.log("Saving HTML file")
  var ws = new WebSocket("ws://127.0.0.1:5678/stop")
  
  ws.onopen = function(evt) {
    let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`
    ws.send(html)
  };
  ws.onclose = function(evt) {
    console.log("HTML File was sent")
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

