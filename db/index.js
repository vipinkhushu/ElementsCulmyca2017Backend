var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var helper = require('sendgrid').mail;

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
    token = req.params.accesstoken;
    eventName = req.body.eventName;
    club = req.body.club;
    category = req.body.category;
    description = req.body.description;
    rules = req.body.rules;
    venue = req.body.venue;
    fee= req.body.fee;
    startTime = req.body.startTime;
    endTime = req.body.endTime;
    if(eventName&&club&&category&&description&&rules&&venue&&fee&&startTime&&endTime){
        accepted=0;
        admin.findOne({priviledge:'brix', token: token},function(err, tst){
            if(tst){
                accepted=1;
            }else{
                accepted=0;
            }
            if (err) return console.error(err);
            console.log(accepted);
        }).then(function() { 
            if(accepted){
                var newEvent = new Event({
                    eventName: eventName,
                    club: club,
                    category: category,
                    description: description,
                    rules: rules,
                    venue: venue,
                    fee: fee,
                    startTime: startTime,
                    endTime: endTime
                });
                newEvent.save(function (err, testEvent) {
                  if (err) return console.error(err);
                  console.log("Event Created!!");
              });
                res.json({ message: 'Event Created' })
            }else{
                res.json({ message: 'Invalid username/password' });
            }
        })    
    }else{
        res.send({message: 'some fields missing'});
    }

}

exports.eventlist = function(req,res){
    Event.find({},{__v:0},function (err, event) {
        res.json(event);
        if (err) return console.error(err);
    });
}

exports.eventListByClubName = function(req, res){
    clubname = req.params.clubname;
    Event.find({club: clubname},{__v:0},function (err, event) {
        res.json(event);
        if (err) return console.error(err);
    });    
}

exports.eventListByCategory = function(req, res){
    name = req.params.name;
     Event.find({category: name},{__v:0},function (err, event) {
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
        RegisterAttendee.findOne({phoneno: phone,eventid:eventid},function (err, info) {
            if(info)
                res.json({message: 'user has already registered'})
            else{
                newregistration.save(function (err, testEvent) {
                  if (err) return console.error(err);
                  console.log("Registered!");
              });
                res.json({ message: 'Registration Successful' });
            }
            if (err) return console.error(err);

        });

    }else{
        console.log(phoneno+email+fullname+college+eventid)
        res.json({ message: 'error, some fields missing' });
    }
}

exports.userinfo = function(req,res){
    phone = req.params.phonenumber;
    RegisterAttendee.findOne({phoneno: phone},{phoneno:1,email:1,college:1,fullname:1},function (err, info) {
        if(info)
            res.json(info)
        else
            res.json({ message: 'user doesnot exist' });
        if (err) return console.error(err);

    });
}

exports.registrationdetails = function(req, res){
    phone = req.params.phonenumber;
    RegisterAttendee.find({phoneno: phone},{_id:0, phoneno:0, fullname:0, email:0, college:0, __v:0},function (err, info) {
        if(info)
            res.json(info)
        else
            res.json({ message: 'user doesnot exist' });
        if (err) return console.error(err);

    });
}

exports.adminregister=  function (req, res) {
    var newAdmin = new admin({
        username: 'ananya@EC2017',
        password: 'ripegrapes@171761',
        priviledge: 'ananya',
        token: '67158492daafd3d90dabc6113be22cd97308758f'
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
        admin.findOne({username: un, password: pw},{_id:0,username:0,password:0,__v:0},function (err, user) {
            if(user) res.json({token:user.token, priviledge: user.priviledge});
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
            RegisterAttendee.find({eventid:eventid},{__v:0},function(err,tst){
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
    var phoneno = req.params.phonenumber;
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
            RegisterAttendee.update({phoneno:phoneno, eventid:eventid},{paymentstatus:'1',qrcode:code},function(err,tst){
                console.log(tst);
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
                if(!info) res.json({ error: 'QR Code Invalid' });
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
                                res.json({ error: 'QR Code Invalid' });
                        });
                    }else if(info.paymentstatus=="0"){
                        res.json({ error: 'Payment Not Successful' });
                    }else if(info.arrived==1){
                        res.json({ error: 'QR Code Expired, Already Arrived' });
                    }
                }
                if (err) return console.error(err);
            })
        }else{
            res.json({ error: 'Invalid access token' });
        }
    })         
}

exports.eventUpdate = function(req, res){
    var clubname = req.body.clubname;
    var eventid = req.body.eventid;
    var description = req.body.description;
    var rules = req.body.rules;
    var venue = req.body.venue;
    var st = req.body.st;
    var et = req.body.et;
    var token = req.params.accesstoken;
    accepted=0;
    admin.findOne({priviledge:'brix', token: token},function(err, tst){
        if(tst){
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
        console.log(accepted);
    }).then(function() { 
        if(accepted){
            Event.update({club:clubname, _id: eventid, },{description:description, rules: rules, venue:venue, startTime: st, endTime: et},function(err,tst){
                if(tst.nModified==1){
                    res.json({ message: 'Event Updated' });
                }else{
                    res.json({ message: 'Error! Event not updated' });
                }
            });
        }else{
            res.json({ message: 'Invalid access token' });
        }
    })    
}

exports.sendEmail = function(req, res){
    from_email = new helper.Email("help@elementsculmyca.com","Elements Culmyca 2017")
    to_email = new helper.Email("vipinkhushu@hotmail.com")
    subject = "Congratulation! You have been registered"
    content = new helper.Content("text/html", "hello")
    mail = new helper.Mail(from_email, subject, to_email, content)

    var sg = require('sendgrid')('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');
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function(error, response) {
        res.json(response);
    })
}

exports.pdf = function(req, res){
    
}
