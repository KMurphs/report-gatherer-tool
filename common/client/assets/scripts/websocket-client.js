const serverIP = "127.0.0.1"
const serverPort = "5678"
var ws = null

const startProcessingSerialNumbers = ()=>{
  ws = new WebSocket(`ws://${serverIP}:${serverPort}/`)
  ws.onmessage = function (event) {
  
    let msg = JSON.parse(event.data)
    const {command, msg: data} = msg 
    console.log(command, data)
  
    switch(command){
  
      case "status":
        setTimeout(() => {domHandleSerialNumber(data.id, data.event, data.data)}, 0)
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
}






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