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
  let _id = new Date().getTime()
  this.message = {
    event: eventName, 
    data: eventData || "", 
    // _msgID: _id
  }


  // Construct to hide _id, event, data
  var messageObj = {}
  messageObj.toMessage = function(){
    return JSON.stringify({...this.message, _msgID: _id})
  }.bind(this)
  messageObj.getEvent = function(){
    return this.message.event
  }.bind(this)
  messageObj.getData = function(){
    return this.message.data
  }.bind(this)
  return messageObj;

  // Construct to hide _id
  // Current implementation of websocketmessage is not adequate. 
  // the prototype funciton (accessible by all at any time), becomes 
  // linked to the _id of a specfic instance
  // WebSocketMessage.prototype.toMessage = function(){
  //   // The id below will bind to the id of last elemt created
  //   return JSON.stringify({...this.message, _msgID: _id}) 
  // }.bind(this)

}
// can't use this: The implementation is not adequate. 
// the prototype funciton (accessible by all at any time), becomes 
// linked to the _id of a specfic instance
// Predeclare prototype
// WebSocketMessage.prototype.toMessage = function(){
//   // return null
//   // return JSON.stringify({...this.message})
// }
WebSocketMessage.buildReply = function(messageStr, replyObj = null){


  let messagefromStr = null;
  try{ messagefromStr = JSON.parse(messageStr); }
  catch(err){ throw new Error(`Could not Parse Message: '${messageStr}': `, err); }


  if(!messagefromStr || !messagefromStr.event || !messagefromStr._msgID) throw new Error('Received Invalid Message')

  
  let shadowMessage = new WebSocketMessage(
    messagefromStr.event, 
    {
      isReply: true,
      reply: replyObj || 'received'
    }
  );


  // let userMessage = {}
  // userMessage.toMessage = function(){
  //   return shadowMessage.toMessage()
  //                       .replace(/"_msgID":[0-9]*/, `"_msgID": ${messagefromStr._msgID}`)
  // }

  return shadowMessage.toMessage()
                      .replace(/"_msgID":[0-9]*/, `"_msgID": ${messagefromStr._msgID}`)
  // return userMessage
}


WebSocketMessage.fromString = function(messageStr){


  let messagefromStr = null;
  try{ messagefromStr = JSON.parse(messageStr); }
  catch(err){ throw new Error(`Could not Parse Message: '${messageStr}': `, err); }


  if(!messagefromStr || !messagefromStr.event || !messagefromStr._msgID) throw new Error('Received Invalid Message')
  

  return new WebSocketMessage(messagefromStr.event, messagefromStr.data)
}

module.exports = { WebSocketMessage }