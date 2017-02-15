var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var helper = require('sendgrid').mail;
var pdf = require('html-pdf');
var path = require('path');
var async = require("async");
var request = require('request');

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

var sponsorsSchema = mongoose.Schema({
    name: String,
    url: String,
    logo: String,
    title: String
});

//Model Setup
var Event = mongoose.model('Event', eventsSchema);
var RegisterAttendee = mongoose.model('Register',registrationSchema);
var admin = mongoose.model('Admin',administrationSchema);
var sponsors = mongoose.model('Sponsors',sponsorsSchema);

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
        username: req.body.username,
        password: req.body.password,
        priviledge: req.body.priviledge,
        token: req.body.token
    });
    newAdmin.save(function (err, testEvent) {
      if (err) return console.error(err);
      console.log("Admin Created!!");
      res.json({ message: 'Admin Created' })
  });

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
    auth="";
    admin.findOne({token: accesstoken},function(err, tst){
        if(tst){
            auth=tst;
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
    }).then(function() { 
        if(accepted){
         RegisterAttendee.findOne({qrcode:code},function(err,info){
            if(!info) res.json({ message: 'QR Code Invalid' });
            else if(info){
                Event.findOne({_id:info.eventid, club: auth.priviledge}, function(err, detail){
                    if(!detail){
                        res.json({message: 'Cross login not authorized'});
                    }else{
                        res.json(info);
                    }
                })
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
    auth="";
    admin.findOne({token: accesstoken},function(err, tst){
        if(tst){
            auth=tst;
            accepted=1;
        }else{
            accepted=0;
        }
        if (err) return console.error(err);
    }).then(function() { 
        if(accepted){
         RegisterAttendee.findOne({qrcode:code},function(err,info){
            if(!info) res.json({ message: 'QR Code Invalid' });
            else if(info){
                Event.findOne({_id:info.eventid, club: auth.priviledge}, function(err, detail){
                    if(!detail){
                        res.json({message: 'Cross login not authorized'});
                    }else{
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
            })
            }
            if (err) return console.error(err);
        })
     }else{
        res.json({ message: 'Invalid access token' });
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

exports.sendETicket = function(req, res){
    eventinfo="";
    console.log(req.params.eventid);
    Event.findOne({_id: req.params.eventid},function(err, tst){
        if(!err){
            console.log(tst);
            eventinfo=tst;  
        }else{
            console.log(err);
        }
    }).then(function(){

        from_email = new helper.Email("manantechnosurge@gmail.com","Elements Culmyca 2017")
        to_email = new helper.Email(req.params.email)
        subject = "Congratulations! You have been registered"


        var html = '<html>'+
        '<head>'+
        '  <title>Confirmation</title>'+
        '</head>'+
        '<body>'+
        '  <div marginwidth="0" marginheight="0" style="font-family:Arial,sans-serif;padding:20px 0 0 0">'+
        '    <table cellpadding="0" cellspacing="0" width="100%" border="0" align="center" style="padding:25px 0 15px 0">'+
        '      <tbody><tr>'+
        '        <td width="100%" valign="top">'+
        '          <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="f2f2f2" style="min-width:600px;margin:0 auto">'+
        '            <tbody>'+
        '              <tr>'+
        '                <td valign="top">'+
        '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
        '                    <tbody><tr>'+
        '                      <td valign="top" width="300" style="background-color:#1f2533;padding-top:10px">'+
        '                        <a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#1f2533;font-weight:bold" target="_blank" >'+
        '                          <img src="http://www.elementsculmyca.com/images/logo.png" style="display:block;background-color:#1f2533;color:#010101;padding:10px;padding-left:30px" alt="" border="0" height="100" >'+
        '                        </a>'+
        '                      </td>'+
        '                      <td valign="top" width="300" style="background-color:#1f2533;color:#ffffff;font-size:14px;font-family:Arial,sans-serif;text-align:right;padding:20px 20px 0px 0px;word-spacing:1px"><span style="font-size:20px;font-weight:bold;">ELEMENTS CULMYCA\'17<br/><small>Annual cultural and technical fest</small></span><br><br>YMCA University of Science and Technology<br/>Faridabad, Haryana, India- 121006</td>'+
        '                    </tr>'+
        '                  </tbody></table>'+
        '                </td>'+
        '              </tr>'+
        '              <tr>'+
        '                <td valign="top">'+
        '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
        '                    <tbody><tr><center>'+
        '                      <td valign="top" width="500" style="background-color:#ffffff;color:#666666;font-size:18px;font-family:Arial,sans-serif;text-align:center;padding-top: 10px;padding-bottom: 10px;line-height:20px"> <b>E-TICKET</b></td></center>'+
        '                    </tr>'+
        '                  </tbody></table>'+
        '                </td>'+
        '              </tr>'+
        '              <tr>'+
        '                <td valign="top" width="540" style="padding-top:20px">'+
        '                </td>'+
        '              </tr>'+
        '              <tr>'+
        '                <td valign="top" style="width:540px;background-color:#f2f2f2;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:0px 30px 20px 30px;line-height:20px">'+
        '                  <span style="font-weight:bold;font-size:20px">Hello '+req.params.fullname+'</span>'+
        '                  <br>You have successfully registered for the event.<br/><br/>Download PDF of your ticket, <a href="http://elementsculmyca2017.herokuapp.com/api/v1/pdf/'+req.params.qrcode+'">Click here</a></td>'+
        '                </tr>'+
        '                <tr>'+
        '                  <td valign="top">'+
        '                    <table cellpadding="0" cellspacing="0" width="540" border="0" align="center" bgcolor="#1f2533">'+
        '                      <tbody><tr>'+
        '                        <td width="15">'+
        '                        </td><td width="370" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:25px 10px 25px 15px;line-height:24px;border-right:1px dotted #ffffff">'+
        '                        '+
        '                        '+
        '                        <span style="color:#ffffff">You must carry the soft copy of this ticket with you at the event-site. Print-out for the same is not required.</span>'+
        '                        <br>'+
        '                        '+
        '                      </td>'+
        '                      <td width="140" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:center;padding:25px 10px 15px 10px;line-height:20px">'+
        '                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+req.params.qrcode+'" alt="" width="110" height="110" border="0" >'+
        '                      </td>'+
        '                      <td width="15">'+
        '                      </td></tr>'+
        '                    </tbody></table>'+
        '                  </td>'+
        '                </tr>'+
        '                <tr>'+
        '                  <td valign="top">'+
        '                    <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="border:1px solid #e1e5e8">'+
        '                      <tbody><tr>'+
        '                        <td width="538" valign="top">'+
        '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="padding:0 30px">'+
        '                            <tbody>'+
        '                              <tr>'+
        '                                <td valign="top" style="width:478px;background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:1px solid #e1e5e8">'+
        '                                  <!--<span style="font-size:12px">ORDER SUMMARY </span>-->'+
        '                                </td>'+
        '                              </tr>'+
        '                            </tbody>'+
        '                          </table>'+
        '                        </td>'+
        '                      </tr>'+
        '                      <tr>'+
        '                        <td width="538" valign="top">'+
        '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
        '                            <tbody>'+
        '                              <tr>'+
        '                                <td style="width:30px">'+
        '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:2px dotted #bfbfbf">'+
        '                                <span style="font-size:14px;font-weight:bold">EVENT</span>'+
        '                              </td>'+
        '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:right;padding:10px 0 10px 10px;border-bottom:2px dotted #bfbfbf">'+eventinfo.eventName+'</td>'+
        '                              <td style="width:30px">'+
        '                              </td></tr>'+
        '                            </tbody>'+
        '                          </table>'+
        '                        </td>'+
        '                      </tr>'+
        '                      <tr>'+
        '                        <td valign="top" width="538">'+
        '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
        '                            <tbody>'+
        '                              <tr>'+
        '                                <td style="width:30px">'+
        '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left;padding:10px 0 10px 0">'+
        '                                <strong>Date</strong>'+
        '                              </td>'+
        '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right">'+
        '                                <br>'+
        '                                <strong>'+eventinfo.startTime+'</strong>'+
        '                              </td>'+
        '                              <td style="width:30px">'+
        '                              </td></tr>'+
        '                            </tbody>'+
        '                          </table>'+
        '                        </td>'+
        '                      </tr>'+
        '                      <tr>'+
        '                        <td valign="top" width="538">'+
        '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
        '                            <tbody>'+
        '                              <tr>'+
        '                                <td style="width:30px">'+
        '                                </td><td valign="top" style="width:265px;padding:10px 0 10px 0;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left">'+
        '                                <strong>Venue</strong>'+
        '                              </td>'+
        '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right;vertical-align:top">'+
        '                                <br>'+
        '                                <strong>'+eventinfo.venue+'</strong>'+
        '                              </td>'+
        '                              <td style="width:30px">'+
        '                              </td></tr>'+
        '                              <td style="width:30px">'+
        '                              </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
        '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
        '                              <td style="width:30px">'+
        '                              </td></tr>'+
        '                              <tr>'+
        '                                <td style="width:30px">'+
        '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
        '                                <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
        '                                <td style="width:30px">'+
        '                                </td></tr>'+
        '                                <tr>'+
        '                                  <td style="width:30px">'+
        '                                  </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
        '                                  <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
        '                                  <td style="width:30px">'+
        '                                  </td></tr>'+
        '                                </tbody>'+
        '                              </table>'+
        '                            </td>'+
        '                          </tr>'+
        '                        </tbody></table>'+
        '                      </td>'+
        '                    </tr>'+
        '                    <tr><br></tr>'+
        '                    <td valign="top" width="540" style="background-color:#ffffff">'+
        '                      <table cellpadding="0" cellspacing="0" width="540" border="0" align="center">'+
        '                        <tbody><tr>'+
        '                          <td valign="top" width="540" style="color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:justify;padding:30px 0 40px;line-height:20px">'+
        '                            <span style="font-size:12px">'+
        '                              <b> Download Culmyca\'17 android application to view and manage all your registrations at one place.</b>'+
        '                            </span>'+
        '                            <table>'+
        '                              <tr><td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>'+
        '                                <!--<td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>--></tr>'+
        '                              </table>'+
        '                            </tr>'+
        '                          </tbody></table>'+
        '                        </td>'+
        '                      </tr>'+
        ''+
        '                      <tr>'+
        '                        <td valign="top">'+
        '                          <table cellpadding="0" cellspacing="0" width="600" border="0" align="center" bgcolor="1F2533">'+
        '                            <tbody><tr>'+
        '                              <td valign="top" width="260" style="background-color:#1f2533;color:#49ba8e;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:20px 10px 15px 20px">For any further query<br><a href="mailto:help@elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">help@elementsculmyca.com</a><br/><a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">www.elementsculmyca.com</a></td>'+
        '                              <td style="width:200px;vertical-align:top;background-color:#1f2533;text-align:right;padding:25px 0 15px 0">'+
        '                                <img src="https://ci3.googleusercontent.com/proxy/SyVYUNSQvbO4Vpaz4vI18sLBe2mw869TmO_vsG2pCeAKavB7aEfM4-d-6da_55SKmc90xda9joSORt4Lnq5JrfJ1u0uoUOkq0yze=s0-d-e1-ft#http://in.bmscdn.com/webin/emailer/helpline-phone.png" alt="helpline phone" width="18" height="20" border="0" >'+
        '                              </td>'+
        '                              <td style="width:105px;vertical-align:top;padding:25px 0 15px 10px;text-align:left;background-color:#1f2533;color:#49ba8e;line-height:14px;font-size:12px;font-weight:bold">'+
        '                                <a href="tel:+919643763712" style="text-decoration:none;color:#49ba8e" target="_blank">Ph: 9643763712</a>'+
        '                                '+
        '                              </td>'+
        '                            </tr>'+
        '                          </tbody></table>'+
        '                        </td>'+
        '                      </tr>'+
        '                    </tbody>'+
        '                  </table>'+
        '                </td>'+
        '              </tr>'+
        '            </tbody></table>'+
        '          </body>'+
        '          </html>';
        content = new helper.Content("text/html", html)
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
    })

}

exports.pdf = function(req, res, next){
    ai="";
    eventinfo="";
    console.log('generating pdf for '+req.params.qrcode)
    RegisterAttendee.findOne({qrcode: req.params.qrcode},function(err, attendeeInfo){
        console.log(attendeeInfo);
        ai=attendeeInfo;
    }).then(function(){
        Event.findOne({_id: ai.eventid},function(err, tst){
            if(!err){
                console.log(tst);
                eventinfo=tst;  
            }else{
                console.log(err);
            }
        }).then(function(){
            var html = '<html>'+
            '<head>'+
            '  <title>Confirmation</title>'+
            '</head>'+
            '<body>'+
            '  <div marginwidth="0" marginheight="0" style="font-family:Arial,sans-serif;padding:20px 0 0 0">'+
            '    <table cellpadding="0" cellspacing="0" width="100%" border="0" align="center" style="padding:25px 0 15px 0">'+
            '      <tbody><tr>'+
            '        <td width="100%" valign="top">'+
            '          <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="f2f2f2" style="min-width:600px;margin:0 auto">'+
            '            <tbody>'+
            '              <tr>'+
            '                <td valign="top">'+
            '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
            '                    <tbody><tr>'+
            '                      <td valign="top" width="300" style="background-color:#1f2533;padding-top:10px">'+
            '                        <a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#1f2533;font-weight:bold" target="_blank" >'+
            '                          <img src="http://www.elementsculmyca.com/images/logo.png" style="display:block;background-color:#1f2533;color:#010101;padding:10px;padding-left:30px" alt="" border="0" height="100" >'+
            '                        </a>'+
            '                      </td>'+
            '                      <td valign="top" width="300" style="background-color:#1f2533;color:#ffffff;font-size:14px;font-family:Arial,sans-serif;text-align:right;padding:20px 20px 0px 0px;word-spacing:1px"><span style="font-size:20px;font-weight:bold;">ELEMENTS CULMYCA\'17<br/><small>Annual cultural and technical fest</small></span><br><br>YMCA University of Science and Technology<br/>Faridabad, Haryana, India- 121006</td>'+
            '                    </tr>'+
            '                  </tbody></table>'+
            '                </td>'+
            '              </tr>'+
            '              <tr>'+
            '                <td valign="top">'+
            '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
            '                    <tbody><tr><center>'+
            '                      <td valign="top" width="500" style="background-color:#ffffff;color:#666666;font-size:18px;font-family:Arial,sans-serif;text-align:center;padding-top: 10px;padding-bottom: 10px;line-height:20px"> <b>E-TICKET</b></td></center>'+
            '                    </tr>'+
            '                  </tbody></table>'+
            '                </td>'+
            '              </tr>'+
            '              <tr>'+
            '                <td valign="top" width="540" style="padding-top:20px">'+
            '                </td>'+
            '              </tr>'+
            '              <tr>'+
            '                <td valign="top" style="width:540px;background-color:#f2f2f2;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:0px 30px 20px 30px;line-height:20px">'+
            '                  <span style="font-weight:bold;font-size:20px">Hello '+ai.fullname+'</span>'+
            '                  <br>You have successfully registered for the event.</td>'+
            '                </tr>'+
            '                <tr>'+
            '                  <td valign="top">'+
            '                    <table cellpadding="0" cellspacing="0" width="540" border="0" align="center" bgcolor="#1f2533">'+
            '                      <tbody><tr>'+
            '                        <td width="15">'+
            '                        </td><td width="370" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:25px 10px 25px 15px;line-height:24px;border-right:1px dotted #ffffff">'+
            '                        '+
            '                        '+
            '                        <span style="color:#ffffff">You must carry the soft copy of this ticket with you at the event-site. Print-out for the same is not required.</span>'+
            '                        <br>'+
            '                        '+
            '                      </td>'+
            '                      <td width="140" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:center;padding:25px 10px 15px 10px;line-height:20px">'+
            '                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+ai.qrcode+'" alt="" width="110" height="110" border="0" >'+
            '                      </td>'+
            '                      <td width="15">'+
            '                      </td></tr>'+
            '                    </tbody></table>'+
            '                  </td>'+
            '                </tr>'+
            '                <tr>'+
            '                  <td valign="top">'+
            '                    <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="border:1px solid #e1e5e8">'+
            '                      <tbody><tr>'+
            '                        <td width="538" valign="top">'+
            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="padding:0 30px">'+
            '                            <tbody>'+
            '                              <tr>'+
            '                                <td valign="top" style="width:478px;background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:1px solid #e1e5e8">'+
            '                                  <!--<span style="font-size:12px">ORDER SUMMARY </span>-->'+
            '                                </td>'+
            '                              </tr>'+
            '                            </tbody>'+
            '                          </table>'+
            '                        </td>'+
            '                      </tr>'+
            '                      <tr>'+
            '                        <td width="538" valign="top">'+
            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
            '                            <tbody>'+
            '                              <tr>'+
            '                                <td style="width:30px">'+
            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:2px dotted #bfbfbf">'+
            '                                <span style="font-size:14px;font-weight:bold">EVENT</span>'+
            '                              </td>'+
            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:right;padding:10px 0 10px 10px;border-bottom:2px dotted #bfbfbf">'+eventinfo.eventName+'</td>'+
            '                              <td style="width:30px">'+
            '                              </td></tr>'+
            '                            </tbody>'+
            '                          </table>'+
            '                        </td>'+
            '                      </tr>'+
            '                      <tr>'+
            '                        <td valign="top" width="538">'+
            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
            '                            <tbody>'+
            '                              <tr>'+
            '                                <td style="width:30px">'+
            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left;padding:10px 0 10px 0">'+
            '                                <strong>Date</strong>'+
            '                              </td>'+
            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right">'+
            '                                <br>'+
            '                                <strong>'+eventinfo.startTime+'</strong>'+
            '                              </td>'+
            '                              <td style="width:30px">'+
            '                              </td></tr>'+
            '                            </tbody>'+
            '                          </table>'+
            '                        </td>'+
            '                      </tr>'+
            '                      <tr>'+
            '                        <td valign="top" width="538">'+
            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
            '                            <tbody>'+
            '                              <tr>'+
            '                                <td style="width:30px">'+
            '                                </td><td valign="top" style="width:265px;padding:10px 0 10px 0;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left">'+
            '                                <strong>Venue</strong>'+
            '                              </td>'+
            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right;vertical-align:top">'+
            '                                <br>'+
            '                                <strong>'+eventinfo.venue+'</strong>'+
            '                              </td>'+
            '                              <td style="width:30px">'+
            '                              </td></tr>'+
            '                              <td style="width:30px">'+
            '                              </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
            '                              <td style="width:30px">'+
            '                              </td></tr>'+
            '                              <tr>'+
            '                                <td style="width:30px">'+
            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
            '                                <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
            '                                <td style="width:30px">'+
            '                                </td></tr>'+
            '                                <tr>'+
            '                                  <td style="width:30px">'+
            '                                  </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
            '                                  <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
            '                                  <td style="width:30px">'+
            '                                  </td></tr>'+
            '                                </tbody>'+
            '                              </table>'+
            '                            </td>'+
            '                          </tr>'+
            '                        </tbody></table>'+
            '                      </td>'+
            '                    </tr>'+
            '                    <tr><br></tr>'+
            '                    <td valign="top" width="540" style="background-color:#ffffff">'+
            '                      <table cellpadding="0" cellspacing="0" width="540" border="0" align="center">'+
            '                        <tbody><tr>'+
            '                          <td valign="top" width="540" style="color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:justify;padding:30px 0 40px;line-height:20px">'+
            '                            <span style="font-size:12px">'+
            '                              <b> Download Culmyca\'17 android application to view and manage all your registrations at one place.</b>'+
            '                            </span>'+
            '                            <table>'+
            '                              <tr><td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>'+
            '                                <!--<td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>--></tr>'+
            '                              </table>'+
            '                            </tr>'+
            '                          </tbody></table>'+
            '                        </td>'+
            '                      </tr>'+
            ''+
            '                      <tr>'+
            '                        <td valign="top">'+
            '                          <table cellpadding="0" cellspacing="0" width="600" border="0" align="center" bgcolor="1F2533">'+
            '                            <tbody><tr>'+
            '                              <td valign="top" width="260" style="background-color:#1f2533;color:#49ba8e;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:20px 10px 15px 20px">For any further query<br><a href="mailto:help@elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">help@elementsculmyca.com</a><br/><a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">www.elementsculmyca.com</a></td>'+
            '                              <td style="width:200px;vertical-align:top;background-color:#1f2533;text-align:right;padding:25px 0 15px 0">'+
            '                                <img src="https://ci3.googleusercontent.com/proxy/SyVYUNSQvbO4Vpaz4vI18sLBe2mw869TmO_vsG2pCeAKavB7aEfM4-d-6da_55SKmc90xda9joSORt4Lnq5JrfJ1u0uoUOkq0yze=s0-d-e1-ft#http://in.bmscdn.com/webin/emailer/helpline-phone.png" alt="helpline phone" width="18" height="20" border="0" >'+
            '                              </td>'+
            '                              <td style="width:105px;vertical-align:top;padding:25px 0 15px 10px;text-align:left;background-color:#1f2533;color:#49ba8e;line-height:14px;font-size:12px;font-weight:bold">'+
            '                                <a href="tel:+919643763712" style="text-decoration:none;color:#49ba8e" target="_blank">Ph: 9643763712</a>'+
            '                                '+
            '                              </td>'+
            '                            </tr>'+
            '                          </tbody></table>'+
            '                        </td>'+
            '                      </tr>'+
            '                    </tbody>'+
            '                  </table>'+
            '                </td>'+
            '              </tr>'+
            '            </tbody></table>'+
            '          </body>'+
            '          </html>';
            pdf.create(html).toFile('public/eticket.pdf', function(err, res1) {
              if (err) return console.log(err);
              var fs = require('fs');
              var file = fs.createReadStream(path.resolve('public/eticket.pdf'));
              var stat = fs.statSync(path.resolve('public/eticket.pdf'));
              res.setHeader('Content-Length', stat.size);
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename=eticket_'+ai.qrcode+'.pdf');
              file.pipe(res);
          });            
        })
})

}

exports.sponsors = function(req, res){
    sponsors.find({},function(err, info){
        res.json(info);
    })
}

exports.addSponsor = function(req, res){
    var Sponsors = new sponsors({
        name: req.body.name,
        url: req.body.url,
        logo: req.body.logo,
        title: req.body.title
    });

    Sponsors.save(function(error, info){
        if(!error){
            console.log({message: "sponsor added"});
            res.json({message: "sponsor added"})
        }else{
            console.log({message: "error adding sponsor"});
            res.json({message: "error in adding sponsor"})
        }
    })
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
    updatedinfoforqr="";
    if(phoneno&&email&&fullname&&college&&eventid){
        var newregistration = new RegisterAttendee({ phoneno: phoneno,email: email, fullname: fullname,college: college, eventid: eventid,paymenttxnid:paymenttxnid,paymentphoneno:paymentphoneno,arrived:arrived,paymentstatus: paymentstatus,qrcode:qrcode, timestamp:timestamp});
        RegisterAttendee.findOne({phoneno: phoneno,eventid:eventid},function (err, info) {
            if(info)
                res.json({message: 'user has already registered'})
            else{
                newregistration.save(function (err, testEvent) {
                  if (err) return console.error(err);
                  console.log("Registered!");
              }).then(function(){
                console.log('searching '+phoneno+" "+eventid);
                RegisterAttendee.findOne({phoneno: phoneno,eventid:eventid},function (err, updatedinfo) {
                    console.log('found '+ updatedinfo);
                    updatedinfoforqr=updatedinfo;
                }).then(function(){
                    console.log('updating'+phoneno+" "+eventid);
                    RegisterAttendee.update({phoneno: phoneno,eventid:eventid},{qrcode:updatedinfoforqr._id},function(err,tst){
                        console.log('QR alloted');
                        console.log(updatedinfoforqr);
                        res.json({ message: 'Registration Successful' });
                        //SENDING EMAIL SYSTEM STARTS
                        eventinfo="";
                        Event.findOne({_id: updatedinfoforqr.eventid},function(err, tst){
                            if(!err){
                                console.log(tst);
                                eventinfo=tst;  
                            }else{
                                console.log(err);
                            }
                        }).then(function(){
                            var html = '<html>'+
                            '<head>'+
                            '  <title>Confirmation</title>'+
                            '</head>'+
                            '<body>'+
                            '  <div marginwidth="0" marginheight="0" style="font-family:Arial,sans-serif;padding:20px 0 0 0">'+
                            '    <table cellpadding="0" cellspacing="0" width="100%" border="0" align="center" style="padding:25px 0 15px 0">'+
                            '      <tbody><tr>'+
                            '        <td width="100%" valign="top">'+
                            '          <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="f2f2f2" style="min-width:600px;margin:0 auto">'+
                            '            <tbody>'+
                            '              <tr>'+
                            '                <td valign="top">'+
                            '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
                            '                    <tbody><tr>'+
                            '                      <td valign="top" width="300" style="background-color:#1f2533;padding-top:10px">'+
                            '                        <a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#1f2533;font-weight:bold" target="_blank" >'+
                            '                          <img src="http://www.elementsculmyca.com/images/logo.png" style="display:block;background-color:#1f2533;color:#010101;padding:10px;padding-left:30px" alt="" border="0" height="100" >'+
                            '                        </a>'+
                            '                      </td>'+
                            '                      <td valign="top" width="300" style="background-color:#1f2533;color:#ffffff;font-size:14px;font-family:Arial,sans-serif;text-align:right;padding:20px 20px 0px 0px;word-spacing:1px"><span style="font-size:20px;font-weight:bold;">ELEMENTS CULMYCA\'17<br/><small>Annual cultural and technical fest</small></span><br><br>YMCA University of Science and Technology<br/>Faridabad, Haryana, India- 121006</td>'+
                            '                    </tr>'+
                            '                  </tbody></table>'+
                            '                </td>'+
                            '              </tr>'+
                            '              <tr>'+
                            '                <td valign="top">'+
                            '                  <table cellpadding="0" cellspacing="0" width="600" border="0" align="center">'+
                            '                    <tbody><tr><center>'+
                            '                      <td valign="top" width="500" style="background-color:#ffffff;color:#666666;font-size:18px;font-family:Arial,sans-serif;text-align:center;padding-top: 10px;padding-bottom: 10px;line-height:20px"> <b>E-TICKET</b></td></center>'+
                            '                    </tr>'+
                            '                  </tbody></table>'+
                            '                </td>'+
                            '              </tr>'+
                            '              <tr>'+
                            '                <td valign="top" width="540" style="padding-top:20px">'+
                            '                </td>'+
                            '              </tr>'+
                            '              <tr>'+
                            '                <td valign="top" style="width:540px;background-color:#f2f2f2;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:0px 30px 20px 30px;line-height:20px">'+
                            '                  <span style="font-weight:bold;font-size:20px">Hello '+updatedinfoforqr.fullname+'</span>'+
                            '                  <br>You have successfully registered for the event.<br/><br/>Download PDF of your ticket, <a href="http://elementsculmyca2017.herokuapp.com/api/v1/pdf/'+updatedinfoforq.qrcode+'">Click here</a></td>'+
                            '                </tr>'+
                            '                <tr>'+
                            '                  <td valign="top">'+
                            '                    <table cellpadding="0" cellspacing="0" width="540" border="0" align="center" bgcolor="#1f2533">'+
                            '                      <tbody><tr>'+
                            '                        <td width="15">'+
                            '                        </td><td width="370" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:25px 10px 25px 15px;line-height:24px;border-right:1px dotted #ffffff">'+
                            '                        '+
                            '                        '+
                            '                        <span style="color:#ffffff">You must carry the soft copy of this ticket with you at the event-site. Print-out for the same is not required.</span>'+
                            '                        <br>'+
                            '                        '+
                            '                      </td>'+
                            '                      <td width="140" valign="top" style="color:#ffffff;font-size:15px;font-family:Arial,sans-serif;text-align:center;padding:25px 10px 15px 10px;line-height:20px">'+
                            '                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+updatedinfoforqr._id+'" alt="" width="110" height="110" border="0" >'+
                            '                      </td>'+
                            '                      <td width="15">'+
                            '                      </td></tr>'+
                            '                    </tbody></table>'+
                            '                  </td>'+
                            '                </tr>'+
                            '                <tr>'+
                            '                  <td valign="top">'+
                            '                    <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="border:1px solid #e1e5e8">'+
                            '                      <tbody><tr>'+
                            '                        <td width="538" valign="top">'+
                            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center" bgcolor="#ffffff" style="padding:0 30px">'+
                            '                            <tbody>'+
                            '                              <tr>'+
                            '                                <td valign="top" style="width:478px;background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:1px solid #e1e5e8">'+
                            '                                  <!--<span style="font-size:12px">ORDER SUMMARY </span>-->'+
                            '                                </td>'+
                            '                              </tr>'+
                            '                            </tbody>'+
                            '                          </table>'+
                            '                        </td>'+
                            '                      </tr>'+
                            '                      <tr>'+
                            '                        <td width="538" valign="top">'+
                            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
                            '                            <tbody>'+
                            '                              <tr>'+
                            '                                <td style="width:30px">'+
                            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:15px;font-family:Arial,sans-serif;text-align:left;padding:10px 10px 10px 0;border-bottom:2px dotted #bfbfbf">'+
                            '                                <span style="font-size:14px;font-weight:bold">EVENT</span>'+
                            '                              </td>'+
                            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:right;padding:10px 0 10px 10px;border-bottom:2px dotted #bfbfbf">'+eventinfo.eventName+'</td>'+
                            '                              <td style="width:30px">'+
                            '                              </td></tr>'+
                            '                            </tbody>'+
                            '                          </table>'+
                            '                        </td>'+
                            '                      </tr>'+
                            '                      <tr>'+
                            '                        <td valign="top" width="538">'+
                            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
                            '                            <tbody>'+
                            '                              <tr>'+
                            '                                <td style="width:30px">'+
                            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left;padding:10px 0 10px 0">'+
                            '                                <strong>Date</strong>'+
                            '                              </td>'+
                            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right">'+
                            '                                <br>'+
                            '                                <strong>'+eventinfo.startTime+'</strong>'+
                            '                              </td>'+
                            '                              <td style="width:30px">'+
                            '                              </td></tr>'+
                            '                            </tbody>'+
                            '                          </table>'+
                            '                        </td>'+
                            '                      </tr>'+
                            '                      <tr>'+
                            '                        <td valign="top" width="538">'+
                            '                          <table cellpadding="0" cellspacing="0" width="538" border="0" align="center">'+
                            '                            <tbody>'+
                            '                              <tr>'+
                            '                                <td style="width:30px">'+
                            '                                </td><td valign="top" style="width:265px;padding:10px 0 10px 0;background-color:#ffffff;color:#1f2533;font-size:13px;font-family:Arial,sans-serif;text-align:left">'+
                            '                                <strong>Venue</strong>'+
                            '                              </td>'+
                            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#1f2533;font-size:12px;font-family:Arial,sans-serif;text-align:right;vertical-align:top">'+
                            '                                <br>'+
                            '                                <strong>'+eventinfo.venue+'</strong>'+
                            '                              </td>'+
                            '                              <td style="width:30px">'+
                            '                              </td></tr>'+
                            '                              <td style="width:30px">'+
                            '                              </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
                            '                              <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
                            '                              <td style="width:30px">'+
                            '                              </td></tr>'+
                            '                              <tr>'+
                            '                                <td style="width:30px">'+
                            '                                </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
                            '                                <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
                            '                                <td style="width:30px">'+
                            '                                </td></tr>'+
                            '                                <tr>'+
                            '                                  <td style="width:30px">'+
                            '                                  </td><td valign="top" style="width:265px;background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:left;line-height:20px"></td>'+
                            '                                  <td valign="top" width="213" style="background-color:#ffffff;color:#666666;font-size:9px;font-family:Arial,sans-serif;text-align:right;vertical-align:top"></td>'+
                            '                                  <td style="width:30px">'+
                            '                                  </td></tr>'+
                            '                                </tbody>'+
                            '                              </table>'+
                            '                            </td>'+
                            '                          </tr>'+
                            '                        </tbody></table>'+
                            '                      </td>'+
                            '                    </tr>'+
                            '                    <tr><br></tr>'+
                            '                    <td valign="top" width="540" style="background-color:#ffffff">'+
                            '                      <table cellpadding="0" cellspacing="0" width="540" border="0" align="center">'+
                            '                        <tbody><tr>'+
                            '                          <td valign="top" width="540" style="color:#666666;font-size:12px;font-family:Arial,sans-serif;text-align:justify;padding:30px 0 40px;line-height:20px">'+
                            '                            <span style="font-size:12px">'+
                            '                              <b> Download Culmyca\'17 android application to view and manage all your registrations at one place.</b>'+
                            '                            </span>'+
                            '                            <table>'+
                            '                              <tr><td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>'+
                            '                                <!--<td><img src="http://blog.timeneye.com/wp-content/uploads/2014/11/Android-app-store.png" height="70" width="250"></td>--></tr>'+
                            '                              </table>'+
                            '                            </tr>'+
                            '                          </tbody></table>'+
                            '                        </td>'+
                            '                      </tr>'+
                            ''+
                            '                      <tr>'+
                            '                        <td valign="top">'+
                            '                          <table cellpadding="0" cellspacing="0" width="600" border="0" align="center" bgcolor="1F2533">'+
                            '                            <tbody><tr>'+
                            '                              <td valign="top" width="260" style="background-color:#1f2533;color:#49ba8e;font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:20px 10px 15px 20px">For any further query<br><a href="mailto:help@elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">help@elementsculmyca.com</a><br/><a href="http://www.elementsculmyca.com" style="text-decoration:none;color:#49ba8e;font-weight:bold" target="_blank">www.elementsculmyca.com</a></td>'+
                            '                              <td style="width:200px;vertical-align:top;background-color:#1f2533;text-align:right;padding:25px 0 15px 0">'+
                            '                                <img src="https://ci3.googleusercontent.com/proxy/SyVYUNSQvbO4Vpaz4vI18sLBe2mw869TmO_vsG2pCeAKavB7aEfM4-d-6da_55SKmc90xda9joSORt4Lnq5JrfJ1u0uoUOkq0yze=s0-d-e1-ft#http://in.bmscdn.com/webin/emailer/helpline-phone.png" alt="helpline phone" width="18" height="20" border="0" >'+
                            '                              </td>'+
                            '                              <td style="width:105px;vertical-align:top;padding:25px 0 15px 10px;text-align:left;background-color:#1f2533;color:#49ba8e;line-height:14px;font-size:12px;font-weight:bold">'+
                            '                                <a href="tel:+919643763712" style="text-decoration:none;color:#49ba8e" target="_blank">Ph: 9643763712</a>'+
                            '                                '+
                            '                              </td>'+
                            '                            </tr>'+
                            '                          </tbody></table>'+
                            '                        </td>'+
                            '                      </tr>'+
                            '                    </tbody>'+
                            '                  </table>'+
                            '                </td>'+
                            '              </tr>'+
                            '            </tbody></table>'+
                            '          </body>'+
                            '          </html>';
                            var from_email = new helper.Email('manantechnosurge@gmail.com','Elements Culmyca 2017');
                            var to_email = new helper.Email(updatedinfoforqr.email);
                            var subject = 'Registration Successful!';
                            var content = new helper.Content("text/html", html);
                            var mail = new helper.Mail(from_email, subject, to_email, content);

                            var sg = require('sendgrid')('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');
                            var request = sg.emptyRequest({
                              method: 'POST',
                              path: '/v3/mail/send',
                              body: mail.toJSON(),
                            });

                            sg.API(request, function(error, response) {
                              console.log(response.statusCode);
                              console.log(response.body);
                              console.log(response.headers);
                            });
                        })

                        //SENDING EMAIL SYSTEM ENDS
                    })
})

})
}
})

}else{
    res.json({ message: 'error, some fields missing' });
}
}