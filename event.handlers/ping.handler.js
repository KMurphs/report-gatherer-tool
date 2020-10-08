
const ping = {
  handle: function(sendMsgHelper, data){
    
    sendMsgHelper.reply("PONG");
    
    // setTimeout(()=>{
    //   sendMsgHelper.push("third-party-event", "some-data");
    // }, 1000)
  }
}

module.exports = { ping }