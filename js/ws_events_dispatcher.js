/*

https://gist.github.com/ismasan/299789


The MIT License (MIT)
Copyright (c) 2014 Ismael Celis
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-------------------------------*/
/*
Simplified WebSocket events dispatcher (no channels, no users)
var socket = new FancyWebSocket();
// bind to server events
socket.bind('some_event', function(data){
  alert(data.name + ' says: ' + data.message)
});
// broadcast events to all connected users
socket.send( 'some_event', {name: 'ismael', message : 'Hello world'} );
*/





function WebSocketWithDispatch(url){
  
  if(!url) throw new TypeError("Please Provide URL of server");
  this.conn = null;
  this.callbacks = {};
  this.url = url;
};

WebSocketWithDispatch.prototype.version = "1.0";
WebSocketWithDispatch.prototype.bind = function(event_name, callback){
  this.callbacks[event_name] = callbacks[event_name] || [];
  this.callbacks[event_name].push(callback);
  return this; // chainable
};
WebSocketWithDispatch.prototype.send = function(event_name, event_data){
  const payload = JSON.stringify({event: event_name, data: event_data, msg_id: new Date().getTime()});
  this.conn.send( payload ); // <= send JSON data to socket server
  return this;
};
WebSocketWithDispatch.prototype.dispatch = function(event_name, message){
  var chain = this.callbacks[event_name];
  if(typeof chain == 'undefined') return; // no callbacks for this event
  for(var i = 0; i < chain.length; i++){
    chain[i]( message )
  }
}
WebSocketWithDispatch.prototype.connect = function(onMessageCb, onOpenCb, onCloseCb, onErrorCb){

  return new Promise(function(resolve, reject){
    
    this.conn = new WebSocket(this.url);


		this.conn.onopen = function(evt) {

      // dispatch close connection event to anyone suscribed
      this.dispatch('close', null)

			console.log('Socket is established with remote server');
			if(onOpenCb) onOpenCb();
			resolve();
    }.bind(this);
    


		this.conn.onmessage = function(evt) {

      // dispatch to the right handlers
      var json = JSON.parse(evt.data)
      this.dispatch(json.event, json.data)

      if(onMessageCb) onMessageCb();
			console.log('Remote Device sent: ', evt);
    }.bind(this);  
    



		this.conn.onclose = function(evt) {
      
      // dispatch close connection event to anyone suscribed
      this.dispatch('close', null)

      if(onCloseCb) onCloseCb();
      console.log('Socket is closed: ', evt.reason);
      
      reject();
		}.bind(this);





		this.conn.onerror = (function(evt) {

			if(onErrorCb) onErrorCb(evt);
      console.log('Socket in error state: ', evt.reason, '\n Closing');
      this.conn.close();
      
		}).bind(this)



  }.bind(this))

};



