/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

myApp.directive('ngConfirmClick', [
    function(){
	return {
	    link: function(scope,element,attr){
		var msg=attr.ngConfirmClick || "Are you sure?";
		var clickAction=attr.confirmedClick;
		element.bind('click',function(event){
		    if(window.confirm(msg)){
			scope.$eval(clickAction);
		    }
		});
	    }
	};
    }]);

myApp.controller('mainController',['$rootScope','$scope', '$http','$window', function($rootScope,$scope, $http,$window){
    "use strict";
    $scope.master={};
    $scope.currentGroup=localData;
    $scope.currentArray=localArra;
    $scope.members=members;
    $scope.admins=admins;
    var userName=myName;
    $scope.aboutAnswers=[];
    if (typeof outcomes !=="undefined"){
	var outcomestemp={};
	var i;
	for (i =0;i<outcomes.length;i++){
	    if (outcomes[i].outcome===1){
		outcomestemp[outcomes[i].answer]="True!";
	    }
	    else if (outcomes[i].outcome===0){
		outcomestemp[outcomes[i].answer]="False!";
	    }
	    else {
		outcomestemp[outcomes[i].answer]="";
	    }
	}
	for (i=0;i<answers.length;i++){
	    $scope.aboutAnswers[i]={name:answers[i]};
	    if (outcomestemp[answers[i]]){
		$scope.aboutAnswers[i].value=outcomestemp[answers[i]];
	    }
	    else {
		$scope.aboutAnswers[i].value="";
	    }
	}
    }

    $scope.sendComment=function(){
	var toSendObject={};
	toSendObject.comment=$scope.commentInput;
	toSendObject.group=$scope.currentGroup;
	toSendObject.prediction=$scope.useGraphTitle;
	var toSendString=encodeURIComponent(JSON.stringify(toSendObject));
	$http.get('/sendComment/'+toSendString)
	    .success(function(inc){
		if (inc.success){
		    $scope.commentInput="";
		    var reqPredictionObject={};
		    reqPredictionObject.prediction=$scope.useGraphTitle;
		    reqPredictionObject.group=$scope.currentGroup;
		    var reqPredictionString=encodeURIComponent(JSON.stringify(reqPredictionObject));
		    $http.get('/commentData/'+reqPredictionString)
			.success(function(inc){
			    for (i=0;i<inc.length;i++){
				inc[i].date=new Date(inc[i].date).toDateString();
			    }
			    $scope.comments=inc;
			});
		}
		else {
		    $scope.feedback=inc.message;
		}

	    });
    };

    $scope.deleteComment=function(id){
	var toSendObject={};
	toSendObject.commentID=id;
	toSendObject.group=$scope.currentGroup;
	toSendObject.prediction=$scope.useGraphTitle;
	var toSendString=encodeURIComponent(JSON.stringify(toSendObject));
	$http.get('/deleteComment/'+toSendString)
	    .success(function(inc){
		var reqPredictionObject={};
		reqPredictionObject.prediction=$scope.useGraphTitle;
		reqPredictionObject.group=$scope.currentGroup;
		var reqPredictionString=encodeURIComponent(JSON.stringify(reqPredictionObject));
		$http.get('/commentData/'+reqPredictionString)
		    .success(function(inc){
			for (i=0;i<inc.length;i++){
			    inc[i].date=new Date(inc[i].date).toDateString();
			}
			$scope.comments=inc;
		    });
	    });
    };

    $scope.upvote=function(){
	var toSendObject={};
	toSendObject.up=1;
	toSendObject.group=$scope.currentGroup;
	toSendObject.prediction=$scope.useGraphTitle;
	var toSendString=encodeURIComponent(JSON.stringify(toSendObject));
	console.log("upvoting..."+toSendString);
	$http.get('/vote/'+toSendString)
	    .success(function(inc){
		console.log("upvote "+JSON.stringify(inc));
		if($scope.downvoteToggle===1){
		    $scope.score=$scope.score+2;
		}
		else {
		    $scope.score=$scope.score+1;
		}
		$scope.upvoteToggle=1;
		$scope.downvoteToggle=0;
	    });
    };

    $scope.removevote=function(){
	var toSendObject={};
	toSendObject.up=0;
	toSendObject.group=$scope.currentGroup;
	toSendObject.prediction=$scope.useGraphTitle;
	var toSendString=encodeURIComponent(JSON.stringify(toSendObject));
	console.log("no voting..."+toSendString);
	$http.get('/vote/'+toSendString)
	    .success(function(inc){
		console.log("novote "+JSON.stringify(inc));
		if ($scope.upvoteToggle===1){
		    $scope.score=$scope.score-1;
		}
		else {
		    $scope.score=$scope.score+1;
		}
		$scope.upvoteToggle=0;
		$scope.downvoteToggle=0;
	    });
    };

    $scope.downvote=function(){
	var toSendObject={};
	toSendObject.up=-1;
	toSendObject.group=$scope.currentGroup;
	toSendObject.prediction=$scope.useGraphTitle;
	var toSendString=encodeURIComponent(JSON.stringify(toSendObject));
	console.log("down voting..."+toSendString);
	$http.get('/vote/'+toSendString)
	    .success(function(inc){
		console.log("downvote: "+JSON.stringify(inc));
		if ($scope.upvoteToggle===1){
		    $scope.score=$scope.score-2;
		}
		else {
		    $scope.score=$scope.score-1;
		}
		$scope.upvoteToggle=0;
		$scope.downvoteToggle=1;
	    });
    };

    $scope.declareAnswer=function(declareAnswer,declareOutcome){
	var toSend={group:localData,prediction:predictionAbout,answer:declareAnswer,outcome:declareOutcome};
	var toSendString=encodeURIComponent(JSON.stringify(toSend));
	$http.get('/declareAnswer/'+toSendString)
	    .success(function(inc){
		location.reload();
	    });

    };

    $scope.deletePrediction=function(){
	var toDeleteObject={};
	toDeleteObject.prediction=predictionAbout;
	toDeleteObject.group=$scope.currentGroup;
	var toDelete=encodeURIComponent(JSON.stringify(toDeleteObject));
	$http.get('/deleteGraph/'+toDelete)
	    .success(function(inc){
		$window.location.href='/predict';
	    });
    };

    $scope.newPredict=function(){
	var sendObj={"group":$scope.currentGroup};
	var sendString=encodeURIComponent($scope.currentGroup);
	$window.location.href='/newpredict/'+sendString;
    };

    $scope.update=function(localPrediction){
	$scope.valueError=0;
	if (0<=localPrediction.val && localPrediction.val<=1 && typeof localPrediction.val==="number"){
	    $scope.master=angular.copy(localPrediction);
	    $scope.master.prediction=$scope.useGraphTitle;
	    $scope.master.group=$scope.currentGroup;
	    $scope.master.answer=$scope.selectedAnswer;
	    $http.get('/sub/'+encodeURIComponent(JSON.stringify($scope.master)))
		.success(function(inc){
		    console.log("update successful");
		    var toSend=$scope.useGraphTitle;
		    $scope.upvoteToggle=1;
		    $scope.downvoteToggle=0;
		    $scope.selectGraph(toSend,$scope.selectedAnswer);
		});
	}
	else {
	    $scope.valueError=1;
	}
    };

    angular.element($window).bind('resize',function(){
	console.log("resizing");
	$scope.drawGraph();
    });

    $scope.addColour=function(){
	var i,j;
	var colMin=50;
	var colMax=200;
	$scope.d3colours=[];
	for (i=0;i<10;i++) {
	    var colArr=[];
	    for(j=0;j<3;j++){
		colArr.push(colMin+Math.random()*(colMax-colMin));
	    }
	    $scope.d3colours.push(d3.rgb(colArr[0],colArr[1],colArr[2]));
	}
    };

    $scope.graphMeta={};

    $scope.selectGraphInit=function(key,answer){
	console.log("starting");
	$scope.selectGraph(key,answer);
	console.log("selected");
	var reqPredictionObject={};
	reqPredictionObject.prediction=$scope.useGraphTitle;
	reqPredictionObject.group=$scope.currentGroup;
	var reqPredictionString=encodeURIComponent(JSON.stringify(reqPredictionObject));
	$scope.getVote(reqPredictionString);
	console.log("here or whatev");
    };

    $scope.selectGraph=function(key,answer){
	console.log("graph start");
	$scope.commentInput="";
	$scope.useGraphTitle=predictionProper;
	var reqPredictionObject={};
	reqPredictionObject.prediction=$scope.useGraphTitle;
	reqPredictionObject.group=$scope.currentGroup;
	var reqPredictionString=encodeURIComponent(JSON.stringify(reqPredictionObject));
	$http.get('/predictData/'+reqPredictionString)
	    .success(function(inc){
		console.log("got data successfully"+JSON.stringify(inc.data));
		$scope.score=inc.score;
		$scope.predNameForLink=inc.ldesc;
		$scope.outcomes={};
		var i;
		for (i =0;i<inc.outcomes.length;i++){
		    $scope.outcomes[inc.outcomes[i].answer]=inc.outcomes[i].outcome;
		}
		$scope.answers=inc.answers;
		$scope.headline=inc.headline;
		for (i=0;i<inc.comment.length;i++){
		    inc.comment[i].date=new Date(inc.comment[i].date).toDateString();
		}
		$scope.comments=inc.comment;
		if (answer){
		    
		}
		else{
		    $scope.selectedAnswer=inc.answers[0];
		}
		$scope.graphMeta.author=inc.author;
		$scope.deleteShow=0;

		$scope.verbose=inc.verbose;
		$scope.verboseUpdate=inc.verboseUpdate;
		console.log("fail one");
		if (userName){
		    if (userName===$scope.graphMeta.author||userName==="admin") {
			$scope.deleteShow=1;
		    }
		}
		$scope.graphMeta.group=inc.group;
		if (inc.end){
		    $scope.graphMeta.end=new Date(inc.end).toDateString();
		}
		$scope.graphMeta.source=inc.source;
		$scope.localData=inc.data;
		var outcomeCandidate=$scope.outcomes[$scope.selectedAnswer];
		$scope.outcome="";
		$scope.allowPreds=0;
		if (outcomeCandidate===1){
		    $scope.outcome="True!";
		}
		else if (outcomeCandidate===0){
		    $scope.outcome="False!";
		}
		else {
		    $scope.allowPreds=1;
		}

		$scope.preDraw();
	    });
    };

    $scope.preDraw=function(){
	$scope.drawGraph();
    };
    
    $scope.upvoteToggle=0;
    $scope.downvoteToggle=0;
    $scope.getVote=function(string){
	console.log("vote getting");
	$http.get('/getVote/'+string)
	    .success(function(inc){
		console.log("got vote: "+JSON.stringify(inc));
		if (inc.outcome===1){
		    $scope.upvoteToggle=1;
		    $scope.downvoteToggle=0;
		}
		else if (inc.outcome===-1){
		    $scope.upvoteToggle=0;
		    $scope.downvoteToggle=1;
		}
		else {
		    $scope.downvoteToggle=0;
		    $scope.upvoteToggle=0;
		}
		console.log("upvote toggle: "+$scope.upvoteToggle);
		console.log("downvote toggle: "+$scope.downvoteToggle);
	    });
    };

    $scope.drawGraph=function(){
	$scope.headLineShowing="N/A";

	var headLineLocation=$scope.answers.indexOf($scope.selectedAnswer);
	if ($scope.headline[headLineLocation]>-1){
	    $scope.headLineShowing=$scope.headline[headLineLocation].toFixed(4)*100+"%";
	}
	
	console.log("draw called");
	$scope.addColour();
	//var w = 700;
	var w = Math.min.apply(null,[700,document.getElementById('main').clientWidth]);
	var h = w*(5/8);
	var objID;
	var svg;
	
	var xMin=0;
	var xMax=100;

	var margin={top:50,right:150,bottom:50,left:50},
	width=w-margin.left-margin.right,
	height=h-margin.top-margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x=d3.time.scale().range([0,width]);
	var y=d3.scale.linear().range([height, 0]);
	var name;
	var allX=[];
	var allY=[];
	var allForMean=[];
	var index=0;
	var i;
	var ind=$scope.useGraphTitle;
	var entry;
	var predictionData={};
	var toAdd;
	var toAddName;
	var useAnswer=$scope.selectedAnswer;
	var useData=$scope.localData;
	var xCandidate;
	var yCandidate;
	var nameCandidate;
	console.log("drawing");
	$scope.showGraph=0;
	for (entry in useData) {
	    console.log("point: "+JSON.stringify(useData[entry]));
	    xCandidate=new Date(useData[entry].date);
	    yCandidate=useData[entry].val;
	    nameCandidate=useData[entry].name;
	    if (useData[entry].answer===useAnswer) {
		$scope.showGraph=1;
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

	function Comparator(a,b){
	    if (a[1] < b[1]) return -1;
	    if (a[1] > b[1]) return 1;
	    return 0;
	}

	allForMean = allForMean.sort(Comparator);

	for (entry in predictionData){
	    predictionData[entry].sort(Comparator);
	}
	var meanInputObject={};
	var meanData=[];
	for (entry in allForMean){
	    meanInputObject[allForMean[entry][2]]=allForMean[entry[0]];
	    var useDate=new Date(allForMean[entry][1]);
	    var meanTotal=0;
	    var meanCount=0;
	    for (var useName in meanInputObject){
		meanCount++;
		meanTotal+=meanInputObject[useName][0];
	    }
	    var mean=meanTotal/meanCount;
	    meanData.push([mean,useDate]);
	}
	console.log("mean data is; "+meanData);
	var lowestDate = new Date(Math.min.apply(null,allX));
	var highestDate = new Date(Math.max.apply(null,allX));
	var dateMin=new Date(lowestDate.getFullYear() ,lowestDate.getMonth() ,lowestDate.getDate());
	var dateMax=new Date(highestDate.getFullYear(),highestDate.getMonth(),highestDate.getDate()+2);
	var xDomain=[dateMin,dateMax];
	var yDomain=[0,1];

	var xScale = d3.time.scale()
	    .domain(xDomain)
	    .range([margin.left, w-margin.right]);
	var yScale = d3.scale.linear()
	    .domain(yDomain)
	    .range([h-margin.bottom, margin.top]);

	var xAxis=d3.svg.axis().scale(xScale)
	    .orient("bottom").ticks(5);

	var yAxis=d3.svg.axis().scale(yScale)
	    .orient("left").ticks(5);

	var mousexVal=function(d) {
	    return xScale(new Date(d[1]));
	};
	var mouseyVal=function(d) {
	    return yScale(d[0]);
	};

	var line = d3.svg.line()
	    .x(function(d) {return xScale(new Date(d[1]));})
	    .y(function(d) {return yScale(d[0]);});

	var axisStyle={"fill": "none","stroke":"black","stroke-width": "1","shape-rendering": "crispEdges","font": "12px sans-serif"};
	objID="#d3Master";
	$(objID).empty();
	$('#canvasHold').html('<canvas width="'+w+'" height="'+h+'" style="display:none"></canvas>');
	svg = d3.select(objID)
	    .append("svg")
	    .attr("width", w)
	    .attr("height", h);
	svg.append("rect")
	    .attr("width", w)
	    .attr("height", h)
	    .attr("fill", "white");

	// grid
	function make_x_axis() {        
	    return d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);
	}

	function make_y_axis() {        
	    return d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(5);
	}

	var gridPathStyle={"stroke-width":"0","fill": "none", "opacity":"1"};

	var gridTickStyle={"stroke": "lightgrey","opacity": "1"};

	var xGridAppend=svg.append("g")         
	    .attr("class", "grid")
	    .attr("transform", "translate(0," + (h-margin.bottom) + ")")

	    .call(make_x_axis()
		  .tickSize(-h+(margin.bottom+margin.top))
		  .tickFormat("")
		 );

	xGridAppend.selectAll('.grid path')
	    .style(gridPathStyle);
	xGridAppend.selectAll('.grid .tick')
	    .style(gridTickStyle);

	var yGridAppend = svg.append("g")         
	    .attr("class", "grid")
	    .attr("transform", "translate("+margin.left+",0)")
	    .call(make_y_axis()
		  .tickSize(-w+(margin.left+margin.right))
		  .tickFormat("")
		 );

	yGridAppend.selectAll('.grid path')
	    .style(gridPathStyle);
	yGridAppend.selectAll('.grid .tick')
	    .style(gridTickStyle);

	var xAxisAppend=svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate("+0+","+(h-margin.bottom)+")")
	    .call(xAxis);
	var yAxisAppend=svg.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate("+margin.left+",0)")
	    .call(yAxis);
	xAxisAppend.selectAll('.axis line, .axis path')
	    .style(axisStyle);
	yAxisAppend.selectAll('.axis line, .axis path')
	    .style(axisStyle);
	var nameCount=0;
	var dataSortCallback=function(a,b){
		return new Date(a[1]) - new Date(b[1]);
	};
	var labelStyle={"font": "12px sans-serif"};
	svg.append("svg:text")
	    .attr("class", "x label")
	    .attr("x", w/2)
	    .attr("y", h-margin.bottom+margin.top-10)
	    .text("Date")
	    .attr("text-anchor", "middle")
	    .style(labelStyle);

	//y labels

	svg.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "middle")
	    .attr("x", -(h-margin.bottom+margin.top)/2)
	    .attr("dy", 10)
	    .attr("transform", "rotate(-90)")
	    .attr("text-anchor", "middle")
	    .text("Probability")
	    .style(labelStyle);

	var data,loopLength,j,toPush;
	var lineFitStyle;
	var legendStyle;
	var textX;
	var textY;
	var iVoted=0;
	var acceptVoter;
	console.log("toggle others is: "+$scope.toggleOthersBin);
	console.log("prediction data used is: "+JSON.stringify(predictionData));
	console.log("my name is: "+userName);
	for (name in predictionData) {
	    console.log("fail two name is: "+name);
	    if (userName){
		if (userName===name){
		    iVoted=1;
		}
	    }
	    acceptVoter=false;
	    console.log("will we accept..?");
	    console.log("bin is: "+$scope.toggleOthersBin);
	    console.log("looking for "+userName+", this one is "+name);
	    if ($scope.toggleOthersBin===1){
		console.log("accepting due to bin");
		acceptVoter=true;
	    }
	    else if (userName){
		if (name===userName){
		    console.log("accepting due to name");
		    acceptVoter=true;
		}
	    }
	    else if (Object.keys(predictionData).length===1){
		console.log("accepting due to sole user");
		acceptVoter=true;
	    }
	    console.log("number of voters for bin...: "+Object.keys(predictionData).length);
	    if (acceptVoter){
		console.log("accepted!");
		data=JSON.parse(JSON.stringify(predictionData[name]));
		data.sort(dataSortCallback);
		loopLength=data.length;
		data.push([data[data.length-1][0],dateMax]);
		for (j=0;j<loopLength;j++){
		    if (j>0){
			toPush=[data[j-1][0],new Date(new Date(data[j][1]).getTime()-1)];
			data.push(toPush);
		    }
		}
		data.sort(dataSortCallback);
		lineFitStyle={"fill": "none","stroke": "black","stroke-width": "2px"};
		legendStyle={"font": "12px sans-serif"};
		svg.append("path")
		    .datum(data)
		    .attr("class", "line")
		    .attr("d", line)
		    .style(lineFitStyle)
		    .style("stroke",$scope.d3colours[nameCount]);
		textX=new Date(data[data.length-1][1]);
		textY=data[data.length-1][0];
		svg.append("text")
		    .attr("class", "x label")
		    .attr("x", xScale(textX))
		    .attr("y", yScale(textY))
		    .style("fill",$scope.d3colours[nameCount])
	            .style(legendStyle)
		    .text(name);
		svg.selectAll("circle"+name)
		    .data(data)
		    .enter()
		    .append("circle")
		    .attr("cx", mousexVal)
		    .attr("cy", mouseyVal)
		    .attr("r", 1);

	    }
	    nameCount=nameCount+1;
	}
	console.log("togglemean bin is: "+$scope.toggleMeanBin);
	$scope.showRel=0;
	$scope.showMean=1;
	console.log("name count"+nameCount);
	var requiredUsers;
	requiredUsers=iVoted;
	console.log("ivoted: "+iVoted);
	console.log("name count: "+nameCount);
	console.log("required users: "+requiredUsers);
	if (nameCount>requiredUsers){
	    console.log("passed");
	    $scope.showRel=1;
	    if ($scope.toggleMeanBin===0){
		$scope.showMean=0;
	    }
	    else if (Object.keys(predictionData).length===1){
		$scope.showMean=0;
	    }
	}
	else {
	    $scope.showMean=0;
	}
	if ($scope.showMean===1){
	    console.log("showing mean");
	    data=JSON.parse(JSON.stringify(meanData));
	    data.sort(dataSortCallback);
	    loopLength=data.length;
	    data.push([data[data.length-1][0],dateMax]);
	    for (j=0;j<loopLength;j++){
		if (j>0){
		    toPush=[data[j-1][0],new Date(new Date(data[j][1]).getTime()-1)];
		    data.push(toPush);
		}
	    }
	    data.sort(dataSortCallback);
	    lineFitStyle={"fill": "none","stroke": "black","stroke-width": "4px"};
	    legendStyle={"font": "12px sans-serif","font-weight":"bold"};
	    svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.style(lineFitStyle);
	    textX=new Date(data[data.length-1][1]);
	    textY=data[data.length-1][0];
	    svg.selectAll("circle"+name)
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", mousexVal)
		.attr("cy", mouseyVal)
		.attr("r", 1);
	}
    };

    $scope.reset=function() {
	$scope.user=angular.copy($scope.master);
    };

    $scope.reset();
   
    $scope.toggleMeanBin=1;
    $scope.toggleMean=function(){
	$scope.toggleMeanBin=1-$scope.toggleMeanBin;
	$scope.preDraw();
    };

    $scope.toggleOthersBin=0;
    $scope.toggleOthers=function(){
	console.log("toggling others");
	$scope.toggleOthersBin=1-$scope.toggleOthersBin;
	$scope.preDraw();
    };
    
    $scope.saveSVG = function() {
	var html = d3.select("svg")
	    .attr("version", 1.1)
	    .attr("xmlns", "http://www.w3.org/2000/svg")
	    .node().parentNode.innerHTML;
	var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
	var img = '<img src="'+imgsrc+'">';
	
	var canvas = document.querySelector("canvas");
	var context = canvas.getContext("2d");
	var image = new Image();
	image.src = imgsrc;
	image.onload = function() {
	    context.drawImage(image, 0, 0);
	    
	    var canvasdata = canvas.toDataURL("image/png");
	    
	    var pngimg = '<img src="'+canvasdata+'">';
	    
	    var a = document.createElement("a");
	    a.download = "sample.png";
	    a.href = canvasdata;
	    document.body.appendChild(a);
	    a.click();
	};
	
    };

    if (typeof prediction!=="undefined"){
	console.log("calling init");
	$scope.selectGraphInit(prediction);
    }
    
    $scope.JSONToCSVConvertor = function() {
	var arrData=$scope.localData;
	var i, j;
	var CSV = '';
	var row="";
	var lengthCheckArr=[];

	console.log("downloading this data; "+JSON.stringify(arrData));
	console.log("length of: "+arrData.length);
	row='"Name","Answer","Date","Value"';
	for (i = 0; i < arrData.length; i++) {
	    if (arrData[i].name){
		CSV += row + '\r\n';
		row = "";
		row += '"' + arrData[i].name+'",';
		row += '"' + arrData[i].answer+'",';
		row += '"' + arrData[i].date+'",';
		row += '"' + arrData[i].val+'"';
		console.log("row is: "+row);
		console.log("CSV: "+CSV);
	    }
	}
	CSV+=row+'\r\n';
	console.log("lastcsv: "+CSV);
	
	var fileName = "";
	var ReportTitle="EconYeti data";
	fileName += ReportTitle.replace(/ /g,"_");   
	
	var uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);
	
	var link = document.createElement("a");    
	link.href = uri;
	
	//link.style = "visibility:hidden"; Removed this, wasn't allowing downloads in chrome
	link.download = fileName + ".csv";
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    };
    
    console.log("at end of doc");

}]);
