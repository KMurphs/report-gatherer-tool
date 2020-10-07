const serverURL = "ws://localhost:9898/"

var ws = null


window.addEventListener('load', async function(){

  ws = new WebSocketWithDispatch(WebSocketMessage, serverURL)
  await ws.connect();
  ws.bind("third-party-event", (msg)=>{
    console.log("Received a Pushed Event: '", 'third-party-event', "' - Message: '", msg, "'")
  })

  ws.send("greetings", "Hello Server. this is client")

  getConfig.setup((evt, data) => ws.send(evt, data), (evt, cb) => ws.bind(evt, cb));
  updateConfig.setup((evt, data) => ws.send(evt, data), (evt, cb) => ws.bind(evt, cb));
  // getConfig.setup(ws.send, ws.bind);

})



const getConfig = {
  setup: function(publishEvent, suscribeToEvent){
    publishEvent && getConfigButton.addEventListener('click', ()=>{
      const project = getConfigInput.value;
      publishEvent('config', project);
    })
    suscribeToEvent && suscribeToEvent('config', (msg) => {
      getConfigResponse.innerText = JSON.stringify(msg)
    })
  }
}




const updateConfig = {
  setup: function(publishEvent, suscribeToEvent){
    publishEvent && updateConfigButton.addEventListener('click', ()=>{
      const dataObj = JSON.parse(updateConfigInput.value);
      publishEvent('config', dataObj);
    })
    suscribeToEvent && suscribeToEvent('config', (msg) => {
      updateConfigResponse.innerText = JSON.stringify(msg)
    })
  }
}