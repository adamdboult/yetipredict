"use strict";
/*jshint node:true */

//WINSTON
var logger = require(__dirname + '/config/winston');

//DEPENDENCIES, 'jade' not included but referenced later
var express  = require('express'),
    passport = require('passport'),
    flash = require('connect-flash'),
    //morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    //session = require('express-session'),
    //Q = require('q'),
    //bcrypt=require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    fs=require('fs'),
    http = require('http'),
    cookieSession = require('cookie-session'),
    https = require('https'),
    forceDomain = require("forcedomain"),
    favicon = require('serve-favicon'),
    sm = require("sitemap"),
    spawn = require('child_process').spawn;

// config
var configObj = JSON.parse(fs.readFileSync('private/config.json' , 'utf8'));
var mailgunObj = JSON.parse(fs.readFileSync('private/mailgun.json' , 'utf8'));

////Mailgun
var api_key = mailgunObj.api_key;
var domain = mailgunObj.domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var MailComposer = require('mailcomposer').MailComposer;

//CONNECT TO MONGODB
//mongoose.connect('mongodb://localhost/' + configObj.databaseName, function(err) {
mongoose.connect('mongodb://127.0.0.1:27017/' + configObj.databaseName, function(err) {
    if (err) logger.debug("ERR" + err);
});

//START EXPRESS
var app = express();
app.use(forceDomain({
    hostname: configObj.siteName,
    //  port: 443,
    protocol: 'https'
}));


//forward http to https
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

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

//AUTHENTICATION
app.use(cookieParser());
app.use(bodyParser());

app.set('trust proxy', 1);

app.use(cookieSession({
    name: 'session',
    keys: ["rdgnhudsrkhauwung5464grtd"]
}));

//app.use(session({secret: "rdgnhudsrkhauwung5464grtd"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require(__dirname + '/config/passport')(passport);


//DATA IMPORT
var JSONloc = 'data/json/0.json';
var jsonImport = fs.readFileSync(JSONloc, 'utf8').toString().split('\n');
var i, j = 0;
var db = mongoose.connection;
db.collection('jsonalls').drop();
var jsonObj;
var addToMongoCallback = function(jsonObj) {
    db.collection('jsonalls').save(jsonObj, function() {
	j = j + 1;
	if (j === jsonImport.length) {
	    filterInit();
	    favInit();
	}
    });
};

for (i = 0; i < jsonImport.length; i++) {	
    if (jsonImport[i] === "") {
	logger.debug("bad: " + i);
	j = j + 1;
	if (j === jsonImport.length) {
	    filterInit();
	}
    }
    else {
	jsonObj = JSON.parse(jsonImport[i]);
	addToMongoCallback(jsonObj);
    }

    if (jsonImport.length === i + 1) {
    }
}

//FILTER OBJECT
var filterArray = {};
var filterMatchIdentity = "Any";
var filterInit=function() {
    DataSerie.find({}, 'filter', function(err, allobjs) {
	if (err){
	    //		logger.debug("Error: "+err);
	}

	for (var filter in allobjs) {
	    for (var entry in allobjs[filter].filter) {
		if (Object.keys(filterArray).indexOf(entry) === -1) {
		    filterArray[entry] = [filterMatchIdentity];
		}
		if (filterArray[entry].indexOf(allobjs[filter].filter[entry]) === -1) {
		    filterArray[entry].push(allobjs[filter].filter[entry]);
		}
	    }
	}
	logger.debug("Filt: " + filterArray);	
    });
};

//FAVOURITE OBJECT
var favouriteObject = {};
var favInit = function() {
    DataSerie.find({"Favourite": "1"}, 'label Favourite', function(err, favObj) {
	if (err){
	    logger.debug("Error: " + err);
	}
	favouriteObject= favObj;
	logger.debug("Favs: " + favObj);
    });
};

//MODELS
var DataSerie = require(__dirname + '/config/models/data.js');
var PredictSerie = require(__dirname + '/config/models/predict.js');
var User = require(__dirname + '/config/models/user.js');
var Group = require(__dirname + '/config/models/group.js');

//FAVICON
app.use(favicon(__dirname + configObj.favicon));

// SITE MAP
var sitemap;

