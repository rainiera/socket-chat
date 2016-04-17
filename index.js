// Express initializes app to be a function handler you can supply
// to an HTTP server
var app = require('express')();
var http = require('http').Server(app);
var indico = require('indico.io');
var indicoApiKey = process.env.INDICO_API_KEY;
indico.apiKey = indicoApiKey;

// Initialize a new instance of socket.io by passing the http object
var io = require('socket.io')(http);

var color = 'rgb(64, 64, 64)';
var logError = function(err) { console.log(err); }
var response = function(res) {
    console.log(res);
    color = computeSentimentColor(res);
    console.log(color);
}

var computeSentimentColor = function (sentiment) {
    // Algorithm adapted from UX StackExchange
    // http://ux.stackexchange.com/q/34875/25996
    var rating = sentiment * 10;
    var parts = (rating > 5) ? (1-((rating-5)/5)) : rating/5;
    parts = Math.round(parts * 255);
    if (rating < 5) {
        color = [255, parts, 0];
    }
    else if (rating > 5){
        color = [parts, 255, 0];
    }
    else {
        color = [255,255,0]
    }
    return 'rgb(' + color.join(',') + ')';
}

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
        indico.sentiment(msg)
            .then(response)
            .catch(logError)
        // var color = computeSentimentColor(response);
        console.log('message: ' + msg);
        io.emit('chat message', msg);
        // io.emit('message rgb', color);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
