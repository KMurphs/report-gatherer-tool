const serverURL = "ws://localhost:9898/"




window.addEventListener('load', async function(){

  var ws = new WebSocketWithDispatch(WebSocketMessage, serverURL)
  await ws.connect();

  ws.send("greetings", "Hello Server. this is client")
})
