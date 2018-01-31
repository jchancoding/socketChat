const mongo = require("mongodb").MongoClient;
const client = require('socket.io').listen(4000).sockets;
const path = require('path');

//connect to mongoose
mongo.connect('mongodb://127.0.0.1/chat_db', function(err, db){
  if(err) {
    throw err;
  }
  console.log('MongoDB connected');
  console.log(db);
  //connect to socket.io
  client.on('connection', function(socket){
    let chat = db.collection('chats');
    console.log("connected to socket io in server.js")

    //create function to send status
    sendStatus = function(s) {
      socket.emit('status', s);
      console.log('sending status')
    }
    

    //get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err;
      //emit the messages
      }

      socket.emit('output', res);
    });

    //handle input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;
      console.log('ready to handle input events')

      //check for name and message
      if(name == '' || message == ''){
        //send error status
        sendStatus('Please enter a name and message');
      } else {
        //insert messages
        chat.insert({name:name, message:message}, function(){
          client.emit('output', [data]);

          //send status object
          sendStatus({
            message: 'Message sent',
            clear: true
          });
        });
      }
    });

    //Handle clear
    socket.on('clear', function(dataa){
      //remove all chats from collection
      chat.remove({}, function(){
        //emit cleared
        socket.emit('cleared');
        });
      });
    });
});