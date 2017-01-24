var express = require('express')
var app = express()
var db=require('./../db');

//Defining routes
app.get('/', function (req, res) {
     res.json({ message: 'Welcome to Elements Culmyca 2017\'s REST API' }); 
})

app.get('/eventlist',db.eventlist)

app.get('/userinfo/:phonenumber', function (req, res) {
     res.json({ message: 'Under Development' }); 
})

app.post('/register', function (req, res) {
     res.json({ message: 'Under Development' }); 
})

app.get('/registrations/:clubname/:accesstoken', function (req, res) {
     res.json({ message: 'Under Development' }); 
})

app.post('/pay/:phonenumber/:eventid/:accesstoken', function (req, res) {
     res.json({ message: 'Under Development' }); 
})

app.post('/arrived/:phonenumber/:eventid/:accesstoken', function (req, res) {
     res.json({ message: 'Under Development' }); 
})

app.get('/eventRegister',db.eventregister)

app.get('/*', function (req, res) {
     res.json({ error: 'Requested API endpoint is invalid' }); 
})

module.exports = app;