//Import All Required Node Modules
var express = require('express')
var bodyParser = require('body-parser')

//Initialize and express app
var app = express()
//Import database module
var db=require('./../db');
//Path for static files
app.use(express.static('public'))

//Defining routes

//The ping/welcome route
app.get('/', function (req, res) {
	res.json({ message: 'Welcome to Elements Culmyca 2017\'s REST API' }); 
})

//Open APIS
app.get('/eventlist',db.eventlist)
app.get('/eventlist/:clubname',db.eventListByClubName)
app.get('/eventlist/category/:name',db.eventListByCategory)
app.get('/userinfo/:phonenumber', db.userinfo)
app.post('/register', db.register)
app.post('/getAccessToken', db.getAccessToken)
app.get('/registrationdetails/:phonenumber', db.registrationdetails)

//Secured APIS
//BUG: some other auth person can intrude into other clubs registrations
app.get('/registrations/:clubname/:eventid/:accesstoken', db.getregistrations)
app.get('/pay/:phonenumber/:eventid/:qrcode/:accesstoken', db.updatepaymentstatus)
app.get('/getQRCodeDetails/:qrcode/:accesstoken', db.qrdetails)
app.get('/arrived/:qrcode/:accesstoken', db.arrivalstatus)
app.post('/eventRegister/:accesstoken',db.eventregister)
app.post('/eventUpdate/:accesstoken', db.eventUpdate)

//Private APIS
app.post('/adminregister',db.adminregister)

//Experimental APIS
app.get('/sms',function(req,res){
	var exotel = require('exotel')({
		id   : 'rapl5', 
		token: '375ca3d72e5a88dc6b8c92f32ae6c3889efa6324'
	});
	exotel.sendSMS('07838481559', 'Hi Himani, your number 07838481559 is now turned on and your OTP to proceed is 123.', function (err, resdata) {
		res.send(resdata);
	});
})

app.get('/email',db.sendEmail)
app.get('/pdf', db.pdf)

//Miscellaneous APIS
app.get('/*', function (req, res) {
	res.json({ error: 'Requested API endpoint is invalid' }); 
})

app.post('/*', function (req, res) {
	res.json({ error: 'Requested API endpoint is invalid' }); 
})

module.exports = app;