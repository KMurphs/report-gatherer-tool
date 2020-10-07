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
  // here. Use the scope and closure principles to achieve this 
  let _id = new Date().getTime()
  this.message = {
    event: eventName, 
    data: eventData || "", 
  }


  // Construct to hide _id, event, data. Create getters to expose some of these properties
  var messageObj = {
    toMessage: function(){ return JSON.stringify({...this.message, _msgID: _id}) }.bind(this),
    getEvent: function(){ return this.message.event }.bind(this),
    getData: function(){ return this.message.data }.bind(this)
  }

  // return proxy object
  return messageObj;
}

// The _msgID is inaccessibe, but a reply must refer to the same _msgID
WebSocketMessage.buildReply = function(messageStr, replyObj = null){

  // Build vanilla object from string
  let messagefromStr = null;
  try{ messagefromStr = JSON.parse(messageStr); }
  catch(err){ throw new Error(`Could not Parse Message: '${messageStr}': `, err); }

  // Ensure that key keys are present
  if(!messagefromStr || !messagefromStr.event || !messagefromStr._msgID) throw new Error('Received Invalid Message')



  // Create a temporary shadow WebSocketMessage to use as the basis for the reply
  // Also mark the data of this message as a reply
  let shadowMessage = new WebSocketMessage(
    messagefromStr.event, 
    {
      isReply: true,
      reply: replyObj || 'received'
    }
  );

  // Finally handle the _msgID and return encoded message, ready to be sent
  return shadowMessage.toMessage()
                      .replace(/"_msgID":[0-9]*/, `"_msgID": ${messagefromStr._msgID}`)
}



// Interested in a on object with event and data readily accessible
WebSocketMessage.fromString = function(messageStr){

  // Build vanilla object from string
  let messagefromStr = null;
  try{ messagefromStr = JSON.parse(messageStr); }
  catch(err){ throw new Error(`Could not Parse Message: '${messageStr}': `, err); }

  // Ensure that key keys are present
  if(!messagefromStr || !messagefromStr.event || !messagefromStr._msgID) throw new Error('Received Invalid Message')


  return new WebSocketMessage(messagefromStr.event, messagefromStr.data)
}
// module.exports = { WebSocketMessage }