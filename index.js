'use strict';

// Our Includes
const app   = require('express')(),
      http  = require('http').Server(app),
      Twit  = require('twit'),
      io    = require('socket.io')(http),
      port  = process.env.PORT || 3000

// Create a Twitter Stream Object
let T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_SECRET_TOKEN,
  timeout_ms:           60*1000
});

// EX  -  http://DOMAIN/?tag=tech&cords=-122.75,36.8,-121.75,37.8

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    ('OPTIONS' == req.method) ? res.send(200) : next();
};

app.use(allowCrossDomain);

// Main Page Embed
app.get('/', function(req, res){

  if (!req.query.cords || !req.query.tag) {
    return res.json({ error: 'Please specify both a set of cords and a tag'});
  }

  let cords = req.query.cords.split(',');
  let stream = T.stream('statuses/filter', { locations: cords, track: req.query.tag });

  // Run on connection
  io.on('connection', function(socket){
    stream.on('tweet', function (tweet) {
      io.emit('newTweet', tweet.text, tweet);
    });
  });

  //res.sendFile(__dirname + '/index.html');
	res.writeHead(200);
	res.end();

});

// Run Server
http.listen(port, function(){
  console.log('listening on *:' + port);
});



