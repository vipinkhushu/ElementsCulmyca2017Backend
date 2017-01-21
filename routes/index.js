var express = require('express')
var app = express()

//Defining routes
app.get('/', function (req, res) {
     res.json({ message: 'Welcome to Elements Culmyca 2017\'s REST API' }); 
})

app.get('/registerParticipant', function (req, res) {
     res.json({ message: 'admin! welcome to our api!' }); 
})

app.get('/registerParticipant', function (req, res) {
     res.json({ message: 'admin! welcome to our api!' }); 
})

app.get('/showParticipants/:clubname', function (req, res) {
     res.json({ message: 'admin! welcome to our api!' }); 
})

app.get('/*', function (req, res) {
     res.json({ error: 'Requested API endpoint is invalid' }); 
})

module.exports = app;