var refreshSitemap = function(){
    Group.find({"open": true,"lName": {$ne: "personal"}}, "lName open", function(err, idwa){
	var sitemapGroupArray = [];
	var siteGroup;
	var sitePrediction;
	var sitePredictionObject = {};
	for (siteGroup in idwa){
	    sitemapGroupArray.push(idwa[siteGroup].lName);
	    sitePredictionObject[idwa[siteGroup].lName] = [];
	}
	//userFind['local.username']={"$in":affectedUsers};
	//for (siteGroup in sitemapGroupArray){
	PredictSerie.find({"group" :{"$in": sitemapGroupArray}}, "ldesc group", function(err2, idwa2){
	    //PredictSerie.find({"group":sitemapGroupArray[siteGroup]},"ldesc group",function(err2,idwa2){
	    for (sitePrediction in idwa2){
		sitePredictionObject[idwa2[sitePrediction].group].push(idwa2[sitePrediction].ldesc);
	    }
	    var key;
	    var predKey;
	    var siteURLs=[];
	    for (key in sitePredictionObject){
		siteURLs.push({
		    url: '/group/' + key
		});
		siteURLs.push({
		    url: '/groupabout/' + key
		});
		for (predKey in sitePredictionObject[key]){
		    siteURLs.push({
			url: '/group/' + key + '/' + sitePredictionObject[key][predKey]
		    });
		    siteURLs.push({
			url: '/group/' + key + '/' + sitePredictionObject[key][predKey] + '/about/'
		    });
		}
	    }
	    var addMapEntry;
	    var additionalMap=[
		'/',
		'/data/',
		'/signup/',
		'/login/',
		'/data/',
		'/grouplist/',
		'/news/'
	    ];
	    for (addMapEntry in additionalMap){
		siteURLs.push({
		    url: additionalMap[addMapEntry]
		});
	    }
	    var files= fs.readdirSync(__dirname + '/src/jade/blog');
	    files.forEach(function(f){
		siteURLs.push({
		    url: "/news/"+f.substring(0, f.length - 5)
		});
	    });
	    sitemap=sm.createSitemap({
		hostname: "https://"+configObj.siteName,
		cacheTime: 60000,
		urls: siteURLs
	    });
	    //		setTimeout(refreshSitemap,10*60*1000);
	});
	//}

    });
};
refreshSitemap();
//backup mongo

var backupDatabases=function(){
    var args= [
	'--db',
	configObj.databaseName,
	'--out',
	'MongoDBDump/'+new Date()
	//'--collection',
	//'test'
    ];
    var mongodump = spawn('/usr/bin/mongodump', args);
    //    setTimeout(backupDatabases,24*60*60*1000);
};

backupDatabases();

var robotSend="";
var robotSendArray=[
    "User-agent: *",
    "Sitemap: /sitemap.xml"
];
var robotSendArrayEntry;
for (robotSendArrayEntry in robotSendArray){
    robotSend+="\n"+robotSendArray[robotSendArrayEntry];
}

app.get('/robots.txt', function(req,res){
    res.type('text/plain');
    //    res.send("User-agent: *\nSitemap: /sitemap.xml");
    res.send(robotSend);
});

app.get('/sitemap.xml', function(req, res){
    sitemap.toXML(function(xml){
	res.header('Content-Type', 'application/xml');
	res.send(xml);
    });
});

//ROUTES
app.use(express.static(__dirname + '/public'));// set the static files location /public/img will be /img for users

app.locals.pretty=true;
app.set('views',__dirname+'/src/jade/');
app.set('view engine', 'jade');

require(__dirname+'/config/routes/routes')(app, passport, logger, mailgun, MailComposer);
require(__dirname+'/private/admin')(app, passport, logger);
require(__dirname+'/config/routes/data')(app, passport, logger);
require(__dirname+'/config/routes/predict')(app, passport, logger);
require(__dirname+'/config/routes/user')(app, passport, logger);

app.get('/path/:id', function(req, res) {
    res.json(filterArray);
});

app.get('/favs/:id', function(req, res) {
    res.json(favouriteObject);
});

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

//HTTP
var HTTPportnum=configObj.ports.http;
var HTTPport = process.env.PORT || HTTPportnum;
//app.listen(HTTPport);

//HTTPS setup
var HTTPSportnum = configObj.ports.https;
var privateKey = fs.readFileSync(configObj.keys.privateKey);
var certificate = fs.readFileSync(configObj.keys.certificate);
var certAuth = fs.readFileSync(configObj.keys.certAuth);
var options = {key: privateKey,
	       cert: certificate,
	       ca: certAuth
	      };

var httpsPort = process.env.PORT || HTTPSportnum;

// LISTEN
var httpServer=http.createServer(app);
httpServer.listen(HTTPport);

logger.debug("App listening on port " + HTTPport);

var httpsServer=https.createServer(options,app);
httpsServer.listen(httpsPort);
logger.debug("HTTPS on port "+httpsPort);
