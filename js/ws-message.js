// // https://stackoverflow.com/a/8420905/9034699
// (function(exports){
//   exports.test = function(){
//        return 'This is a function from shared module';
//   };
// }(typeof exports === 'undefined' ? this.share = {} : exports));
// On the server side just use:
// var share = require('./share.js');
// share.test();
// And on the client side just load the js file and then use
// share.test();




function WebSocketMessage(eventName, eventData){
  if(!eventName || eventName == "") throw new TypeError("Provide a valid string as event name");
  
  // Hide id by letting it exists only in the constructor
  // Which means that any function that needs to use it must be defined
  // here
  // Use the scope and closure principles to achieve this 
  const _id = new Date().getTime()
  this.message = {
    event: eventName, 
    data: eventData || "", 
    // _msgID: _id
  }


  // Construct to hide _id
  // var messageObj = {}
  // messageObj.toMessage = function(){
  //   return JSON.stringify({...this.message, _msgID: _id})
  // }.bind(this)
  // return messageObj;

  // Construct to hide _id
  WebSocketMessage.prototype.toMessage = function(){
    // The id below will bind to the id of last elemt created
    return JSON.stringify({...this.message, _msgID: _id}) 
  }.bind(this)

}
// Predeclare prototype
WebSocketMessage.prototype.toMessage = function(){
  return null
  // return JSON.stringify({...this.message})
}
WebSocketMessage.fromString = function(messageStr){
  let messageObj = null;
  try{
    messageObj = JSON.parse(messageStr);
  }
  catch(err){
    console.error(`Could not Parse Message: '${messageStr}': `, err);
  }


  let message = new WebSocketMessage(
    messageObj && messageObj.event || null, 
    messageObj && messageObj.data || null, 
  );
  message._msgID = messageObj && messageObj._msgID || null


  return message
}

// module.exports = { WebSocketMessage }