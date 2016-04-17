// Express initializes app to be a function handler you can supply
// to an HTTP server
var app = require('express')();
var http = require('http').Server(app);
var indico = require('indico.io');
var indicoApiKey = process.env.INDICO_API_KEY;
indico.apiKey = indicoApiKey;
var io = require('socket.io')(http);

var computeSentimentColor = function (sentiment) {
    // Algorithm adapted from UX StackExchange
    // http://ux.stackexchange.com/q/34875/25996
    var rating = parseFloat(sentiment) * 10;
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
};

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
        var logError = function(err) { console.log(err); }
        var promise = indico.sentiment(msg)
            .then(function(res){
                console.log('sentiment: ' + res);
                var rgbAttr = computeSentimentColor(res);
                console.log('rgbAttr: ' + rgbAttr);
                console.log('message: ' + msg);
                io.emit('message event',
                    {
                        'msg': msg,
                        'rgbAttr': rgbAttr
                    });
            })
            .catch(logError)
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
