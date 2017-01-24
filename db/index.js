var mongoose = require('mongoose');

//Database Connection
mongoose.connect('mongodb://manan:VipinVipul321@ds017175.mlab.com:17175/elements-culmyca-2017');

//Database Setup
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {         
      // we're connected!
      console.log("Connected To MongoLab Cloud Database :p");
  }); 

//Schema Setup
var eventsSchema = mongoose.Schema({
    eventName: String,
    club: String,
    category: String,
    description: String,
    rules: String,
    venue: String,
    fee: String,
    startTime: String,
    endTime: String
});

var registrationSchema = mongoose.Schema({
    phoneno: String,
    email: String,
    fullname: String,
    college: String,
    eventid: String,
    paymenttxnid: String,
    paymentphoneno: String,
    arrived: String,
    timestamp: String
});

var administrationSchema = mongoose.Schema({
    username: String,
    password: String,
    priviledge: String,
    token: String
});

var apimaintainance = mongoose.Schema({
    end_point: String,
    hits: Number
});

//Model Setup
var Event = mongoose.model('Event', eventsSchema);
var Register = mongoose.model('Register',registrationSchema);
var admin = mongoose.model('Admin',administrationSchema);
var api = mongoose.model('Api',apimaintainance);

//Registration Route
exports.eventregister=  function (req, res) {
    var newEvent = new Event({
        eventName: 'Pic Of The Day',
        club: 'jhalak',
        category: 'photography',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate ',
        rules: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis ',
        venue: 'MMC',
        fee: '30',
        startTime: '17/03/2017 12:45 PM',
        endTime: '17/03/2017 2:45 PM'
    });
    newEvent.save(function (err, testEvent) {
      if (err) return console.error(err);
      console.log("Event Created!!");
  });
    res.json({ message: 'Event Created' })
}

exports.eventlist = function(req,res){
    Event.find({},{__v:0},function (err, event) {
        res.send(event);
        if (err) return console.error(err);
    });
}