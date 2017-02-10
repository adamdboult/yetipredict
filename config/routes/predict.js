//var express=require('express');

var regexObject={
    alphanum:/^[a-zA-Z0-9]+$/,
    special:/^[a-zA-Z0-9£\$€%;\.\+#@\? -]+$/,
    num:/^\d*\.?\d*$/,
    makeLower:/[^a-z0-9_-]+/g,
    username:/^[a-z0-9_-]{3,15}$/
};

module.exports=function(app,passport,logger){
    'use strict';

    var PredictSerie=require(__dirname+'/../models/predict');
    var GroupSerie=require(__dirname+'/../models/group');
    var User=require(__dirname+'/../models/user');

    var rootObject={root:__dirname+'/../../public'};

    var validationCheck={
	val: {
	    "name": "val",
	    "len": 100,
	    "chars": "num",
	    "required":true
	},
	group: {
	    "name": "group",
	    "len": 100,
	    "chars": "special",
	    "required":true
	},
	answer: {
	    "name": "answer",
	    "len": 100,
	    "chars": "special",
	    "required":true
	},
	prediction: {
	    "name": "prediction",
	    "len": 100,
	    "chars": "special",
	    "required":true
	},
	verbose: {
	    "name": "verbose",
	    "len": 5000,
	    "chars": "special",
	    "required":false
	},
	answers: {
	    "name": "answers",
	    "len": 1000,
	    "chars": "special",
	    "required":true
	},
	end: {
	    "name": "end",
	    "len": 1000,
	    "chars": "date",
	    "required":false
	},
	source: {
	    "name": "source",
	    "len": 1000,
	    "chars": "special",
	    "required":false
	},
	open: {
	    "name": "open",
	    "len": 1000,
	    "chars": "alphanum",
	    "required":true
	},
	outcome: {
	    "name": "outcome",
	    "len": 5000,
	    "chars": "special",
	    "required":true
	},
	comment: {
	    "name": "comment",
	    "len": 5000,
	    "chars": "special",
	    "required":true
	},
	commentID: {
	    "name": "commentID",
	    "len": 5000,
	    "chars": "special",
	    "required":true
	},
	up: {
	    "name": "up",
	    "len": 5000,
	    "chars": "special",
	    "required":true
	},
	user: {
	    "name": "user",
	    "len": 5000,
	    "chars": "username",
	    "required":true
	}
    };


    function voteFunction(req,group,prediction,up){
	var findObject={};
	group=makeLower(group);
	prediction=makeLower(prediction);
	findObject.group=group;
	findObject.ldesc=prediction;
	if (group==='personal'){
	    findObject.author=req.user.local.username;
	}
	isMember(req,group, function(tf,groupProper){
	    if (tf&&(up===-1||up===0||up===1)){
		var findObjectAlready=JSON.parse(JSON.stringify(findObject));
		findObjectAlready['vote.name']=req.user.local.username;
		var voteSend={};
		var voteImpact;
		voteSend.name=req.user.local.username;
		voteSend.outcome=up;
		voteSend.date=new Date();
		PredictSerie.findOne(findObjectAlready,function(err,idwa){
		    var updateObject={};
		    if (idwa) {
			var voteNames=[];
			for (var i=0;i<idwa.vote.length;i++){
			    voteNames.push(idwa.vote[i].name);
			}
			var voteIndex=voteNames.indexOf(req.user.local.username);
			var previousVote=idwa.vote[voteIndex];
			voteImpact=up-previousVote.outcome;
		    }
		    else {
			voteImpact=up;
		    }

		    if (voteSend.outcome===0){
			updateObject={$inc:{"score":voteImpact}};			    
		    }
		    else {
			updateObject={$inc:{"score":voteImpact},$push: {"vote": voteSend}};
		    }
		    PredictSerie.findOneAndUpdate(findObject,
						  updateObject,
						  {safe: true, upsert: true},
						  function(err, result) {
						      var groupFind={lName:group};
						      GroupSerie.findOneAndUpdate(groupFind,
										  {$inc:{"score":voteImpact}},
										  {safe:true, upsert: true},
										  function(err2,result2){
										      updateObject={$pull:{"vote":{"name":req.user.local.username,"date":{$lt:voteSend.date}}}};
										      PredictSerie.findOneAndUpdate(findObject,
											  			    updateObject,
											  			    {safe: true, upsert: true},
											  			    function(err3, result3) {
											  			    });
										  });
						  });
		});
	    }
	    else {
	    }
	});
    }

    function stripIncomingObject(params, metaArray){
	var candidate,re,result,entry,keyUsed,parsedParams,accepted,valCheckObject;
	result={};
	accepted=true;
	parsedParams=JSON.parse(decodeURI(params));
	for (entry in metaArray) {
	    console.log("entry is: "+metaArray[entry]);
	    keyUsed=metaArray[entry];
	    candidate=parsedParams[keyUsed];
	    valCheckObject=validationCheck[keyUsed];
	    if (valCheckObject.len>0){
		console.log("going here this time");
		if (!candidate){
		    logger.debug("aelpha");
		}
		else if (candidate.length>valCheckObject.len){
		    logger.debug("fail bravo");
		    accepted=false;
		}
	    }
	    if (typeof candidate==="undefined"){
		console.log("aperhere");
		console.log(candidate===false);
		if (valCheckObject.required){
		    console.log("sad face");
		    accepted=false;
		}
	    }
	    else {
		console.log("or here...");
		if (valCheckObject.chars!=="any"){
		    if (valCheckObject.chars==="alphanum"){
			//re=/^[a-zA-Z0-9]+$/;
			re=regexObject.alphanum;
			if (re.test(candidate)===false){
			    logger.debug("Uh oh. "+candidate+" failed on alphanum.");
			    accepted=false;
			}
		    }
		    else if (valCheckObject.chars==="special"){
			//re=/^[a-zA-Z0-9£\$€%;\.\+#@\? -]+$/;
			re=regexObject.special;
			if (re.test(candidate)===false){
			    logger.debug("Uh oh. "+candidate+" failed on special.");
			    accepted=false;
			}
		    }
		    else if (valCheckObject.chars==="num"){
			//re=/^\d*\.?\d*$/;
			re=regexObject.num;
			if (re.test(candidate)===false){
			    logger.debug("Uh oh. "+candidate+" failed on num.");
			    accepted=false;
			}
		    }
		    else if (valCheckObject.chars==="date"){
		    }
		    else if (valCheckObject.chars==="username"){
			re=regexObject.username;
			if (re.test(candidate)===false){
			    logger.debug("Uh oh. "+candidate+" failed on num.");
			    accepted=false;
			}
		    }
		}
	    }
	    result[keyUsed]=candidate;
	}
	if (accepted){
	    return result;
	}
	else {
	    return undefined;
	}
    }
   
    function stripIncomingString(params){
	var result;
	result=decodeURI(params);
	return result;
    }
    
    function renderJade(req,res,dest,renderHeader){
	var message=renderHeader.message;
	var group=makeLower(renderHeader.group);
	var privacy,verbose,admins=[],members=[];
	GroupSerie.findOne({"lName":group},"name open verbose admins members",function(err,idwa){
	    console.log(1);
	    if (idwa) {
		privacy=idwa.open;
		verbose=idwa.verbose;
		admins=idwa.admins;
		members=idwa.members;
		renderHeader.groupProper=idwa.name;
	    }
	    else {
		privacy=false;
		verbose="";
		admins=[];
		members=[];
	    }
	    console.log(2);
	    renderHeader.myAdmins=[];
	    renderHeader.myMembers=[];
	    if (req.user){
		renderHeader.myAdmins=req.user.admins;
		renderHeader.myMembers=req.user.members;
	    }
	    console.log(3);
	    getGroupsPrivate(req,function(groupList){
		console.log(4);
		renderHeader.ara={array:groupList};
		renderHeader.open=privacy;
		renderHeader.verbose=verbose;
		renderHeader.admins=admins;
		renderHeader.members=members;
		if (req.user) {
		    renderHeader.user=req.user;
		    renderHeader.adminAccess=false;
		    if (admins.indexOf(makeLower(req.user.local.username))>-1){
			renderHeader.adminAccess=true;
		    }
		    if (req.user.local.admin){
			renderHeader.adminAccess=true;
		    }
		}
		renderHeader.predictionAccess=false;
		console.log(5);
		if(renderHeader.prediction){
		    console.log(6);
		    predictionPermission(req,group,renderHeader.prediction,function(tf){
			if (tf){
			    renderHeader.predictionAccess=true;
			}
			else{
			}
			res.render(dest,renderHeader);
		    });
		}
		else{
		    res.render(dest,renderHeader);
		}
	    });
	});
    }

    function getGroupsRaw(fn){
	function compare(a,b){
	    if(a.lName==="personal"){
		return -1;
	    }
	    else if(a.open>b.open){
		return 1;
	    }
	    else if(a.open<b.open){
		return -1;
	    }
	    else if(a.score>b.score){
		return -1;
	    }
	    else if(a.score<b.score){
		return 1;
	    }
	    else {
		return 0;
	    }
	}
	GroupSerie.find({},'score name lName open members',function(err,idwa){
	    idwa.sort(compare);
	    fn(idwa);
	});
    }

    function isMember(req,group,cb){
	var findObject={"lName":makeLower(group)};
	GroupSerie.findOne(findObject,"members open name",function(err,idwa){
	    if (idwa){
		if (idwa.open){
		    cb(true,idwa.name);
		}
		else if (req.user){
		    if (idwa.members.indexOf(req.user.local.username)>-1){
			cb(true,idwa.name);
		    }
		    else if (req.user.local.admin) {
			cb(true,idwa.name);
		    }
		}
		else {
		    cb(false,idwa.name);
		}
	    }
	    else {
		cb(false,"");
	    }
	});
    }

    function isAdmin(req,group,cb){
	if (req.user.local.admin) {
	    cb(true);
	}
	else {
	    var findObject={"lName":makeLower(group)};
	    GroupSerie.findOne(findObject,"admins name",function(err,idwa){
		if (idwa.admins.indexOf(req.user.local.username)>-1){
		    cb(true,idwa.name);
		}
		else {
		    cb(false,idwa.name);
		}
	    });
	}
    }

    function isAdminMaster(req,cb){
	if (req.user.local.admin) {
	    cb(true);
	}
	else {
	    cb(false);
	}
    }

    function predictionPermission(req,group,prediction,cb){
	if (req.user){
	    var useGroup=makeLower(group);
	    if (req.user.local.admin) {
		cb(true);
	    }
	    else if (useGroup==="personal"){
		cb(true);
	    }
	    else {
		var usePrediction=makeLower(prediction);
		var findObject={"lName":useGroup};
		GroupSerie.findOne(findObject,"admins",function(err,idwa){
		    if (idwa.admins.indexOf(req.user.local.username)>-1){
			cb(true);
		    }
		    else {
			findObject={"ldesc":usePrediction, "group":useGroup};
			PredictSerie.findOne(findObject,"lauthor",function(err,idwa){
			    if (idwa.lauthor===req.user.local.username){
				cb(true);
			    }
			    else{
				cb(false);
			    }
			});
		    }
		});
	    }
	}
	else {
	    cb(false);
	}
    }

    function getGroupsLower(fn){
	getGroupsRaw(function(groups){
	    var groupList=[];
	    var group;
	    var candidate;
	    for (group in groups){
		candidate=groups[group];
		if (groupList.indexOf(candidate.lName)===-1){
		    groupList.push(candidate.lName);
		}
	    }
	    fn(groupList);
	});
    }

    function getGroupsPrivate(req,fn){
	getGroupsRaw(function(groups){
	    var groupList=[];
	    var groupObjects=[];
	    var candidate;
	    var userCheck;
	    var adminCheck;
	    if (req.user){
		userCheck=req.user.local.username;
		adminCheck=req.user.local.admin;
	    }
	    var group;
	    var objectCandidate={};
	    for (group in groups){
		candidate=groups[group];
		if (groupList.indexOf(candidate.name)===-1&&(candidate.open===true||(candidate.members.indexOf(userCheck)>-1)||adminCheck)){
		    groupList.push(candidate.name);
		    objectCandidate={};
		    objectCandidate.name=candidate.name;
		    objectCandidate.open=candidate.open;
		    objectCandidate.personal=false;
		    objectCandidate.lName=candidate.lName;
		    if (candidate.name==="Personal"){
			objectCandidate.personal=true;
			if(req.user){
			    groupObjects.push(objectCandidate);
			}
		    }
		    else {
			groupObjects.push(objectCandidate);
		    }
		}
	    }
	    if (!(req.user)){
		groupList.splice(groupList.indexOf('Personal'),1);
	    }
	    fn(groupObjects);
	});
    }

    function groupsInit(){
	    GroupSerie.findOne({"lName":"personal"},'lName',function(err,idwa){
		if (!(idwa)){
		    var groupObj={};
		    var groupReceive;
		    groupObj.name='Personal';
		    groupObj.lName='personal';
		    groupObj.open=true;
		    groupObj.score=0;
		    groupReceive = new GroupSerie(groupObj);
		    groupReceive.save(function (err, predictReceive) {
			if (err) {
			}
			else {
			}
		    });		    
		}
	    });
    }
    groupsInit();

    function getUsers(fn){
	User.find({},'local',function(err,idwa){
	    var x;
	    var  userList=[];
	    for (x in idwa){
		userList.push(idwa[x].local.username);
	    }
	    fn(userList);
	});
    }

    app.get('/newgroup', function(req, res) {
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    var renderHeader={};
	    renderHeader.message="";
	    renderHeader.group="";
	    renderJade(req,res,'newgroup',renderHeader);
	}
    });

    app.get('/getUserList',function(req,res){
	var group;
	//isAdmin(req,group,function(tf){
	//    if(tf){
		getUsers(function(inc){
		    res.json({users:inc});
		});
	//    }
	//    else{
	//	res.json({message:"error"});
	//    }
	//});
    });

    app.get('/users', function(req, res) {
	var group;
	//isAdmin(req,group,function(tf){
	  //  if(tf){
		var renderHeader={};
		renderHeader.message="";
		renderHeader.group="";
		renderJade(req,res,'users',renderHeader);
	//    }
	//    else{
	//	res.redirect('/');
	//    }
	//});
    });

    app.get('/getUserName',function(req,res){
	if (req.user===undefined){
	    res.json({});
	}
	else {
	    res.json({username:req.user.local.username});
	}
    });

    /*app.get('/predict', function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	renderHeader.group="";
	renderJade(req,res,'predict',renderHeader);
    });*/
    
//    app.get('/predict', function(req,res) {
//	res.redirect('/predict?page=0');
  //  });
    
    function predictionsOrGroup(req,res,renderHeader,template){
	getGroupsPrivate(req,function(groupList){
	    var group;
	    var groupArray=[];
	    var pagelen=20;
	    var pagenum=0;
	    if (req.query.page){
		pagenum=req.query.page;
	    }
	    var sortBy="score";
	    if (req.query.sort){
		if (req.query.sort==="score"){
		    sortBy="score";
		}
		else if (req.query.sort==="date"){
		    sortBy="date";
		}
	    }
	    for (group in groupList){
		if (groupList[group].lName!=="personal"){
		    groupArray.push(groupList[group].lName);
		}
	    }
	    var predictionFind={};
	    //complete find allows queries to only return complete predcitions or incomplete predictions. 1 is only completes, 0 only incomplete and -1 all
	    var completeFind=-1;
	    var completeFindURL=-1;
	    if (req.query.complete){
		if (parseInt(req.query.complete)===1){
		    completeFind=true;
		    completeFindURL=1;
		}
		if (parseInt(req.query.complete)===0){
		    completeFind=false;
		    completeFindURL=0;
		}
	    }
	    var groupFind;
	    var personalFind;
	    var send=1;
	    if (renderHeader.group===""){
		groupFind={group:{$in: groupArray}};
		if (completeFind===-1){
		}
		else {
		    groupFind.complete=completeFind;
		}
		if (req.user){
		    personalFind={group:"personal",author:req.user.local.username};
		    if (completeFind===-1){
		    }
		    else {
			personalFind.complete=completeFind;
		    }
		    predictionFind={$or:[groupFind,personalFind]};
		}
		else{
		    predictionFind=groupFind;
		}
	    }
	    else if(groupArray.indexOf(renderHeader.group)>-1){
		predictionFind={group:renderHeader.group};
		if (completeFind===-1){
		}
		else {
		    predictionFind.complete=completeFind;
		}
	    }
	    else if(renderHeader.group==="personal"){
		if (req.user){
		    predictionFind={group:renderHeader.group};
		    predictionFind.author=req.user.local.username;
		    if (completeFind===-1){
		    }
		    else {
			predictionFind.complete=completeFind;
		    }
		}
		else {
		    send=0;
		}
	    }
	    else{
		send=2;
	    }
	    if (send===1){
		logger.debug("DAT"+sortBy);
		console.log("DAT"+sortBy);
		var sortObj = {"complete":1,"start":-1};
		if (sortBy ==="score"){
		    sortObj = {"complete":1,"score":-1};
		}
		console.log(sortBy==="score");
		console.log(sortBy==="date");
		PredictSerie.count(predictionFind,function(err1,edw1) {
		    PredictSerie.find(predictionFind)
			.sort(sortObj)
		    	//.sort("-"+sortBy)
			.skip(pagenum*pagelen)
			.limit(pagelen)
			.select('desc score ldesc group groupProper open start complete outcomes headline')
			.exec(function(err,idw){
			    if (err){
				res.send(err);
			    }
			    var pagesArray=[Math.ceil(edw1/pagelen),1];
			    var pages =Math.max.apply(Math,pagesArray);
			    renderHeader.thisPage=parseInt(pagenum);
			    renderHeader.totalPages=Math.ceil(edw1/pagelen);
			    renderHeader.predictionsArray=idw;
			    //renderHeader.pageURL="page="+(parseInt(pagenum));
			    //renderHeader.nextPageURL="page="+(parseInt(pagenum)+1);
			    //renderHeader.previousPageURL="page="+(parseInt(pagenum)-1);
			    renderHeader.sortURL="sort="+sortBy;
			    renderHeader.completeURL="complete="+completeFindURL;
			    renderHeader.nextPage="?page="+(parseInt(pagenum)+1)+"&sort="+sortBy+"&complete="+completeFindURL;
			    renderHeader.previousPage="?page="+(parseInt(pagenum-1))+"&sort="+sortBy+"&complete="+completeFindURL;
			    renderJade(req,res,template,renderHeader);
			});
		});
	    }
	    else {
		if (send===0){
		    res.redirect('/signup');
		}
		else {
		    res.redirect('/nopermission/'+renderHeader.group);
		}
	    }
	});

    }

    app.get('/predict', function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	renderHeader.group="";
	//var doc;
	predictionsOrGroup(req,res,renderHeader,'predict');
    });

    app.get('/group/:group', function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	//renderHeader.group="";
	renderHeader.group=makeLower(req.params.group);
	//var doc;
	predictionsOrGroup(req,res,renderHeader,'group');
    });

    app.get('/grouplist', function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	renderHeader.group="";
	renderJade(req,res,'grouplist',renderHeader);
    });

    app.get('/login', isLoggedOut, function(req, res) {
	var renderHeader={};
	renderHeader.group="";
	renderHeader.message=req.flash('loginMessage');
	renderJade(req,res,'login',renderHeader);

    });

    app.get('/signup', isLoggedOut, function(req, res) {
	var renderHeader={};
	renderHeader.group="";
	renderHeader.message=req.flash('signupMessage');
	renderJade(req,res,'signup',renderHeader);

    });

    function Comparator(a,b){
	if (a[1] < b[1]) return -1;
	if (a[1] > b[1]) return 1;
	return 0;
    }

    app.get('/sub/:id', isLoggedIn,function(req,res) {
	var metaArray=[
	    "val",
	    "group",
	    "answer",
	    "prediction"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    var datetime=new Date();
	    reqObject.name=req.user.local.username;
	    reqObject.date=datetime;
	    reqObject.weight=0.5;

	    var findObject={};
	    findObject.group=makeLower(reqObject.group);
	    findObject.ldesc=makeLower(reqObject.prediction);
	    if (makeLower(reqObject.group)==='personal'){
		findObject.author=req.user.local.username;
	    }
	    
	    var predictionStrip={};
	    predictionStrip.val=reqObject.val;
	    predictionStrip.weight=reqObject.weight;
	    predictionStrip.name=reqObject.name;
	    predictionStrip.date=reqObject.date;
	    predictionStrip.answer=reqObject.answer;
	    var i,j;
	    isMember(req,reqObject.group,function(tf, groupProper){
		if (reqObject.val>=0&&reqObject.val<=1&&reqObject.name&&reqObject.group&&tf){
		    PredictSerie.findOne(findObject,function(err,idwa){
			if (idwa) {
			    var allowed=true;
			    for (i=0;i<idwa.outcomes.length;i++){
				if (idwa.outcomes[i].answer===predictionStrip.answer&&idwa.outcomes[i]>-1){
				    allowed=false;
				}
			    }
			    var highLightObject={};
			    var meanData=[];
			    var dataResponse=idwa.data;
			    dataResponse.push(predictionStrip);
			    for (j=0;j<dataResponse.length;j++){
				if (dataResponse[j].answer===predictionStrip.answer){
				    if (highLightObject[dataResponse[j].name]){
					if (new Date(dataResponse[j].date)>new Date(highLightObject[dataResponse[j].name][1])) {
					    highLightObject[dataResponse[j].name]=[dataResponse[j].val,new Date(dataResponse[j].date)];
					}
				    }
				    else {
					highLightObject[dataResponse[j].name]=[dataResponse[j].val,new Date(dataResponse[j].date)];
				    }
				}
			    }
			    var meanTotal=0;
			    var meanCount=0;
			    for (var useName in highLightObject){
				meanCount++;
				meanTotal+=highLightObject[useName][0];
			    }
			    var mean=meanTotal/meanCount;
			    var headlineUpdate=idwa.headline;
			    var position=idwa.answers.indexOf(predictionStrip.answer);
			    headlineUpdate[position]=mean;
			    if (allowed){
				PredictSerie.findOneAndUpdate(findObject,
							      {$push: {"data": predictionStrip},$set:{"headline":headlineUpdate},$addToSet:{"users":reqObject.name}},
							      {safe: true, upsert: true},
							      function(err, result) {
								  var voteRequestPartial={"up":1,
											  "group":findObject.group,
											  "prediction":findObject.ldesc};
								  req.params.id=JSON.stringify(voteRequestPartial);
								  voteFunction(req,findObject.group,findObject.ldesc,1);
								  var userFind={};
								  userFind['local.username']=reqObject.name;
								  User.findOneAndUpdate(userFind,
											{$addToSet: {"groups":findObject.group,"predictions":findObject.group+"&"+findObject.ldesc,"groupsProper":groupProper,"predictionsProper":findObject.group+"&"+result.desc}},
											{safe: true, upsert: true},
											function(err0, result0) {
											    logger.debug("sending 0");
											    res.json({});
											    logger.debug("sent 0");
											}
										       );
							      }
							     );
			    }
			    else {
				logger.debug("sending 1");
				res.json({});
			    }
			}
			else {
			    logger.debug("sending 2");
			    res.json({});
			}
		    });
		}
		else {
		    logger.debug("sending 3");
		    res.json({message:"Invalid number" });
		}
	    });
	}
    });

    app.get('/removeMember/:id',function(req,res){
	//var keyArray=['group','member'];
	/*var metaArray=[
	    {
		"name": "group",
		"len": 100,
		"chars": "special",
		"required":true
	    },
	    {
		"name": "member",
		"len": 100,
		"chars": "special",
		"required":true
	    }
	];*/
	var metaArray=[
	    "group",
	    "user"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    var findObject={lName:makeLower(reqObject.group)};
	    var name=makeLower(reqObject.user);
	    var permission=false;
	    isAdmin(req,reqObject.group,function(tf,groupProper){
		if (tf){
		    GroupSerie.findOne(findObject,"members",function(err,idwa){
			if (err) {
			    res.json({message:"Error"});
			}
			else if (idwa.members.indexOf(name)>-1&&name!=="admin"&&name!==req.user.local.username){
			    var findUser={};
			    findUser['local.username']=name;
			    User.findOneAndUpdate(findUser,
						  {$pull: {
						      "predictions":{$regex:findObject.lName+"&.*"},
						      "predictionsAdmin":{$regex:findObject.lName+"&.*"},
						      "groups":findObject.lName,
						      "admins":findObject.lName,
						      "predictionsProper":{$regex:findObject.lName+"&.*"},
						      "predictionsAdminProper":{$regex:findObject.lName+"&.*"},
						      "groupsProper":groupProper,
						      "adminsProper":groupProper
						  }},
						  {safe: true, upsert: true},
						  function(err,idwa){
						      if (idwa){
							  GroupSerie.findOneAndUpdate(findObject,
										      {$pull: {"members": name}},
										      {safe: true, upsert: true},
										      function(err, result) {
											  res.json({success:true});
										      }
										     );
						      }
						      else {
							  res.json({message:"no such member"});
						      }
						  });
			}
			else {
			    res.json({message:"already a member"});
			}
		    });
		}
	    });
	}
    });

    app.get('/updateMembers/:id',function(req,res){
	var metaArray=[
	    "group",
	    "user"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    //	var keyArray=['group','name'];
	    //	incoming=stripIncoming(req.params.id,keyArray);
	    var findObject={lName:makeLower(reqObject.group)};
	    var newName=makeLower(reqObject.user);
	    var permission=false;
	    isAdmin(req,findObject.lName,function(tf,groupProper){
		if (tf){
		    GroupSerie.findOne(findObject,"members",function(err,idwa){
			if (err) {
			    res.json({message:"Error"});
			}
			else if (idwa.members.indexOf(newName)===-1&&newName!=="admin"){
			    var findUser={};
			    findUser['local.username']=newName;
			    User.findOneAndUpdate(findUser,
						  {$addToSet: {
						      "groups":findObject.lName,
						      "groupsProper":groupProper
						  }},
						  {safe: true, upsert: true},
						  function(err,idwa){
						      if (idwa){
							  GroupSerie.findOneAndUpdate(findObject,
										      {$push: {"members": newName}},
										      {safe: true, upsert: true},
										      function(err, result) {
											  res.json({success:true});
											  var userFind={"local":
													{"username":newName}
												       };
										      }
										     );
						      }
						      else {
							  res.json({message:"no such member"});
						      }
						  });
			}
			else {
			    res.json({message:"already a member"});
			}
		    });
		}
	    });
	}
    });

    app.get('/newpredictsend/:id', function(req,res){
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    var metaArray=[
		"verbose",
		"group",
		"answers",
		"prediction",
		"end",
		"source"
	    ];
	    var reqObject=stripIncomingObject(req.params.id,metaArray);
	    if (!reqObject){
		res.json({message:"Submission not valid"});
	    }
	    else{
		isMember(req,reqObject.group,function(tf, groupProper){
		    //var desc=cleanStringPred(incoming.prediction);
		    var desc=reqObject.prediction;
		    var verbose=reqObject.verbose;
		    var end=new Date(reqObject.end);
		    var answersSplit=reqObject.answers.split(';');
		    var answers=[];
		    var outcomes=[];
		    var i;
		    for (i=0;i< answersSplit.length;i++){
			answers.push(answersSplit[i]);
			outcomes.push({
			    answer: answersSplit[i],
			    outcome: -1,
			    decider: makeLower(req.user.local.username),
			    decideDate: new Date(),
			    decideVerbose: ""
			});
		    }
		    var headline=[];
		    for (i=0;i<answers.length;i++){
			headline[i]=-1;
		    }
		    var source=reqObject.source;
		    var group=makeLower(reqObject.group);
		    var ldesc=makeLower(desc);
		    var dateMin=new Date();
		    var dateMax = new Date();

		    var newYear=dateMin.getFullYear()+50;
		    var open=true;
		    var anon=false;
		    dateMax.setFullYear(newYear);
		    if (end>dateMin&&end<dateMax){
		    }
		    else{
			end=dateMax;
		    }
		    if (desc&&group&&tf){
			var prediction={"ldesc":ldesc,
					"score":0,
					"group": group,
					"groupProper":groupProper,
					"desc":desc,
					"author":req.user.local.username,
					"lauthor":makeLower(req.user.local.username),
					"start":new Date(),
					"end":end,
					"min":0,
					"max":1,
					"scale":0.01,
					"complete":false,
					"users":[makeLower(req.user.local.username)],
					"source":source,
					"data":[],
					"outcomes":outcomes,
					"answers":answers,
					"headline":headline,
					"verbose":verbose,
					"textOnly":false,
					"open":open,
					"anon":anon};
			var findObject={'ldesc':prediction.ldesc, 'group':prediction.group};
			if (prediction.group==="personal"){
			    findObject.author=req.user.local.username;
			}
			if (makeLower(prediction.group)==='personal'){
			    findObject.author=req.user.local.username;
			}
			PredictSerie.findOne(findObject,function(err, idw) {
			    if (err){
				res.send({message: "oops"});
			    }
			    else if (idw){
				res.send({message: "already exists"});
			    }
			    else {
				var predictReceive = new PredictSerie(prediction);
				predictReceive.save(function (err, predictReceive) {
				    if (err) {
					res.send({message:"something went wrong"});
				    }
				    else {
					var voteRequestPartial={"up":1,
								"group":prediction.group,
								"prediction":prediction.ldesc};
					req.params.id=JSON.stringify(voteRequestPartial);
					voteFunction(req,findObject.group,findObject.ldesc,1);
					res.send({success:true,predictionLower:prediction.ldesc,groupLower:prediction.group});
					var userFind={};
					userFind['local.username']=makeLower(req.user.local.username);
					
					User.findOneAndUpdate(userFind,
							      {$addToSet: {
								  "groups":prediction.group,
								  "predictions":prediction.group+"&"+prediction.ldesc,
								  "predictionsAdmin":prediction.group+"&"+prediction.ldesc,
								  "groupsProper":groupProper,
								  "predictionsProper":prediction.group+"&"+prediction.desc,
								  "predictionsAdminProper":prediction.group+"&"+prediction.desc
							      }},
							      {safe: true, upsert: true},
							      function(err0, result0) {
							      }
							     );
				    }
				});
			    }
			});
		    }
		    else{
			res.send({message:"incomplete"});
		    }
		});
	    }
	}
    });

    app.get('/newgroupsend/:id',function(req,res){
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    logger.debug("start");
	    var metaArray=[
		"verbose",
		"group",
		"open"
	    ];
	    console.log("PARAMS: "+req.params.id);
	    var reqObject=stripIncomingObject(req.params.id,metaArray);
	    console.log("obj: "+JSON.stringify(reqObject));
	    if (!reqObject){
		res.json({message:"Data not valid"});
	    }
	    else{
		console.log("doing this...");
		//incoming=stripIncoming(req.params.id,keyArray);
		getGroupsLower(function(groupList){
		    //var group=cleanString(incoming.group);
		    var group=reqObject.group;
		    var open=reqObject.open;
		    var verbose=reqObject.verbose;
		    var lName=makeLower(group);
		    var createdDate=new Date();
		    logger.debug("now");
		    if (group&&groupList.indexOf(lName)===-1){
			logger.debug("and");
			var groupObj={};
			groupObj.name=group;
			groupObj.score=0;
			groupObj.lName=lName;
			groupObj.open=open;
			groupObj.admins=[makeLower(req.user.local.username)];
			groupObj.members=[makeLower(req.user.local.username)];
			groupObj.verbose=verbose;
			groupObj.created=createdDate;
			var groupReceive = new GroupSerie(groupObj);
			groupReceive.save(function (err, groupReceive) {
			    if (err) {
				logger.debug("bad");
				res.send({message:"went wrong"});
			    }
			    else {
				logger.debug("good");
				res.send({success:true,groupLower:groupObj.lName});
				var userFind={};
				userFind['local.username']=makeLower(req.user.local.username);
				
				User.findOneAndUpdate(userFind,
						      {$addToSet: {"admins": lName,"groups":lName,"adminsProper":groupReceive.name,"groupsProper":groupReceive.name}},
						      {safe: true, upsert: true},
						      function(err0, result0) {
						      }
						     );
			    }
			});
		    }
		    else{
			res.json({message:"already exists"});
		    }
		});
	    }
	}
    });

    app.get('/predictData/:id', function(req,res) {
	logger.debug("incoming predictionr request");
	var metaArray=[
	    "prediction",
	    "group"
	];
	var reqObject=stripIncomingObject(req.params.id, metaArray);
	if (!reqObject){
	    res.json({});
	}
	else {
	    var findObject={'ldesc':makeLower(reqObject.prediction)};
	    findObject.group=makeLower(reqObject.group);
	    var nameCheck;
	    var adminCheck;
	    if (req.user){
		nameCheck=req.user.local.username;
		adminCheck=req.user.local.admin;
	    }
	    if (findObject.group==='personal'){
		findObject.author=nameCheck;
	    }
	    isMember(req,findObject.group,function(tf, groupProper){
		if (tf){
		    PredictSerie.findOne(findObject,function(err, idw) {
			if (err){
			    res.send(err);
			}
			else {
			    logger.debug("sending: "+JSON.stringify(idw));
			    res.json(idw);
			}
		    });
		}
		else {
		    res.json({});
		}
	    });
	}
    });

    app.get('/commentData/:id', function(req,res) {
	var metaArray=[
	    "prediction",
	    "group"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    var findObject={'ldesc':makeLower(reqObject.prediction)};
	    findObject.group=makeLower(reqObject.group);
	    var nameCheck;
	    var adminCheck;
	    if (req.user){
		nameCheck=req.user.local.username;
		adminCheck=req.user.local.admin;
	    }
	    if (findObject.group==='personal'){
		findObject.author=nameCheck;
	    }
	    isMember(req,findObject.group,function(tf, groupProper){
		if (tf){
		    PredictSerie.findOne(findObject,function(err, idw) {
			if (err){
			    res.send(err);
			}
			res.json(idw.comment);
		    });
		}
		else {
		    res.json({});
		}
	    });
	}
    });

    app.get('/getvote/:id', function(req,res) {
	logger.debug("getting vote");
	if (req.user){
	    var metaArray=[
		"prediction",
		"group"
	    ];
	    var reqObject=stripIncomingObject(req.params.id,metaArray);
	    if (!reqObject){
		res.json({});
	    }
	    else{
		var findObject={};
		findObject.ldesc=makeLower(reqObject.prediction);
		findObject.group=makeLower(reqObject.group);
		findObject['vote.name']=req.user.local.username;
		if (findObject.group==="personal"){
		    findObject.lauthor=makeLower(req.user.local.username);	    
		}
		PredictSerie.findOne(findObject,function(err, idw) {
		    logger.debug("found vote: "+JSON.stringify(idw));
		    if (err||!idw){
			res.json({outcome:0});
		    }
		    else {
			var vote=idw.vote[0].outcome;
			if (err){
			    res.send(err);
			}
			res.json({outcome:vote});
		    }
		});
	    }
	}
	else {
	    res.json({outcome:0});
	}
    });

    app.get('/declareAnswer/:id', function(req,res) {
	var metaArray=[
	    "prediction",
	    "group",
	    "answer",
	    "outcome"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	var answerDeclared=reqObject.answer;
	if (!reqObject){
	    res.json({});
	}
	else{
	    var prediction=makeLower(reqObject.prediction);
	    var findObject={'ldesc':prediction};
	    var group=makeLower(reqObject.group);
	    findObject.group=group;
	    var nameCheck;
	    var adminCheck;
	    if (req.user){
		nameCheck=req.user.local.username;
		adminCheck=req.user.local.admin;
	    }
	    if (makeLower(group)==='personal'){
		findObject.author=nameCheck;
	    }
	    predictionPermission(req,group,prediction,function(tf){
		if (tf){
		    PredictSerie.findOne(findObject, function(err, foundPrediction) {
			var outcomes = foundPrediction.outcomes;
			var answersAvailable=[];
			var outcome;
			var i;
			// get array of answers which have been declared

			for (i=0;i<outcomes.length;i++){
			    answersAvailable.push(outcomes[i].answer);
			}
			var answerMatch=answersAvailable.indexOf(answerDeclared);
			//outcome base determines whether or not the new outcome is the same as the old one. if it is nothing is done
			var outcomebase=-1;
			// if an outcome has already been declared for this answer, remove it
			if (answerMatch>-1){
			    outcomebase=foundPrediction.outcomes[answerMatch].outcome;
			    foundPrediction.outcomes.splice(answerMatch,1);
			}
			//create the new/replacement outcome
			var newOutcome={answer:answerDeclared,decider:nameCheck,decideDate:new Date(),decideVerbose:""};

			//ensure outcome from client is only 1,0 or -1. One is true, 0 false, -1 open
			if (reqObject.outcome===1){
			    newOutcome.outcome=1;
			}
			else if (reqObject.outcome===0){
			    newOutcome.outcome=0;
			}
			else {
			    newOutcome.outcome=-1;
			}
			// if no change in outcome, do nothing
			if (outcomebase===newOutcome.outcome){
			    res.json({});
			}
			else {
			    foundPrediction.outcomes.push(newOutcome);
			    var complete=true;
			    for (i=0;i<outcomes.length;i++){
				//answersAvailable.push(outcomes[i].answer);
				if (outcomes[i].outcome===-1){
				    complete=false;
				}
			    }
			    if (foundPrediction.answers.length!==outcomes.length){
				complete=false;
			    }
			    foundPrediction.complete=complete;
			    foundPrediction.save(function(err){
				res.json({});			
			    });
			    var affectedUsers=[];

			    for (i=0;i<foundPrediction.data.length;i++){
				if (affectedUsers.indexOf(foundPrediction.data[i].name)===-1&&foundPrediction.data[i].answer===answerDeclared){
				    affectedUsers.push(foundPrediction.data[i].name);
				}
			    }
			    var useData=foundPrediction.data;
			    var xCandidate;
			    var yCandidate;
			    var nameCandidate;
			    var entry;
			    var toAdd;
			    var toAddName;
			    var useAnswer=answerDeclared;
			    var predictionData={};
			    var allX=[];
			    var allY=[];
			    var allForMean=[];
			    for (entry=0;entry<useData.length;entry++) {
				xCandidate=new Date(useData[entry].date);
				yCandidate=useData[entry].val;
				nameCandidate=useData[entry].name;
				if (useData[entry].answer===useAnswer) {
				    toAdd=[yCandidate,xCandidate];
				    toAddName=[yCandidate,xCandidate,nameCandidate];
				    if (predictionData[useData[entry].name]){
					predictionData[useData[entry].name].push(toAdd);
				    }
				    else {
					predictionData[useData[entry].name]=[toAdd];
				    }
				    allX.push(xCandidate);
				    allY.push(yCandidate);
				    allForMean.push(toAddName);
				}
			    }

			    allForMean = allForMean.sort(Comparator);
			    var startDate=allForMean[0][1];
			    for (entry in predictionData){
				predictionData[entry].sort(Comparator);
			    }

			    var finishDate=new Date();
			    var scoreObject={};
			    var meanScore;
			    var rejectedCandidate;

			    var nextDate, differenceDate;
			    for (var userName in predictionData){
				//calculate base, without this user.

				var meanInputObject={};
				var meanData=[];
				for (entry=0;entry<allForMean.length;entry++){
				    if (allForMean[entry][2]!==userName){
					meanInputObject[allForMean[entry][2]]=allForMean[entry][0];
					var useDate=new Date(allForMean[entry][1]);
					var meanTotal=0;
					var meanCount=0;
					for (var useName in meanInputObject){
					    meanCount++;
					    meanTotal+=meanInputObject[useName];
					}
					var mean=meanTotal/meanCount;
					if (allForMean[entry][1]>predictionData[userName][0][1]){
					    meanData.push([mean,useDate,meanTotal,meanCount]);
					}
					//store newest which is not kept
					else {
					    rejectedCandidate=[mean,useDate,meanTotal,meanCount];
					}
				    }

				}
				//need to add a first point for mean. If they started before this user, the first point is the oldest which was not included
				// if they started after the user the first point is 0.5 when they started
				var firstPoint;
				if (meanData[0]){
				    //if mean data exists, is must start before or after the user in question. If other forecasters started after this user:
				    if (meanData[0][1]>predictionData[userName][0][1]){
					firstPoint=[0.5,predictionData[userName][0][1],0.5,1];
				    }
				    //if they started before this user
				    else {
					firstPoint=rejectedCandidate;
					firstPoint[1]=predictionData[userName][0][1];
				    }
				}
				else {
				    if (allForMean[0][1]<predictionData[userName][0][1]){
					//if data from before, then there will be a rejected candidate
					firstPoint=rejectedCandidate;
					firstPoint[1]=predictionData[userName][0][1];
				    }
				    else {
					//if there is no other data, add a prediction of 0.5 at start.
					firstPoint=[0.5,predictionData[userName][0][1],0.5,1];
				    }
				}
				meanData.unshift(firstPoint);

				var totalWeight=0;
				for (i=0;i<predictionData[userName].length;i++){
				    if (i<predictionData[userName].length-1){
					nextDate=predictionData[userName][i+1][1];
				    }
				    else{
					nextDate=finishDate;
				    }
				    differenceDate=nextDate-predictionData[userName][i][1];
				    totalWeight=totalWeight+differenceDate*predictionData[userName][i][0];
				}
				var userScore=totalWeight/(finishDate-predictionData[userName][0][1]);

				var totalMeanWeight=0;
				for (i=0;i<meanData.length;i++){
				    if (i<meanData.length-1){
					nextDate=meanData[i+1][1];
				    }
				    else{
					nextDate=finishDate;
				    }
				    differenceDate=nextDate-meanData[i][1];
				    totalMeanWeight=totalMeanWeight+differenceDate*meanData[i][0];
				}
				meanScore=totalMeanWeight/(finishDate-meanData[0][1]);
				//calculate average of the user, and the mean for everyone else
				//calculate the score. This is the difference between your score, the score of everyone else but you, weighted by for how long you were involved in the forecast. Times 100.
				scoreObject[userName]=(userScore-meanScore)*(finishDate-predictionData[userName][0][1])/(finishDate-startDate)*100;
				//adjust to -1 if the answer is false
				if (newOutcome.outcome===0){
				    scoreObject[userName]=scoreObject[userName]*-1;
				}
			    }

			    var userFind={};
			    userFind['local.username']={"$in":affectedUsers};

			    var outcomeToPush;

			    if (newOutcome.outcome===1){
				outcomeToPush=true;
			    }
			    else if (newOutcome.outcome===0){
				outcomeToPush=false;
			    }
			    var updateObject={$pull:{
				"outcomes":{
				    "answer":answerDeclared,
				    "group":findObject.group
				}
			    }};
			    User.update(userFind,
					updateObject,
					{multi: true},
					function(errors,results){
					    User.find(userFind,"score outcomes local",{multi: true}).stream()
						.on("data",function(doc){
						    var scoreToUse=0;
						    for (i=0;i<doc.outcomes.length;i++){
							scoreToUse=scoreToUse+doc.outcomes[i].score;
						    }
						    scoreToUse=scoreToUse+scoreObject[doc.local.username];

						    var newUpdate={
							"answer":answerDeclared,
							"prediction":findObject.ldesc,
							"group":findObject.group,
							"outcome":outcomeToPush,
							"date": new Date(),
							"score": scoreObject[doc.local.username]
						    };
						    doc.score=scoreToUse;
						    doc.outcomes.push(newUpdate);
						    doc.save(function(err, saveres){
						    });
						});
					});
			}
		    });
		}
		else {
		    res.json({});
		}
	    });
	}
    });

    app.get('/deleteGroup/:id',function(req,res) {
	var metaArray=[
	    "group"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    var group=makeLower(reqObject.group);
	    isAdmin(req,group,function(tf,groupProper){
		if (makeLower(group)==='personal'){
		    tf=false;
		}
		if (tf) {
		    var findObject={};
		    findObject.group=group;
		    PredictSerie.find(findObject,
				      function(err0,idwa0){
					  var affectedUsers=[];
					  var i,j,candidate;
					  for (i=0;i<idwa0.length;i++){
					      for (j=0;j<idwa0[i].users.length;j++){
						  candidate=affectedUsers.push(idwa0[i].users[j]);
						  if (affectedUsers.indexOf(candidate)===-1) {
						      affectedUsers.push(candidate);
						  }
					      }
					  }
					  PredictSerie.find(findObject).remove(function(err1,idwa1){
					      var groupFindObject={};
					      groupFindObject.lName=group;
					      GroupSerie.findOne(groupFindObject).remove(function(err,idwa){
						  res.json({success:true});
						  var userFind={};
						  userFind['local.username']={"$in":affectedUsers};
						  var updateObject={$pull:{
						      "predictions":{$regex:findObject.group+"&.*"},
						      "predictionsAdmin":{$regex:findObject.group+"&.*"},
						      "groups":findObject.group,
						      "admins":findObject.group,
						      "outcomes":{group:findObject.group},
						      "predictionsProper":{$regex:findObject.group+"&.*"},
						      "predictionsAdminProper":{$regex:findObject.group+"&.*"},
						      "groupsProper":groupProper,
						      "adminsProper":groupProper
						  }};
						  User.update(userFind,
							      updateObject,
							      {multi: true},
							      function(errors,results){
								  User.find(userFind,"score outcomes local",{multi: true}).stream()
								      .on("data",function(doc){
									  var scoreToUse=0;
									  for (i=0;i<doc.outcomes.length;i++){
									      scoreToUse=scoreToUse+doc.outcomes[i].score;
									  }
									  //scoreToUse=scoreToUse+scoreObject[doc.local.username];

									  /*var newUpdate={
									      "answer":reqObject.answer.name,
									      "prediction":findObject.ldesc,
									      "group":findObject.group,
									      "outcome":outcomeToPush,
									      "date": new Date(),
									      "score": scoreObject[doc.local.username]
									  };*/
									  doc.score=scoreToUse;
									  //doc.outcomes.push(newUpdate);
									  doc.save(function(err, saveres){
									  });
								      });
							      });
					      });
					  });
				      });
		}
		else {
		    res.json({success:false});
		}
	    });
	}
    });

    app.get('/sendComment/:id',function(req,res){
	var metaArray=[
	    "comment",
	    "group",
	    "prediction"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({message:"Comment not valid"});
	}
	else{
	    var group=makeLower(reqObject.group);
	    var comment=reqObject.comment;
	    var prediction=makeLower(reqObject.prediction);
	    if (req.isAuthenticated()===false){
		res.redirect('/signup');
	    }
	    else{
		var findObject={};
		findObject.group=group;
		findObject.ldesc=makeLower(prediction);
		if (makeLower(group)==='personal'){
		    findObject.author=req.user.local.username;
		}
		isMember(req,group,function(tf, groupProper){
		    if (tf){
			PredictSerie.findOne(findObject,function(err,idwa){
			    if (idwa) {
				var commentSend={};
				commentSend.name=req.user.local.username;
				commentSend.text=reqObject.comment;
				commentSend.date=new Date();
				commentSend.score=0;
				PredictSerie.findOneAndUpdate(findObject,
							      {$push: {"comment": commentSend}},
							      {safe: true, upsert: true},
							      function(err, result) {
								  res.json({success:true});
							      }
							     );
			    }
			    else {
				res.json({});
			    }
			});
		    }
		    else {
			res.json({});
		    }
		});
	    }
	}
    });

    app.get('/deleteComment/:id',function(req,res){
	//var reqObject={};
	//var keyArray=['commentID','group','prediction'];
	//reqObject=stripIncoming(req.params.id,keyArray);
	/*var metaArray=[
	    {
		"name": "commentID",
		"len": 5000,
		"chars": "special",
		"required":true
	    },		{
		"name": "group",
		"len": 1000,
		"chars": "special",
		"required":true
	    },
	    {
		"name": "prediction",
		"len": 1000,
		"chars": "special",
		"required":true
	    }
	    ];*/
	var metaArray=[
	    "commentID",
	    "group",
	    "prediction"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{

	    var group=makeLower(reqObject.group);
	    var commentID=reqObject.commentID;
	    var prediction=reqObject.prediction;
	    if (req.isAuthenticated()===false){
		res.redirect('/signup');
	    }
	    else{
		var findObject={};
		findObject.group=group;
		findObject.ldesc=makeLower(prediction);
		if (makeLower(group)==='personal'){
		    findObject.author=req.user.local.username;
		}
		isAdmin(req,group,function(tf){
		    if (tf){
			PredictSerie.findOne(findObject,function(err,idwa){
			    if (idwa) {
				var commentSend={};
				commentSend._id=commentID;
				PredictSerie.findOneAndUpdate(findObject,
							      {$pull: {"comment": commentSend}},
							      {safe: true, upsert: true},
							      function(err, result) {
								  res.json({});
							      }
							     );
			    }
			    else {
				res.json({});
			    }
			});
		    }
		    else {
			res.json({});
		    }

		});
	    }
	}
    });

    app.get('/sendUpdate/:id',function(req,res){
	var metaArray=[
	    "comment",
	    "group",
	    "prediction"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({message:"Data not valid"});
	}
	else{
	    var group=makeLower(reqObject.group);
	    var comment=reqObject.comment;
	    var prediction=reqObject.prediction;
	    if (req.isAuthenticated()===false){
		res.redirect('/signup');
	    }
	    else{
		var findObject={};
		findObject.group=group;
		findObject.ldesc=makeLower(prediction);
		if (makeLower(group)==='personal'){
		    findObject.author=req.user.local.username;
		}
		predictionPermission(req,group,findObject.ldesc,function(tf){
		    if (tf){
			PredictSerie.findOne(findObject,function(err,idwa){
			    if (idwa) {
				var updateSend={};
				updateSend.name=req.user.local.username;
				updateSend.text=reqObject.comment;
				updateSend.date=new Date();
				PredictSerie.findOneAndUpdate(findObject,
							      {$push: {"verboseUpdate": updateSend}},
							      {safe: true, upsert: true},
							      function(err, result) {
								  res.json({success:true});
							      }
							     );
			    }
			    else {
				res.json({});
			    }
			});
		    }
		    else {
			res.json({});
		    }

		});
	    }
	}
    });
    
    app.get('/vote/:id',function(req,res){
	if (req.isAuthenticated()===false){
	    res.json({});
	}
	else {
	    var metaArray=[
		"up",
		"group",
		"prediction"
	    ];
	    var reqObject=stripIncomingObject(req.params.id,metaArray);
	    logger.debug("voting with: "+JSON.stringify(reqObject));
	    if (!reqObject){
		res.json({});
	    }
	    else {
		res.json({});
		var group=reqObject.group;
		var prediction=reqObject.prediction;
		var up=reqObject.up;
		voteFunction(req,group,prediction,up);	    }
	}
    });

    app.get('/deleteGraph/:id', function(req,res) {
	//var incObject={};
	//var keyArray=['desc','group'];
	//incObject=stripIncoming(req.params.id,keyArray);

	/*var metaArray=[
	    {
		"name": "prediction",
		"len": 5000,
		"chars": "special",
		"required":true
	    },		{
		"name": "group",
		"len": 1000,
		"chars": "special",
		"required":true
	    }
	    ];*/
	var metaArray=[
	    "prediction",
	    "group"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	if (!reqObject){
	    res.json({});
	}
	else{
	    var findObject={};
	    if (makeLower(reqObject.group)==="personal"){
		findObject.author=req.user.local.username;	    
	    }
	    findObject.ldesc=makeLower(reqObject.prediction);
	    findObject.group=makeLower(reqObject.group);
	    predictionPermission(req,findObject.group,findObject.ldesc,function(tf){
		if (tf){
		    PredictSerie.findOne(findObject,
					 function(error,inc){
					     PredictSerie.findOne(findObject).remove(function(err, idw) {
						 if (err){
						     res.send(err);
						 }
						 res.send({'a':1});
						 var userFind={};
						 userFind['local.username']={"$in":inc.users};
						 var updateObject={$pull:{
						     "predictions":{$regex:findObject.group+"&"+findObject.ldesc},
						     "predictionsAdmin":{$regex:findObject.group+"&"+findObject.ldesc},
						     "predictionsProper":{$regex:findObject.group+"&"+inc.desc},
						     "predictionsAdminProper":{$regex:findObject.group+"&"+inc.desc},
						     "outcomes":{group:findObject.group,prediction:findObject.ldesc}
						 }};
						 var i;
						 User.update(userFind,
							     updateObject,
							     {multi: true},
							     function(errors,results){
								 User.find(userFind,"score outcomes local",{multi: true}).stream()
								     .on("data",function(doc){
									 var scoreToUse=0;
									 for (i=0;i<doc.outcomes.length;i++){
									     scoreToUse=scoreToUse+doc.outcomes[i].score;
									 }
									 //scoreToUse=scoreToUse+scoreObject[doc.local.username];

									 /*var newUpdate={
									     "answer":reqObject.answer.name,
									     "prediction":findObject.ldesc,
									     "group":findObject.group,
									     "outcome":outcomeToPush,
									     "date": new Date(),
									     "score": scoreObject[doc.local.username]
									 };*/
									 doc.score=scoreToUse;
									 //doc.outcomes.push(newUpdate);
									 doc.save(function(err, saveres){
									 });
								     });

							     });
					     });
					 });
		}
		else{
		}
	    });
	}
    });
    
    //    app.get('/predictionabout/:id',function(req,res){
    app.get('/group/:group/:prediction/about/',function(req,res){
	var group=makeLower(req.params.group);
	var prediction=makeLower(req.params.prediction);
	isMember(req,group,function(tf, groupProper){
	    if (tf){
		var findObject={"ldesc":makeLower(prediction),"group":makeLower(group)};
		if (makeLower(group)==='personal'){
		    findObject.author=req.user.local.username;
		}
		PredictSerie.findOne(findObject,"desc ldesc complete verbose verboseUpdate answers outcomes groupProper",function(err,idwa){
		    if (!idwa){
			res.render('404', { url: req.url });
		    }
		    else {
			var renderHeader={};
			renderHeader.group=group;
			renderHeader.groupProper=idwa.groupProper;
			renderHeader.message="";
			renderHeader.prediction=idwa.ldesc;
			renderHeader.answers=idwa.answers;
			renderHeader.outcomes=idwa.outcomes;
			renderHeader.predictionProper=idwa.desc;
			renderHeader.verboseAbout=idwa.verbose;
    			renderHeader.complete=idwa.complete;
			renderHeader.verboseUpdateAbout=idwa.verboseUpdate;
			renderJade(req,res,'predictionabout',renderHeader);
		    }
		});
	    }
	    else {
		res.redirect('/predict');
	    }
	});
    });

    app.get('/deleteUser/:id',function(req,res){
	var test;
	/*var metaArray=[
	    {
		"name": "user",
		"len": 5000,
		"chars": "special",
		"required":true
	    }
	    ];*/
	var metaArray=[
	    "user"
	];
	var reqObject=stripIncomingObject(req.params.id,metaArray);
	logger.debug("stripped to: "+JSON.stringify(reqObject));
	if (!reqObject){
	    res.json({});
	}
	else{
	    test=reqObject.user;
	    //var group;
	    isAdminMaster(req,function(tf){
		if(tf&&test!=="admin"){
		    var findObject={};
		    findObject['local.username']=test;
		    User.findOne(findObject).remove(function(err, idw) {
			res.json({success:1});
		    });
		}
		else{
		    res.json({message:"error"});
		}
	    });
	}
    });

    app.get('/newpredict/:id', function(req, res) {
	var test;
	test=stripIncomingString(req.params.id);
	if (req.isAuthenticated()===false){
	    res.redirect('/signup');
	}
	else {
	    var message="";
	    isMember(req,test,function(tf, groupProper){
		if (tf){
		    var message;
		    var group=test;
		    var renderHeader={};
		    renderHeader.group=test;
		    renderHeader.message="";
		    renderJade(req,res,'newpredict',renderHeader);
		}
		else {
		    res.redirect('/predict');
		}
	    });
	}
    });

    app.get('/users/:id',function(req,res){
	var user = stripIncomingString(req.params.id);
	var renderHeader={};
	var findObject={};
	findObject['local.username']=makeLower(user);
	User.findOne(findObject,"groups groupsProper admins adminsProper predictions predictionsProper predictionsAdmin predictionsAdminProper score groupScores",function(err,idw){
	    if (idw){
		//renderHeader.userDescription=idw;
		renderHeader.userDescription={};
		renderHeader.userDescription.score=idw.score;
		renderHeader.userDescription.name=makeLower(user);
		renderHeader.message="";
		renderHeader.group="";
		var i;
		var groupAccess={};
		var groupName;
		var groupsFind={};
		var myGroups=[];
		if (req.user){
		    myGroups=req.user.groups;
		}
		groupsFind.lName={"$in":idw.groups};
		GroupSerie.find(groupsFind,function(err,idwa){
		    for (i=0;i<idwa.length;i++){
			if (idwa[i].lName==="personal"){
			    groupAccess[idwa[i].lName]=false;
			}
			else{
			    if (idwa[i].open===true){
				groupAccess[idwa[i].lName]=true;
			    }
			    else if(myGroups.indexOf(idwa[i].lName)>-1) {
				groupAccess[idwa[i].lName]=true;			    
			    }
			}
		    }
		    renderHeader.userDescription.groups=[];
		    renderHeader.userDescription.admins=[];
		    renderHeader.userDescription.predictions=[];
		    renderHeader.userDescription.predictionsAdmin=[];
		    renderHeader.userDescription.groupsProper=[];
		    renderHeader.userDescription.adminsProper=[];
		    renderHeader.userDescription.predictionsProper=[];
		    renderHeader.userDescription.predictionsAdminProper=[];
		    for (i=0;i<idw.groups.length;i++){
			if (groupAccess[idw.groups[i]]===true){
			    renderHeader.userDescription.groups.push(idw.groups[i]);
			    renderHeader.userDescription.groupsProper.push(idw.groupsProper[i]);
			}
		    }
		    for (i=0;i<idw.admins.length;i++){
			if (groupAccess[idw.admins[i]]===true){
			    renderHeader.userDescription.admins.push(idw.admins[i]);
			    renderHeader.userDescription.adminsProper.push(idw.adminsProper[i]);
			}
		    }
		    var addReg, addProp;
		    for (i=0;i<idw.predictions.length;i++){
			if (groupAccess[idw.predictions[i].split('&')[0]]===true){
			    addReg=idw.predictions[i].split('&')[0]+"/"+idw.predictions[i].split('&')[1];
			    addProp=idw.predictionsProper[i].split('&')[0]+"/"+idw.predictionsProper[i].split('&')[1];
			    renderHeader.userDescription.predictions.push(addReg);
			    renderHeader.userDescription.predictionsProper.push(addProp);
			}
		    }
		    for (i=0;i<idw.predictionsAdmin.length;i++){
			if (groupAccess[idw.predictionsAdmin[i].split('&')[0]]===true){
			    addReg=idw.predictionsAdmin[i].split('&')[0]+"/"+idw.predictionsAdmin[i].split('&')[1];
			    addProp=idw.predictionsAdminProper[i].split('&')[0]+"/"+idw.predictionsAdminProper[i].split('&')[1];
			    renderHeader.userDescription.predictionsAdmin.push(addReg);
			    renderHeader.userDescription.predictionsAdminProper.push(addProp);
			}
		    }
		    renderJade(req,res,'user',renderHeader);
		});
	    }
	    else {
		res.render('404', { url: req.url });
	    }
	});
    });

    app.get('/profile', isLoggedIn, function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	renderHeader.group="";
	console.log("got here"+isLoggedIn);
	renderJade(req,res,'profile',renderHeader);
    });

    app.get('/group/:group/:prediction', function(req, res) {
	var group,prediction;
	group=makeLower(req.params.group);
	prediction=makeLower(req.params.prediction);
	var predictFindObject={ldesc:prediction,group:group};
	if (group==="personal"){
	    predictFindObject.author=req.user.local.username;
	}
	isMember(req,group,function(tf, groupProper){
	    if (tf) {
		GroupSerie.findOne({"lName":group},function(err,idwa){
		    PredictSerie.findOne(predictFindObject,function(err2,idwa2){
			if (!idwa2){
			    res.render('404', { url: req.url });
			}
			else {
			    var message;
			    var renderHeader={};
			    renderHeader.group=idwa.name;
			    renderHeader.groupLower=makeLower(idwa.name);
			    renderHeader.message="";
			    renderHeader.prediction=prediction;
			    renderHeader.predictionProper=idwa2.desc;
			    renderJade(req,res,'prediction',renderHeader);
			}
		    });
		});
	    }
	    else {
		res.redirect('/predict');
	    }
	});
    });
    
    //this is groupabout rather than group/about (like predictions), as otherwise you couldn't have a prediction called about
    app.get('/groupabout/:group', function(req, res) {
	var test;
	test=stripIncomingString(req.params.group);
	isMember(req,test,function(tf,groupProper){
	    if (tf) {
		var message;
		var group=test;
		var renderHeader={};
		renderHeader.group=test;
		renderHeader.message="";
		renderJade(req,res,'groupabout',renderHeader);
	    }
	    else {
		res.redirect('/predict');
	    }
	});
    });

    app.get('/nopermission/:group', function(req,res) {
	var test;
	test=stripIncomingString(req.params.group);
	if (test==="personal"){
	    res.redirect('/signup');
	}
	else{
	    isMember(req,test,function(tf, groupProper){
		if (tf){
		    res.redirect('/group/'+test);
		}
		else {
		    var message;
		    var group=test;
		    var renderHeader={};
		    renderHeader.group=test;
		    renderHeader.message="";
		    renderJade(req,res,'nopermission',renderHeader);
		}
	    });
	}
    });
};

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    console.log("is logged in start");
    if (req.isAuthenticated()){
	console.log("a");
        return next();
    }
    console.log("c");
    // if they aren't redirect them to the signup page
    res.redirect('/signup');
    console.log("d");
}
function isLoggedOut(req, res, next) {
    // if user is authenticated in the session, redirect to profile 
    if (req.isAuthenticated()){
	res.redirect('/profile');
    }
    // if they aren't carry on
    return next();
}

function makeLower(raw){
    var response;
    response=raw.toLowerCase().replace(regexObject.makeLower, "");
    return response;
}
