"use strict";
/*jshint node:true */

// Dependencies
var flash    = require('connect-flash');
var express  = require('express');
var session  = require('express-session');
var fs       = require('fs');
var http     = require('http');
var passport = require('passport');
var mongoose = require('mongoose');

////////////////////////////////////
/* Process command line arguments */
////////////////////////////////////

var http_port = 8080;
if (process.argv[2] != null) {
    http_port = process.argv[2];
}

var mongo_domain = "127.0.0.1";
if (process.argv[3] != null) {
    mongo_domain = process.argv[3];
}


var mongo_port = 27017;
if (process.argv[4] != null) {
    mongo_port = process.argv[4];
}

console.log("HTTP port is: "   + http_port);
console.log("Mongo domain is: "+ mongo_domain);
console.log("Mongo port is: "  + mongo_port);

/////////////
/* Mailgun */
/////////////
var mailgunObj = JSON.parse(fs.readFileSync(__dirname + '/private/mailgun.json', 'utf8'));

var api_key = mailgunObj.api_key;
var domain = mailgunObj.domain;
//var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var MailComposer = require('mailcomposer').MailComposer;

//MAIL GUN
var data = {
    from: mailgunObj.fromMail,
    to: mailgunObj.toMail,
    subject: 'Hello',
    text: 'Testing some Mailgun awesomness! Written by Adam.'
};

//mailgun.messages().send(data, function (error, body) {
//  console.log(body);
//});

///////////
/* Mongo */
///////////
var database_name = "yetipredict";

/*
mongoose.connect('mongodb://' + mongo_domain + ':' + mongo_port + '/' + database_name, { useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
    if (err) console.error("ERR" + err);
});
*/
console.log("hi");
console.log(mongo_domain);
console.log(mongo_port);
console.log("hib");
mongoose.connect('mongodb://' + mongo_domain + ':' + mongo_port + '/' + database_name, { useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect('mongodb://' + mongo_domain + ':' + mongo_port + '/' + database_name, { useNewUrlParser: true, useUnifiedTopology: false});



/*
if (console.log(process.argv[2]) === "docker") {
    mongoose.connect('mongodb://yetipredict_mongo:27123/' + configObj.databaseName, { useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
        if (err) console.error("ERR" + err);
    });
}
else {
    mongoose.connect('mongodb://127.0.0.1:27017/' + configObj.databaseName, { useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
        if (err) console.error("ERR" + err);
    });
}
*/

// Model
var PredictSerie = require(__dirname + '/config/models/predict.js');
var User         = require(__dirname + '/config/models/user.js');
var Group        = require(__dirname + '/config/models/group.js');



// Create the admin account
require(__dirname+'/private/admin')(app, passport);

////////////////////////
/* Express and routes */
////////////////////////
var app = express();

//AUTHENTICATION
app.use(express.urlencoded({extended : false}));

app.use(session({
    secret: "rdgnhudsrkhauwung5464grtd",
    resave : true,
    saveUninitialized : true,
    cookie: { sameSite: 'strict' }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg   = req.flash('error_msg');
    res.locals.error       = req.flash('error');
    next();
});

require(__dirname + '/config/passport')(passport);


//ROUTES
app.use(express.static(__dirname + '/public'));// set the static files location /public/img will be /img for users

//app.locals.pretty = true;
app.set('views', __dirname + '/src/pug/');
app.set('view engine', 'pug');

//require(__dirname+'/config/routes/routes')(app, passport, logger, mailgun, MailComposer);

require(__dirname+'/config/routes/predict')(app, passport);
require(__dirname+'/config/routes/user')(app, passport);

// Since this is the last non-error-handling
// middleware used, we assume 404, as nothing else
// responded.
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
	res.render('404', { url: req.url });
	return;
    }

    // respond with json
    if (req.accepts('json')) {
	res.send({ error: 'Not found' });
	return;
    }
    
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

/////////////////
/* HTTP server */
/////////////////
var httpServer=http.createServer(app);
var HTTPport = process.env.PORT || http_port;
httpServer.listen(HTTPport);

console.log("App listening on port " + http_port);

