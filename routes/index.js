//Import All Required Node Modules
var express = require('express')
var bodyParser = require('body-parser')
var ga = require('node-ga')
var cookieParser = require('cookie-parser')
var request = require("request");
var mongoXlsx = require('mongo-xlsx');

//Initialize and express app
var app = express()
app.use(cookieParser());
app.use(ga('UA-92029222-1', {
    safe: true
}));

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
app.get('/deliverETicket/:email/:fullname/:qrcode/:eventid',db.sendETicket)
app.get('/pdf/:qrcode', db.pdf)
app.get('/sponsors', db.sponsors)
app.post('/addSponsor', db.addSponsor)
app.get('/backup', db.backup)
app.get('/backup/events', db.eventbackup)
app.get('/spam', db.del)

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
app.get('/otp/:phone/:key',function(req,res){
	p_no = req.params.phone;
	if(p_no.length==10){
		var options = { method: 'GET',
		  url: 'http://2factor.in/API/V1/053efa22-e848-11e6-afa5-00163ef91450/SMS/'+req.params.phone+'/'+req.params.key,
		  body: '{}' };

		request(options, function (error, response, body) {
		  if (error) throw new Error(error);
		  console.log(body);
		  res.json(body);
		});
	}else{
		res.json({"error":"invalid phonenumber length"})
	}

})
app.get('/cat', db.cat);

app.get('/backuptest', function(req, res){
	var data = [ { name : "Peter", lastName : "Parker", isSpider : true } , 
	{ name : "Remy",  lastName : "LeBeau", powers : ["kinetic cards"] }];

	var model = mongoXlsx.buildDynamicModel(data);

	mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
		console.log('File saved at:', data.fullPath); 
	});

	/* Read Excel */
	/*mongoXlsx.xlsx2MongoData("./file.xlsx", model, function(err, mongoData) {
		console.log('Mongo data:', mongoData); 
	});*/
});
//Miscellaneous APIS
app.get('/*', function (req, res) {
	res.json({ error: 'Requested API endpoint is invalid' }); 
})

app.post('/*', function (req, res) {
	res.json({ error: 'Requested API endpoint is invalid' }); 
})

module.exports = app;