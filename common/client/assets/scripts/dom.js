
const serverIP = "127.0.0.1"
const serverPort = "5678"


var messages = document.createElement('ul');
document.body.appendChild(messages);


var ws = new WebSocket(`ws://${serverIP}:${serverPort}/`)
ws.onmessage = function (event) {
  // console.log(event)
  let msg = JSON.parse(event.data)
  console.log(msg)
  switch(msg.command){
    case "status":
      var messages = document.getElementsByTagName('ul')[0],
          message = document.createElement('li'),
      content = document.createTextNode(msg.data);
      message.appendChild(content);
      messages.appendChild(message);
      break;

    case "get_html_file":
      let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`;
      html = html.replace(/disable-on-frozen/g,'disable-on-frozen--active')
      html = html.replace('<script src="assets/scripts/websocket-client.js"></script>', '<!-- <script src="client.js"></script> -->')
      ws.send(html);
      break;

    default:
      console.warn("Server sent unsupported command: ", msg.command);
      break;
  }
};








document.getElementById("save-btn").addEventListener('click', ()=>{
  let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`
  sendMessage("/save", html)
  .then(res => console.log(res))
  .catch(err => console.log(err))
})

document.getElementById("ping-btn").addEventListener('click', ()=>{
  console.log("[Client]: PING")
  sendMessage("/ping", "", true)
  .then(res => console.log(res))
  .catch(err => console.log(err))
})

document.getElementById("stop-btn").addEventListener('click', ()=>{
  sendMessage("/stop")
  .then(res => {
    console.log(res)
    window.close()
  })
  .catch(err => {
    console.log(err)
    // window.close()
  })
})



const sendMessage = (serverPath, message, waitForReply = false)=>{

  return new Promise((resolve, reject) => {
    var ws = new WebSocket(`ws://${serverIP}:${serverPort}${serverPath}`)

    ws.onopen = function(evt) {
      ws.send(message)
      if(!waitForReply) resolve({"result": "success"})
    };
    
    ws.onmessage = function(evt) {
      resolve({"result": "success", "reply": evt.data})
    };

    ws.onerror = function(evt) {
      reject({"result": "fail", "error": evt.data})
    }
  })

}