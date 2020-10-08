
const ping = {
  handle: function(appContext, data){
    
    appContext.reply("PONG");
    
    // setTimeout(()=>{
    //   appContext.push("third-party-event", "some-data");
    // }, 1000)
  }
}

module.exports = { ping }