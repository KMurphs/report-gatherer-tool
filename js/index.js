const serverURL = "ws://localhost:9898/"




window.addEventListener('load', async function(){

  var ws = new WebSocketWithDispatch(WebSocketMessage, serverURL)
  await ws.connect();
  ws.bind("third-party-event", (msg)=>{
    console.log("Received a Pushed Event: '", 'third-party-event', "' - Message: '", msg, "'")
  })

  ws.send("greetings", "Hello Server. this is client")
})
