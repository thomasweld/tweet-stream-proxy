'use strict';

// Our Includes
const app   = require('express')(),
      http  = require('http').Server(app),
      Twit  = require('twit'),
      io    = require('socket.io')(http),
      port  = process.env.PORT || 3000

// Create a Twitter Stream Object
const T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_SECRET_TOKEN,
  timeout_ms:           60*1000
});

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    ('OPTIONS' == req.method) ? res.send(200) : next();
};

app.use(allowCrossDomain);

io.set('origins', '*');


// Janky way to prevent dupliate tweets
const tweets = [];

// Run on connection
io.on('connection', function(socket){

  console.log('connected');

  let cords = socket.handshake.query.cords.split(',');
  let stream = T.stream('statuses/filter', { locations: cords, track: socket.handshake.query.tag });

  stream.on('tweet', function (tweet) {

    // Check to see if tweet has been sent
    if (tweets.indexOf(tweet.id) >= 0) {
      io.emit('newTweet', tweet);
    }
    // Store tweet by it's ID
    tweets.push(tweet.id);

  });
});

setInterval( function () {
  tweets.length = 0;
}, 3000);

// Run Server
http.listen(port, function(){
  console.log('listening on *:' + port);
});



