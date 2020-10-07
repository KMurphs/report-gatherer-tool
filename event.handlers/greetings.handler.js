
const greetings = {
  handle: function(appContext, data){
    
    appContext.sendReply("received");
    
    setTimeout(()=>{
      appContext.sendMessage("some-data", "third-party-event");
    }, 1000)
  }
}

module.exports = { greetings }