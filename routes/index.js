var express = require('express')
var app = express()
var db=require('./../db');
var bodyParser = require('body-parser')

//Defining routes
app.get('/', function (req, res) {
     res.json({ message: 'Welcome to Elements Culmyca 2017\'s REST API' }); 
})

app.get('/eventlist',db.eventlist)

app.get('/userinfo/:phonenumber', db.userinfo)

app.post('/register', db.register)

app.post('/getAccessToken', db.getAccessToken)

//some other auth person can intrude into other clubs registrations
app.get('/registrations/:clubname/:eventid/:accesstoken', db.getregistrations)

app.get('/pay/:phonenumber/:eventid/:qrcode/:accesstoken', db.updatepaymentstatus)

app.get('/arrived/:qrcode/:accesstoken', db.arrivalstatus)

//Not in docs
app.get('/eventRegister',db.eventregister)

app.post('/adminregister',db.adminregister)

app.get('/*', function (req, res) {
     res.json({ error: 'Requested API endpoint is invalid' }); 
})

app.post('/*', function (req, res) {
     res.json({ error: 'Requested API endpoint is invalid' }); 
})

module.exports = app;