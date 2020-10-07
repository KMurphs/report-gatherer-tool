
const greetings = {
  handle: function(appContext, data){
    
    appContext.reply("received");
    
    setTimeout(()=>{
      appContext.push("third-party-event", "some-data");
    }, 1000)
  }
}

module.exports = { greetings }