//Import All Required Node Modules
var express = require('express')
var bodyParser = require('body-parser');

//Initialize an express app
var app = express()
var routes=require('./routes');
var db=require('./db');

//Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Setting up routes
app.get('/', routes);
app.use('/api/v1', routes);
app.get('/*', routes);
app.post('/*',routes);

//Setting up port
app.set('port', (process.env.PORT || 5000))

//Spin up the server
app.listen(app.get('port'), function() {
    console.log('APIs running on port', app.get('port'))
})

