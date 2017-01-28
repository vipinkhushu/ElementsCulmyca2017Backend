var mongoose = require('mongoose');
var bodyParser = require('body-parser')

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
    paymentstatus: String,
    arrived: Number,
    qrcode: String,
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
var RegisterAttendee = mongoose.model('Register',registrationSchema);
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
        res.json(event);
        if (err) return console.error(err);
    });
}

exports.register = function(req,res){
    var phoneno = req.body.phoneno;
    var email = req.body.email;
    var fullname = req.body.fullname;
    var college = req.body.college;
    var eventid = req.body.eventid;
    var paymenttxnid = req.body.paymenttxnid;
    var paymentphoneno = req.body.paymentphoneno;
    var arrived = '0';
    var paymentstatus = '0';
    var qrcode = '0';
    var timestamp = new Date;
    console.log(req.body);
    console.log(phoneno+email+fullname+college+eventid)
    if(phoneno&&email&&fullname&&college&&eventid){

        var newregistration = new RegisterAttendee({ phoneno: phoneno,email: email, fullname: fullname,college: college, eventid: eventid,paymenttxnid:paymenttxnid,paymentphoneno:paymentphoneno,arrived:arrived,paymentstatus: paymentstatus,qrcode:qrcode, timestamp:timestamp});
        newregistration.save(function (err, testEvent) {
          if (err) return console.error(err);
          console.log("Registered!");
      });
        res.json({ message: 'Registration Successful' });
    }else{
        console.log(phoneno+email+fullname+college+eventid)
        res.json({ message: 'error, some fields missing' });
    }

}

exports.userinfo = function(req,res){
    phone = req.params.phonenumber;
    RegisterAttendee.find({phoneno: phone},{_id:0,email:1,fullname:1,college:1,eventid:1},function (err, info) {
        if(info.length===0) res.json({ message: 'user doesnot exist' });
        else if(info) res.json(info);
        if (err) return console.error(err);

    });
}

exports.adminregister=  function (req, res) {
    var newAdmin = new admin({
        username: 'brix@ec2017',
        password: 'GhCysArD',
        priviledge: 'qr',
        token: 'a6ee242d725498e288854f589fa3391b41dfce6e'
    });
    newAdmin.save(function (err, testEvent) {
      if (err) return console.error(err);
      console.log("Admin Created!!");
  });
    res.json({ message: 'Admin Created' })
}

exports.getAccessToken=  function (req, res) {
    var un = req.body.username;
    var pw = req.body.password;
    if(un&&pw){
        admin.findOne({username: un, password: pw},{_id:0,username:0,password:0,priviledge:0,__v:0},function (err, user) {
            if(user) res.json(user);
            else res.json({ message: 'Invalid username/password' });
            if (err) return console.error(err);
        });
    }else{
        res.json({ message: 'error, some fields missing' });
    }
}

exports.getregistrations = function(req,res){
    var clubname = req.params.clubname;
    var token = req.params.accesstoken;
    var eventid = req.params.eventid;
    accepted=0;
    admin.findOne({priviledge:clubname, token: token},function(err, tst){
        if(tst){
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
        console.log(accepted);
    }).then(function() { 
        if(accepted){
            RegisterAttendee.find({eventid:eventid},{_id:0,__v:0},function(err,tst){
                if(tst){
                    res.json(tst);
                }
                else
                    res.json({ message: 'No Registrations Yet' });
            });
        }else{
            res.json({ message: 'Invalid username/password' });
        }
    })

}

exports.updatepaymentstatus = function(req,res){
    var phoneno = req.params.phoneno;
    var eventid = req.params.eventid;
    var accesstoken = req.params.accesstoken;
    var code = req.params.qrcode;
    accepted=0;
    admin.findOne({priviledge:'brix', token: accesstoken},function(err, tst){
        if(tst){
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
    }).then(function() { 
        if(accepted){
            RegisterAttendee.update({phonenumber:phoneno,eventid:eventid},{paymentstatus:'1',qrcode:code},function(err,tst){
                if(tst.n>0){
                    res.json({ message: 'Payment Successful' });
                }
                else
                    res.json({ message: 'Payment Not Successful' });
            });
        }else{
            res.json({ message: 'Invalid access token' });
        }
    })    
}

exports.qrdetails = function(req,res){
    var accesstoken = req.params.accesstoken;
    var code = req.params.qrcode;
    accepted=0;
    admin.findOne({priviledge:'brix', token: accesstoken},function(err, tst){
        //console.log(tst);
        if(tst){
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
    }).then(function() { 
        //console.log('var accepted = '+accepted);
        if(accepted){
            RegisterAttendee.findOne({qrcode:code},function(err,info){
                console.log(info);
                if(!info) res.json({ message: 'QR Code Invalid' });
                else if(info){
                     res.json(info);
                }
                if (err) return console.error(err);
            })
        }else{
            res.json({ message: 'Invalid access token' });
        }
    })       
}

exports.arrivalstatus = function(req,res){
    var accesstoken = req.params.accesstoken;
    var code = req.params.qrcode;
    accepted=0;
    admin.findOne({priviledge:'brix', token: accesstoken},function(err, tst){
        console.log(tst);
        if(tst){
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
    }).then(function() { 
        console.log('var accepted = '+accepted);
        if(accepted){
            RegisterAttendee.findOne({qrcode:code},function(err,info){
                console.log(info);
                if(!info) res.json({ message: 'QR Code Invalid' });
                else if(info){
                     //res.json(info);
                     userdetails=info;
                    if(info.paymentstatus=="1"&&info.arrived==0){
                        RegisterAttendee.update({qrcode: code},{arrived:'1'},function(err,tst){
                            console.log(tst);
                            if(tst.n>0){
                                res.json({ message: 'Marked as arrived' });
                            }
                            else
                                res.json({ message: 'QR Code Invalid' });
                        });
                    }else if(info.paymentstatus=="0"){
                        res.json({ message: 'Payment Not Successful' });
                    }else if(info.arrived==1){
                        res.json({ message: 'QR Code Expired, Already Arrived' });
                    }
                }
                if (err) return console.error(err);
            })
        }else{
            res.json({ message: 'Invalid access token' });
        }
    })         
}