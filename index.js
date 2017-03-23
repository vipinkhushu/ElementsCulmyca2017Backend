//Import All Required Node Modules
var express = require('express')
var bodyParser = require('body-parser');

//Initialize an express app
var app = express()

//Import local modules for routes and database
var routes=require('./routes');
var db=require('./db');

//Process application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//To enable cross origin resource sharing (CORS)
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


//Setting up main routes
app.get('/', routes);
app.use('/api/v1', routes);
app.get('/*', routes);
app.post('/*',routes);

//Setting up port
app.set('port', (process.env.PORT || 3000))

//Spin up the server
app.listen(app.get('port'), function() {
	console.log('APIs running on port', app.get('port'))
})

