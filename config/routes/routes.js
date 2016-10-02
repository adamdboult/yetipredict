//var express=require('express');
var fs=require('fs');
//var https=require('https');
//var parseString = require('xml2js').parseString;
var modelArray=[];
var blogArray=[];
var rssString='<?xml version="1.0" encoding="UTF-8" ?>';
rssString   +='<rss version ="2.0">';
rssString   +='<channel>';
rssString   +='<title>YetiPredict</title>';
rssString   +='<link>http://www.yetipredict.com</link>';
rssString   +='<description>RSS feed for YetiPredict</description>';

rssString   +='<image>';
rssString   +='<url>http://www.yetipredict.com/img/yetiPredict.ico</url>';
rssString   +='<link>http://www.yetipredict.com</link>';
rssString   +='</image>';
var postTitle;
var postDate;
var postNoType;
var postFull;
fs.readdir(__dirname+'/../../src/jade/blog', function(err, files){
    files.forEach(function(f){
	postTitle=f.substring(8,f.length-5);
	postDate=new Date(f.substring(0,4),f.substring(4,6)-1,f.substring(6,8));
	postNoType=f.substring(0,f.length-5);
	postFull=f;
	blogArray.push({
	    full:postFull,
	    noType:postNoType,
	    //month -1 as starts from 0
	    date:postDate,
	    title:postTitle
	});
	rssString +='<item>';
	rssString +='<title>'+postTitle+'</title>';
	rssString +='<link>http://www.yetipredict.com/news/'+postNoType+'</link>';
	rssString +='<description>'+postTitle+'</description>';
	rssString +='<pubDate>'+postDate+'</pubDate>';
	rssString +='<author>Adam Boult</author>';
	rssString +='</item>';
	
	console.log("Files: "+f);
    });
    rssString +='</channel>';
    rssString +='</rss>';
});

fs.readdir(__dirname+'/../../src/jade/models', function(err, files){
    files.forEach(function(f){
	postTitle=f;
	modelArray.push({
	    title:f.substring(0,f.length-5),
	    noType:f.substring(0,f.length-5)
	});
	console.log("Files: "+f);
    });
});

module.exports=function(app,passport,logger,mailgun,MailComposer){
    'use strict';
    var DataSerie=require(__dirname+'/../models/data.js');
    var rootObject={root:__dirname+'/../../public'};

    app.get('/', function(req, res) {
//	res.sendFile('index.html',rootObject);
	res.render('index',{user:req.user});
    });

    //app.get('/n/:id', function(req,res) {
//	res.sendFile('p/posts/'+req.params.id+'/index.html',rootObject);
//    });

//    app.get('/p/pages/blog', function(req,res) {
//	res.sendFile('p/pages/blog/index.html',rootObject);
  //  });

    app.get('/news', function(req,res){
	res.render('blog',{posts:blogArray});
    });

    app.get('/models', function(req,res){
	console.log("abc");
	console.log("JSON"+JSON.stringify(modelArray));
	res.render('models',{models:modelArray});
	console.log("zyx");
    });

    /*app.get('/invite', function(req,res){
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    res.render('invite',{user:req.user});
	}
    });

    app.post('/invite/', function(req,res){
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    console.log("AWOO"+JSON.stringify(req.body));
	    verifyRecaptcha(req.body["g-recaptcha-response"], function(success){
		console.log("success?"+success);
		if (success){
		    console.log("captcha success");
		    var email=req.body.email;
		    console.log("HERE"+email);
		    var mailcomposer=new MailComposer();
		    var htmlMessage='You have been invited to www.econyeti.com by '+req.user.local.username+'('+req.user.local.email+').';
		    console.log("SENT: "+htmlMessage);
		    mailcomposer.setMessageOption({
			from: 'Econyeti <mail@econyeti.com>',
			to: email,
			subject: 'Hello',
			body: htmlMessage,
			html: htmlMessage
		    });
		    mailcomposer.buildMessage(function(mailBuildError, messageSource) {
			var dataToSend={
			    to: email,
			    message: messageSource
			};
			mailgun.messages().sendMime(dataToSend, function (sendError, body) {
			    if (sendError){
				console.log(sendError);
				return;
			    }
			    console.log("body: "+JSON.stringify(body));
			});
		    });
		    res.end("success");
		}
		else {
		    console.log("captcha failure");
		}
	    });
	}
    });*/

    app.get('/news/:post', function(req,res){
	res.render('blog/'+req.params.post);
    });

    app.get('/models/:post', function(req,res){
	res.render('models/'+req.params.post);
    });

    app.get('/rss', function(req,res){
	//parseString(rssString, function(err, result) {
	 //   console.dir(result);
	 //   res.send(result);
	//});
	console.log("RSS: "+rssString);
	res.set('Content-Type', 'application/rss+xml');
	res.send(rssString);
    });

   app.get('/data', function(req, res) {
//	res.sendFile('data.html',rootObject);
	res.render('data',{user:req.user});
    });

    app.get('/about', function(req,res){
	res.render('about',{user:req.user});
    });
    //return router;
};

