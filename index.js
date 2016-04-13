// Express initializes app to be a function handler you can supply
// to an HTTP server
var app = require('express')();
var http = require('http').Server(app);

// Initialize a new instance of socket.io by passing the http object
var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// });

// Refactor route handler to use `sendFile` instead
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Listen on the `connection` event for incoming sockets and log to the console
io.on('connection', function(socket){
    console.log('a user connected');
    // Socket can also fire a special `disconnect` event
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    // Listen on the `chat message` event for messages
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        // Use `io.emit` to send an event to everyone
        io.emit('chat message', msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
