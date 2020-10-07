const serverURL = "ws://localhost:9898/"


// const ws = new WebSocket('ws://localhost:9898/');
// ws.onopen = function() {
//   console.log('WebSocket Client Connected');
//   ws.send('Hi this is web client.');
// };
// ws.onmessage = function(e) {
// console.log("Received: '" + e.data + "'");
// };


window.addEventListener('load', async function(){
  console.log("hello")
  var ws1 = new WebSocketWithDispatch(serverURL)
  await ws1.connect();
  ws1.send("greetings", "Hello Server. this is client")
})
