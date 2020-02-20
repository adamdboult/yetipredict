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
/*
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
    });
});
*/
module.exports=function(app, passport, logger, mailgun, MailComposer){
    'use strict';
    //var DataSerie=require(__dirname+'/../models/data.js');
    //var rootObject={root:__dirname+'/../../public'};
    
    // STATIC
    app.get('/', function(req, res) {
	res.redirect('/predict');
	//res.render('home');
    });
/*
    app.get('/news', function(req,res){
	res.render('blog',{posts:blogArray});
    });

    app.get('/theory', function(req,res){
	res.render('theory');
    });


    app.get('/models', function(req,res){
	res.render('models',{models:modelArray});
    });

    app.get('/rss', function(req,res){
	res.set('Content-Type', 'application/rss+xml');
	res.send(rssString);
    });

   app.get('/data', function(req, res) {
	res.render('data', {user:req.user});
    });
*/
    app.get('/about', function(req,res){
	res.render('about', {user:req.user});
    });

    // DYNAMIC
/*
    app.get('/theory/:area', function(req,res){
	res.render('theory/'+req.params.area, {}, function(err, html) {
	    if(err) {
		res.render('404', { url: req.url });
	    } else {
		res.send(html);
	    }
	});
    });
    
    app.get('/theory/:area/:subject', function(req,res){
	res.render('theory/'+req.params.area+'/'+req.params.subject, {}, function(err, html) {
	    if(err) {
		res.render('404', { url: req.url });
	    } else {
		res.send(html);
	    }
	});
    });
    
    app.get('/theory/:area/:subject/:subsubject', function(req,res){
	res.render('theory/'+req.params.area+'/'+req.params.subject+'/'+req.params.subsubject, {}, function(err, html) {
	    if(err) {
		res.render('404', { url: req.url });
	    } else {
		res.send(html);
	    }
	});
    });

    app.get('/news/:post', function(req,res){
	res.render('blog/'+req.params.post, {}, function(err, html) {
	    if(err) {
		res.render('404', { url: req.url });
	    } else {
		res.send(html);
	    }
	});
    });

    app.get('/models/:post', function(req,res){
	res.render('models/'+req.params.post, {}, function(err, html) {
	    if(err) {
		res.render('404', { url: req.url });
	    } else {
		res.send(html);
	    }
	});
    });
*/
};

