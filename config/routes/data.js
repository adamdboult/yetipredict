//var express=require('express');

var logger=require(__dirname+'/../winston');
module.exports=function(app,passport,logger){
    'use strict';
    var DataSerie=require(__dirname+'/../models/data.js');
//    var router=express.Router();
    //var mongoose=require('mongoose');
    var rootObject={root:__dirname+'/../../public'};

    app.get('/dpi/:id', function(req, res) {
	DataSerie.find({'_id': req.params.id},function(err, idw) {
	    if (err){
		logger.debug("doh");
		res.send(err);
	    }
	    res.json(idw);
	    //logger.debug("send: "+idw);
	});
    });
    var filterMatchIdentity="Any";
    app.get('/cpi/:id', function(req, res) {
	var reqObj=JSON.parse(req.params.id);
	var pagenum=reqObj.pageCount-1;
	delete reqObj.pageCount;
	var query ={};
	for (var x in reqObj) {
	    if (reqObj[x]===filterMatchIdentity) {
		query["filter."+x]={$exists:true};
	    }
	    else {
		query["filter."+x]=reqObj[x];
	    }
	}
	var pagelen = 20;
	for (var ftrs in query) {
	}
	DataSerie.count(query,function(err1,edw1) {
            DataSerie.find(query, 'uniqueID label filter', {skip:pagenum*pagelen,limit:pagelen},function(err, idw) {
		if (err){
	            res.send(err);
		}
		var pagesArray=[Math.ceil(edw1/pagelen),1];
		var pages =Math.max.apply(Math,pagesArray);
		idw.push(pages);
		res.json(idw);
	    });
	});
    });
//    return router;
};
