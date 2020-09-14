const serverIP = "127.0.0.1"
const serverPort = "5678"


var ws = new WebSocket(`ws://${serverIP}:${serverPort}/`)
ws.onmessage = function (event) {

  let msg = JSON.parse(event.data)
  console.log(msg)

  switch(msg.command){

    case "status":
      setTimeout(domHandleSerialNumber(msg.id, msg.event, msg.data), 0)
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