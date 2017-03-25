/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */
/*global d3:false */
/*global MathJax:false */

///*MathJax.Hub.Config({
//  skipStartupTypeset: true,
//  messageStyle: "none",
//  "HTML-CSS": {
//  showMathMenu: false
//  }
//  });*/

//MathJax.Hub.Config({skipStartupTypeset: true});
//MathJax.Hub.Configured();

var myApp = angular.module('myApp', []);

myApp.directive("mathjaxBind", function() {
    "use strict";
    return {
        restrict: "A",
        controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
            $scope.$watch($attrs.mathjaxBind, function(value) {
                var $script = angular.element("<script type='math/tex'>")
                //    .html(value === undefined ? "" : value);
		    .html(value);
                $element.html("");
                $element.append($script);
                MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
            });
        }]
    };
});

myApp.controller('mainController',['$rootScope','$scope', '$http','$window', function($rootScope,$scope, $http,$window){
    "use strict";
    //INITIALISATION

    $scope.localSeries=[];
    $scope.dotChoices=[];
    //	var dotStandard ={label:"Standard",data:-2, _id:-2,filter:[{Type:"Other"}]};
    //	$scope.dotChoices.push(dotStandard);
    var dotStandard ={label:"Standard",data:-2, _id:-2,filter:[{Type:"Other"}]};
    $scope.dotChoices.push(dotStandard);
    $scope.localIndex=[];

    $scope.seriesBrowse=[];

    $scope.showAddDetails=[];

    $scope.showLocalDetails=[];

    $scope.graphDetailShow=[];

    $scope.statsShow=[];

    $scope.toggleAddFilter=function(count) {
	if($scope.showAddDetails[count]===1) {
	    $scope.showAddDetails[count]=0;
	}
	else {
	    $scope.showAddDetails[count]=1;
	}
    };

    $scope.toggleStatsShow=function(count) {
	if($scope.statsShow[count]===1) {
	    $scope.statsShow[count]=0;
	}
	else {
	    $scope.statsShow[count]=1;
	}
    };

    $scope.toggleLocalFilter=function(count) {
	if($scope.showLocalDetails[count]===1) {
	    $scope.showLocalDetails[count]=0;
	}
	else {
	    $scope.showLocalDetails[count]=1;
	}
    };

    $scope.addColour=function(){
	var i,j;
	var colMin=50;
	var colMax=200;
	$scope.d3colours=[];
	for (i=0;i<$scope.jq2plotdata.length;i++) {
	    var colArr=[];
	    for(j=0;j<3;j++){
		colArr.push(colMin+Math.random()*(colMax-colMin));
	    }
	    $scope.d3colours.push(d3.rgb(colArr[0],colArr[1],colArr[2]));
	}
    };
    //$scope.addColour();

    var defaultSearchArray=['Subject','Country'];
    var defaultSearchValues=['Government','United Kingdom'];
    $scope.invisibleFilterOptions=[{
	name:"--Select below--",
	show:true
    }];
    $scope.newFilterOption=$scope.invisibleFilterOptions[0];
    //get map of sources
    $http.get('/path/a')
	.success(function(filters){
	    var i;
	    $scope.filterOptions=filters;
	    $scope.visibleFilterOptions=defaultSearchArray;
	    for (i=0;i<Object.keys($scope.filterOptions).length;i++) {
		console.log("SEEINGL "+Object.keys($scope.filterOptions)[i]);
		if ($scope.visibleFilterOptions.indexOf(Object.keys($scope.filterOptions)[i])===-1) {
		    $scope.invisibleFilterOptions.push({
			name:Object.keys($scope.filterOptions)[i],
			show:true
		    });
		}
		else {
		    $scope.invisibleFilterOptions.push({
			name:Object.keys($scope.filterOptions)[i],
			show:false
		    });
		}
	    }
	    
	    $scope.filterChoice={};
	    for (var filter in filters) {	
		$scope.filterChoice[filter]=$scope.filterOptions[filter][0];
	    }

	    for (var defSearch in defaultSearchArray) {
		$scope.filterChoice[defaultSearchArray[defSearch]]=defaultSearchValues[defSearch];

	    }
	    $scope.filterChange();
	});

    $scope.lineTypes=['None','Linear','Exponential'];
    $scope.lineType=$scope.lineTypes[1];
    $scope.filterChange=function() {
	$scope.pageReset=1;
	$scope.filterSend();
    };
    $scope.newGraphSeries=function() {

	$scope.localSelectionY.push($scope.localSelectionY[0]);
	$scope.localSelectionX.push($scope.localSelectionX[0]);
	$scope.localSelectionSize.push($scope.localSelectionSize[0]);
	//$scope.addColour();

	//call local graph
	$scope.localGraph();
    };
    $scope.removeGraphSeries=function(loc) {
	$scope.localSelectionY.splice(loc,1);
	$scope.localSelectionX.splice(loc,1);
	$scope.localSelectionSize.splice(loc+1,1);
	$scope.localGraph();
    };

    $http.get('/favs/a')
        .success(function(favs){
            $scope.favList = favs;
	    $scope.getData($scope.favList[1]._id);
	});
    
    $scope.pageReset=1;
    $scope.filterSend=function() {
	var filterSend={};
	for (var i in $scope.visibleFilterOptions) {
	    filterSend[$scope.visibleFilterOptions[i]]=$scope.filterChoice[$scope.visibleFilterOptions[i]];
	}
	if ($scope.pageReset!==0){
	    //$scope.pageSelect=$scope.pageCountArray[0];

//	    $scope.pageSelect=1;
	    filterSend.pageCount=1;
	}
	else {
	    filterSend.pageCount=$scope.pageSelect;	    
	}
	console.log("romeo"+$scope.pageSelect);

	$http.get('/cpi/'+encodeURIComponent(JSON.stringify(filterSend)))
	    .success(function(look){
		$scope.pageCount=look[look.length-1];
		$scope.pageCountArray=$scope.getNumber($scope.pageCount);
		if ($scope.pageReset!==0){
		    $scope.pageSelect=$scope.pageCountArray[0];
		    //$scope.pageSelect=1;
		}
		console.log("sigma"+$scope.pageSelect);
		look.splice(look.length-1,1);
		$scope.seriesBrowse=look;
		$scope.colourUpdate();
	    });
    };
    $scope.colourUpdate=function() {
	var i;
	var j;
	for (i=0; i<Object.keys($scope.seriesBrowse).length;i++) {
	    $scope.seriesBrowse[i].viewToggle=0;
	    for (j=0;j<Object.keys($scope.localSeries).length;j++) {
		if ($scope.localSeries[j]._id===$scope.seriesBrowse[i]._id) {
		    $scope.seriesBrowse[i].viewToggle=$scope.seriesBrowse[i].viewToggle+1;
		}
	    }
	}
	for (i=0; i<Object.keys($scope.favList).length;i++) {
	    $scope.favList[i].viewToggle=0;
	    for (j=0;j<Object.keys($scope.localSeries).length;j++) {
		if ($scope.localSeries[j]._id===$scope.favList[i]._id) {
		    $scope.favList[i].viewToggle=$scope.favList[i].viewToggle+1;
		}
	    }
        }
    };

    $scope.leftViewAdd=1;
    
    var leftOpacityOn=1;
    var leftOpacityOff=0.5;

    $scope.leftAddStyle={opacity:leftOpacityOn};
    $scope.leftLocalStyle={opacity:leftOpacityOff};
    $scope.leftStarStyle={opacity:leftOpacityOff};


    $scope.leftAdd=function() {
	$scope.leftViewAdd=1;
	$scope.leftViewLocal=0;
	$scope.leftViewStar=0;

	$scope.leftAddStyle={opacity:leftOpacityOn};
	$scope.leftLocalStyle={opacity:leftOpacityOff};
	$scope.leftStarStyle={opacity:leftOpacityOff};
    };
    $scope.leftLocal=function() {
	$scope.leftViewAdd=0;
	$scope.leftViewLocal=1;
	$scope.leftViewStar=0;
	$scope.leftAddStyle={opacity:leftOpacityOff};
	$scope.leftLocalStyle={opacity:leftOpacityOn};
	$scope.leftStarStyle={opacity:leftOpacityOff};
    };
    $scope.leftStar=function() {
	$scope.leftViewAdd=0;
	$scope.leftViewLocal=0;
	$scope.leftViewStar=1;
	$scope.leftAddStyle={opacity:leftOpacityOff};
	$scope.leftLocalStyle={opacity:leftOpacityOff};
	$scope.leftStarStyle={opacity:leftOpacityOn};
    };

    $scope.getNumber=function(num) {
	var numArray =[num];
	while (num>1) {
	    num=num-1;
	    numArray.unshift(num);
	}
	return numArray;
    };

    $scope.pageChange=function() {
	$scope.pageReset=0;
	$scope.filterSend();
    };

    $scope.addFilter=function(val) {
	$scope.visibleFilterOptions.push(val.name);
	var i;
	for (i=0;i<$scope.invisibleFilterOptions.length;i++){
	    if ($scope.invisibleFilterOptions[i].name===val.name){
		$scope.invisibleFilterOptions[i].show=false;
	    }
	}
	//$scope.invisibleFilterOptions.splice($scope.invisibleFilterOptions.indexOf(val),1);
	$scope.newFilterOption=$scope.invisibleFilterOptions[0];
    };
    
    $scope.removeFilter=function(val) {
	$scope.visibleFilterOptions.splice($scope.visibleFilterOptions.indexOf(val),1);
	var i;
	for (i=0;i<$scope.invisibleFilterOptions.length;i++){
	    if ($scope.invisibleFilterOptions[i].name===val){
		$scope.invisibleFilterOptions[i].show=true;
	    }
	}
    };
    var xUnits="Dependent Units";
    $scope.getData=function(seriesUsed) {
	var seriesMatch = $scope.localIndex.indexOf(seriesUsed);
	$scope.colourUpdate();
	$scope.localSelectionY=[];
	$scope.localSelectionX=[];
	$scope.localSelectionSize=[];
	$scope.localSelectionY.push(seriesUsed);
	$scope.localSelectionX.push(-1);
	$scope.localSelectionSize.push(-2);
	if (seriesMatch > -1) {
	    $scope.localGraph();
	}
	else {
	    $http.get('/dpi/'+seriesUsed)
		.success(function(blobs){
		    var newobj = blobs[0];
		    if ($scope.localIndex.indexOf(newobj.filter[xUnits])===-1) {
			var labelObject ={label:newobj.filter[xUnits],data:-1, _id:-1,filter:[{Type:"Other"}]};
			$scope.localSeries.push(labelObject);
			$scope.dotChoices.push(labelObject);
			$scope.localIndex.push(newobj.filter[xUnits]);
		    }
		    $scope.localSeries.push(newobj);
		    $scope.dotChoices.push(newobj);
		    $scope.localIndex.push(seriesUsed);
		    $scope.localSelectionY=[seriesUsed];
		    $scope.localSelectionX=[-1];
		    $scope.localSelectionSize=[-2];
		    $scope.localGraph();
		    var seriesMatch = $scope.localIndex.indexOf(seriesUsed);
		    $scope.colourUpdate();
		});
	}
    };

    $scope.updateGraph = function(seriesUsed,secondSeriesUsed,dotSeriesUsed) {
	var i;
	var j;
	$scope.seriesUsed=[];

	$scope.graphSeriesCount=[];
	for(i=0;i<seriesUsed.length;i++){
	    $scope.graphSeriesCount.push(i);
	}
	
	for(i=0;i<seriesUsed.length;i++){
	    if(seriesUsed[i]>-1){
		if($scope.seriesUsed.indexOf(seriesUsed[i])===-1){
		    $scope.seriesUsed.push(seriesUsed[i]);
		}
	    }
	}
	for(i=0;i<secondSeriesUsed.length;i++){
	    if(secondSeriesUsed[i]>-1){
		if($scope.seriesUsed.indexOf(secondSeriesUsed[i])===-1){
		    $scope.seriesUsed.push(secondSeriesUsed[i]);
		}
	    }
	}
	for(i=0;i<dotSeriesUsed.length;i++){
	    if(dotSeriesUsed[i]>-1){
		if($scope.seriesUsed.indexOf(dotSeriesUsed[i])===-1){
		    $scope.seriesUsed.push(dotSeriesUsed[i]);
		}
	    }
	}

	$scope.jq2plotdata=[];

	$scope.seriesNameX=[];
	$scope.seriesNameY=[];
	$scope.seriesNameDot=[];
	$scope.legendText=[];
	var axisX=[];
	var axisY=[];
	var addToData=function(arrPointx, arrPointy,arrPointSize){
	    if (!(isNaN(arrPointy)) && !(isNaN(arrPointx)) && !(isNaN(arrPointSize))) {
		var arrPoint=([arrPointx,arrPointy,arrPointSize,$scope.seriesNameX[i],$scope.seriesNameY[i],$scope.seriesNameDot[i]]);
		$scope.jq2plotdata[$scope.jq2plotdata.length-1].push(arrPoint);//findme
	    }
	};
	for (i=0;i<seriesUsed.length;i++) {
	    var jqplotdatax="";
	    var jqplotdatay="";
	    var jqplotdataDot="";
	    var secondSeriesDataExist=secondSeriesUsed[i]>-1;
	    var firstSeriesDataExist=seriesUsed[i]>-1;
	    var dotSeriesDataExist=dotSeriesUsed[i]>-1;
	    if (secondSeriesDataExist) {
		jqplotdatax = $scope.localSeries[secondSeriesUsed[i]].data;
		axisX.push($scope.localSeries[secondSeriesUsed[i]].filter.Units);
		$scope.seriesNameX[i]=$scope.localSeries[secondSeriesUsed[i]].label;
	    }
	    else if (firstSeriesDataExist) {
		axisX.push($scope.localSeries[seriesUsed[i]].filter[xUnits]);
		$scope.seriesNameX[i]=$scope.localSeries[seriesUsed[i]].filter[xUnits];
	    }
	    if (firstSeriesDataExist) {
		jqplotdatay = $scope.localSeries[seriesUsed[i]].data;
		axisY.push($scope.localSeries[seriesUsed[i]].filter.Units);
 		$scope.seriesNameY[i]=$scope.localSeries[seriesUsed[i]].label;
	    }
	    else if (secondSeriesDataExist){
		axisY.push($scope.localSeries[secondSeriesUsed[i]].filter[xUnits]);
		$scope.seriesNameY[i]=$scope.localSeries[secondSeriesUsed[i]].filter[xUnits];
	    }

	    if (dotSeriesUsed[i]>-1) {
		jqplotdataDot = $scope.localSeries[dotSeriesUsed[i]].data;
		$scope.seriesNameDot[i]=$scope.localSeries[dotSeriesUsed[i]].label;
	    }
	    else if (dotSeriesUsed[i]===-1){
		$scope.seriesNameDot[i]=$scope.localSeries[seriesUsed[i]].filter[xUnits];				
	    }

	    if (secondSeriesDataExist+firstSeriesDataExist>0) {
		$scope.jq2plotdata.push([]);
		var legText="";
		if($scope.localSelectionY[i]!==-1){
		    legText+=$scope.seriesNameY[i];
		}
		if($scope.localSelectionX[i]!==-1){
		    if($scope.localSelectionY[i]!==-1){
			legText+=" against ";
		    }				
		    legText+=$scope.seriesNameX[i];
		}
		if (dotSeriesUsed[i]>-2) {
		    legText+=", sizes from ";
		    legText+=$scope.seriesNameDot[i];
		}
		$scope.legendText.push(legText);
	    }
	    var arrPointx;
	    var arrPointy;
	    var arrPointDot;
	    var dotSize;

	    var key;//findme
	    if(jqplotdatay!==""){
		for (key in jqplotdatay){
		    arrPointy=parseFloat(String(jqplotdatay[key]).replace(",",""));
		    if (secondSeriesUsed[i]===-1) {
			arrPointx=parseFloat(key);
		    }
		    else {
			arrPointx=parseFloat(String(jqplotdatax[key]).replace(",",""));
		    }

		    if (jqplotdataDot!==""){
			arrPointDot=parseFloat(String(jqplotdataDot[key]).replace(",",""));
		    }
		    else if (dotSeriesUsed[i]===-1) {
			arrPointDot=parseFloat(key);
		    }
		    else {
			arrPointDot=25;
		    }
		    addToData(arrPointx,arrPointy,arrPointDot);
		}
	    }
	    else if (jqplotdatax!=="") {
		for (key in jqplotdatax){
		    arrPointx=parseFloat(String(jqplotdatax[key]).replace(",",""));
		    arrPointy=parseFloat(key);

		    if (jqplotdataDot!==""){
			arrPointDot=parseFloat(String(jqplotdataDot[key]).replace(",",""));
		    }
		    else if (dotSeriesUsed[i]===-1) {
			arrPointDot=parseFloat(key);
		    }
		    else {
			arrPointDot=25;
		    }



		    addToData(arrPointx,arrPointy,arrPointDot);
		}
	    }
	}


	//dot scale calculation
	var dotArray=[];
	var dotMin;
	var dotMax;
	var dotLowerRatio=1;
	var dotUpperRatio=100;
	$scope.dotRatio=[];
	$scope.dotShift=[];
	for (i=0;i<seriesUsed.length;i++) {
	    dotArray[i]=[];
	    for (j=0;j<$scope.jq2plotdata[i].length;j++) {
		dotArray[i].push($scope.jq2plotdata[i][j][2]);
	    }
	    dotMin=Math.min.apply(null,dotArray[i]);
	    dotMax=Math.max.apply(null,dotArray[i]);
	    $scope.dotRatio[i]=1;
	    $scope.dotShift[i]=0;
	    if (dotMax>dotMin) {
		$scope.dotRatio[i]=(dotUpperRatio-dotLowerRatio)/(dotMax-dotMin);
		$scope.dotShift[i]=dotLowerRatio-dotMin*$scope.dotRatio[i];
	    }
	}

	$scope.dataExistError=0;
	if(axisX.length===0) {
	    $scope.dataExistError=1;
	}

	$scope.yAxisName=axisY[0];
	$scope.xAxisName=axisX[0];
	$scope.xAxisProblem=0;
	$scope.yAxisProblem=0;
	for(i=0;i<axisY.length;i++){
	    if(axisY[i]!==axisY[0]){
		$scope.yAxisProblem=1;
	    }
	}

	for(i=0;i<axisX.length;i++){
	    if(axisX[i]!==axisX[0]){
		$scope.xAxisProblem=1;
	    }
	}

	//data analysis

	$scope.statsNames=[];
	$scope.statsNames[1]=[];
	$scope.statsNames[1].push("X-axis average");
	$scope.statsNames[1].push("Y-axis average");
	$scope.statsNames[1].push("Slope (m)");
	$scope.statsNames[1].push("Intercept (c)");

	$scope.statsNames[2]=[];
	$scope.statsNames[2].push("X-axis average");
	$scope.statsNames[2].push("Y-axis average");
	$scope.statsNames[2].push("Exponent (b)");
	$scope.statsNames[2].push("Intercept (a)");
	$scope.statsNames[2].push("Adjustment for negative values (c)");

	$scope.statsFormula=[];
	$scope.statsFormula[1]="y=mx+c";
	$scope.statsFormula[2]="y=ae^{bx}-c";

	$scope.statsData=[];

	$scope.xAverage=[];
	$scope.yAverage=[];
	$scope.bHat=[];
	$scope.intercept=[];

	$scope.lineData=[];

	$scope.lnyAverage=[];
	$scope.expbHat=[];
	$scope.expintercept=[];
	for (i=0;i<$scope.jq2plotdata.length;i++) {

	    var xTotal=0;
	    var yTotal=0;
	    var xxTotal=0;
	    var xyTotal=0;
	    var yyTotal=0;
	    var nCount=0;
	    var lnyTotal=0;
	    var lnylnyTotal=0;
	    var xlnyTotal=0;
	    var xArray=[];
	    var yArray=[];
	    for (j=0; j<$scope.jq2plotdata[i].length;j++) {
		xTotal+=$scope.jq2plotdata[i][j][0];
		yTotal+=$scope.jq2plotdata[i][j][1];
		xxTotal+=$scope.jq2plotdata[i][j][0]*$scope.jq2plotdata[i][j][0];
		xyTotal+=$scope.jq2plotdata[i][j][0]*$scope.jq2plotdata[i][j][1];
		yyTotal+=$scope.jq2plotdata[i][j][1]*$scope.jq2plotdata[i][j][1];
		nCount++;
		xArray.push($scope.jq2plotdata[i][j][0]);
		yArray.push($scope.jq2plotdata[i][j][1]);
	    }
	    

	    //exp
	    var lnymin=1;
	    var lnyOffset=Math.max.apply(null,[0,lnymin-Math.min.apply(null,yArray)]);
	    for (j=0; j<$scope.jq2plotdata[i].length;j++) {
		lnyTotal+=Math.log($scope.jq2plotdata[i][j][1]+lnyOffset);
		lnylnyTotal+=Math.log($scope.jq2plotdata[i][j][1]+lnyOffset)*Math.log($scope.jq2plotdata[i][j][1]+lnyOffset);
		xlnyTotal+=Math.log($scope.jq2plotdata[i][j][1]+lnyOffset)*$scope.jq2plotdata[i][j][0];
	    }

	    $scope.statsData[i]=[];

	    $scope.xAverage[i]=xTotal/nCount;
	    $scope.yAverage[i]=yTotal/nCount;
	    $scope.bHat[i]=(xyTotal-(xTotal*yTotal)/nCount)/(xxTotal-(xTotal*xTotal)/nCount);
	    $scope.intercept[i]=$scope.yAverage[i]-$scope.bHat[i]*$scope.xAverage[i];

	    $scope.statsData[i][1]=[];

	    $scope.statsData[i][1].push($scope.xAverage[i]);
	    $scope.statsData[i][1].push($scope.yAverage[i]);
	    $scope.statsData[i][1].push($scope.bHat[i]);
	    $scope.statsData[i][1].push($scope.intercept[i]);

	    //exp
	    $scope.lnyAverage[i]=lnyTotal/nCount;
	    //			$scope.expbHat[i]=(xlnyTotal-(xTotal*lnyTotal)/nCount)/(xxTotal-(xTotal*xTotal)/nCount);
	    $scope.expbHat[i]=(xlnyTotal-(xTotal*lnyTotal)/nCount)/(xxTotal-(xTotal*xTotal)/nCount);
	    //			$scope.expintercept[i]=$scope.lnyAverage[i]-$scope.expbHat[i]*$scope.xAverage[i];
	    $scope.expintercept[i]=$scope.lnyAverage[i]-$scope.expbHat[i]*$scope.xAverage[i];

	    $scope.statsData[i][2]=[];

	    $scope.statsData[i][2].push($scope.xAverage[i]);
	    $scope.statsData[i][2].push($scope.yAverage[i]);
	    $scope.statsData[i][2].push($scope.expbHat[i]);
	    $scope.statsData[i][2].push($scope.expintercept[i]);

	    $scope.statsData[i][2].push(lnyOffset);
	    //straight line
	    $scope.lineData[i]=[];
	    $scope.lineData[i][0]=[];
	    $scope.lineData[i][1]=[];
	    $scope.lineData[i][2]=[];
	    var linePoint;
	    var lineFidelity=100;
	    for (j=0; j<=lineFidelity;j++) {

		var xLinePoint = Math.min.apply(null,xArray)*((lineFidelity-j)/lineFidelity)+Math.max.apply(null,xArray)*(j/lineFidelity);
		//OLS
		linePoint=[xLinePoint,$scope.bHat[i]*xLinePoint+$scope.intercept[i]];

		$scope.lineData[i][1].push(linePoint);
		//EXP OLS
		linePoint=[xLinePoint,Math.exp($scope.expintercept[i])*Math.exp($scope.expbHat[i]*xLinePoint)-lnyOffset];

		$scope.lineData[i][2].push(linePoint);
	    }
	}


	//exponential

	//scope these above!!

	if ($scope.dataExistError===0) {
	    $scope.drawGraph();
	}
    };
    $scope.drawGraph=function(){
	$scope.addColour();
	$scope.dataExistError=0;
	$( "#chartdiv" ).empty();
	var div = d3.select("#main").append("div")
	    .attr("class", "tooltip")               
	    .style("opacity", 0);

	//x labels
	$scope.xlabel=[];
	var xlabellength=70;
	var spacecountx=[];
	var labelLeftX=$scope.xAxisName;
	while (labelLeftX.indexOf(" ")>0) {
	    spacecountx.push(labelLeftX.indexOf(" ")+1);
	    labelLeftX=labelLeftX.substring(spacecountx[spacecountx.length-1]);
	}

	labelLeftX=$scope.xAxisName;

	var xlencount=0;
	var wordcount=0;

	while (labelLeftX.length>0) {
	    if (spacecountx[wordcount]>0) {
		xlencount=xlencount+spacecountx[wordcount];
		wordcount=wordcount+1;
		if (xlencount>xlabellength) {
		    $scope.xlabel.push(labelLeftX.substring(0,xlencount));
		    labelLeftX=labelLeftX.substring(xlencount);
		}
	    }
	    else {
		$scope.xlabel.push(labelLeftX);
		labelLeftX="";
	    }
	}

	$scope.ylabel=[];
	var ylabellength=60;
	var spacecounty=[];
	var labelLeftY=$scope.yAxisName;

	while (labelLeftY.indexOf(" ")>0) {
	    spacecounty.push(labelLeftY.indexOf(" ")+1);
	    labelLeftY=labelLeftY.substring(spacecounty[spacecounty.length-1]);
	}
	
	labelLeftY=$scope.yAxisName;
	var ylencount=0;
	wordcount=0;
	while (labelLeftY.length>0) {
	    if (spacecounty[wordcount]>0) {
		ylencount=ylencount+spacecounty[wordcount];
		wordcount=wordcount+1;
		if (ylencount>ylabellength) {
		    $scope.ylabel.push(labelLeftY.substring(0,ylencount));
		    labelLeftY=labelLeftY.substring(ylencount);
		}
	    }
	    else {
		$scope.ylabel.push(labelLeftY);
		labelLeftY="";
	    }
	}

	//finish labels
	var wmin = 600;
	var w = document.getElementById('main').clientWidth;
	//if (w <wmin) {w=wmin;}
	var h= w*(5/8)+$scope.localSelectionY.length*20;

	$('#canvasHold').html('<canvas width="'+w+'" height="'+h+'" style="display:none"></canvas>');
	var paddingmarginxleft=w/15+$scope.ylabel.length*15;
	var paddingmarginxright=w/15;
	var paddingmarginytop=h/15;
	var paddingmarginybottom=(h-$scope.localSelectionY.length*20)/10+$scope.xlabel.length*15+$scope.localSelectionY.length*20;
	//scales
	var xMinArray=[];
	var xMaxArray=[];
	var yMinArray=[];
	var yMaxArray=[];
	var i;
	for (i=0;i<$scope.jq2plotdata.length;i++) {
	    xMinArray.push(d3.min($scope.jq2plotdata[i], function(d) { return d[0];}));
	    xMaxArray.push(d3.max($scope.jq2plotdata[i], function(d) { return d[0];}));
	    yMinArray.push(d3.min($scope.jq2plotdata[i], function(d) { return d[1];}));
	    yMaxArray.push(d3.max($scope.jq2plotdata[i], function(d) { return d[1];}));
	}
	var xMin=d3.min(xMinArray);
	var xMax=d3.max(xMaxArray);
	var yMin=d3.min(yMinArray);
	var yMax=d3.max(yMaxArray);


	var xDomain=[xMin, xMax];

	var yDomain=[yMin, yMax];
	var xScaleSeed=Math.max.apply(null,[Math.abs(xMin),Math.abs(xMax)]);
	var yScaleSeed=Math.max.apply(null,[Math.abs(yMin),Math.abs(yMax)]);
	
	var xScaleDigits=Math.floor(Math.log(xScaleSeed)/Math.LN10 +1);
	
	var yScaleDigits=Math.floor(Math.log(yScaleSeed)/Math.LN10 +1);
	
	var xScale = d3.scale.linear()
	    .domain(xDomain)
	    .range([paddingmarginxleft, w-paddingmarginxright]);
	var yScale = d3.scale.linear()
	    .domain(yDomain)
	    .range([h-paddingmarginybottom, paddingmarginytop]);

	//axis
	var xTicks = 10;
	var yTicks = 5;
	var tickFormatSubx=function(d) {
	    return tickFormatSub(d,xScaleDigits);
	};
	var tickFormatSuby=function(d) {
	    return tickFormatSub(d,yScaleDigits);
	};
	var tickFormatSub=function(d,digitsCount) {
	    var adjDigs=Math.max.apply(null,[0,digitsCount-2]);
	    var reduction=Math.floor(adjDigs/3);
	    var scaleExtension={"0":"","1":"k","2":"mm","3":"bn","4":"tn"};
	    return (d/Math.pow(10,reduction*3))+scaleExtension[String(reduction)];
	};
	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")
	    .ticks(xTicks)
	    .tickFormat(function(d) {return tickFormatSubx(d);});//removes commas
	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left")
	    .ticks(yTicks)
	    .tickFormat(function(d) {return tickFormatSuby(d);});//removes commas

	function make_x_axis() {        
	    return d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(xTicks);
	}

	function make_y_axis() {        
	    return d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(yTicks);
	}

	var svg = d3.select("#chartdiv")
	//			.append("svg:svg")
	    .append("svg")
	    .attr("width", w)
	    .attr("height", h);
	//var div = d3.select("body").append("div")

//	var pathStyle= {"stroke": "dark blue","stroke-width": "2","fill": "none"};
	var gridPathStyle={"stroke-width":"0","fill": "none", "opacity":"1"};

	var gridTickStyle={"stroke": "lightgrey","opacity": "1"};

	svg.append("rect")
	    .attr("width", w)
	    .attr("height", h)
	    .attr("fill", "white");

	//		svg.append("g")
	//			.attr("transform", "translate(" + paddingmarginxleft + "," + paddingmarginybottom + ")");

	var xGridAppend=svg.append("g")         
	    .attr("class", "grid")
	    .attr("transform", "translate(0," + (h-paddingmarginybottom) + ")")
	    .call(make_x_axis()
		  .tickSize(-h+(paddingmarginybottom+paddingmarginytop))
		  .tickFormat("")
		 );

	xGridAppend.selectAll('.grid path')
	    .style(gridPathStyle);
	xGridAppend.selectAll('.grid .tick')
	    .style(gridTickStyle);

	var yGridAppend = svg.append("g")         
	    .attr("class", "grid")
	    .attr("transform", "translate("+paddingmarginxleft+",0)")
	    .call(make_y_axis()
		  .tickSize(-w+(paddingmarginxleft+paddingmarginxright))
		  .tickFormat("")
		 );

	yGridAppend.selectAll('.grid path')
	    .style(gridPathStyle);
	yGridAppend.selectAll('.grid .tick')
	    .style(gridTickStyle);

	$scope.lineMatch=$scope.lineTypes.indexOf($scope.lineType);
	$scope.modelFormula=$scope.statsFormula[$scope.lineMatch];

	var line = d3.svg.line()
	    .x(function(d) { return xScale(d[0]); })
	    .y(function(d) { return yScale(d[1]); })
	    .interpolate("basis");
	var xMouseOver=[];
	var yMouseOver=[];
	var lineFitStyle={"fill": "none","stroke": "black","stroke-width": "2px"};
	var legendStyle={"font": "12px sans-serif"};
	var mouseOverFunction=function(d) {
	    div.transition()
		.duration(0)      
		.style("opacity", 0.9);
	    var mainId=document.getElementById("main");
	    var xTitle=$scope.seriesNameX[0];
	    var yTitle=$scope.seriesNameY[0];
	    var htmlMouseOver=d[3]+": "+d[0] + "<br/>" +d[4] +": "+ d[1];
	    if (d[5]) {
		htmlMouseOver+="<br/>"+d[5]+": "+d[2];
	    }
	    div.html(htmlMouseOver)
		.style("left", (d3.event.pageX-mainId.getBoundingClientRect().left) + "px")
		.style("top", (d3.event.pageY-mainId.getBoundingClientRect().top-35) + "px");
	};
	var mouseOutFunction=function(d) {      
	    div.transition()
		.duration(100)
		.style("opacity", 0);
	};
	var mousexVal=function(d) {
	    return xScale(d[0]);
	};
	var mouseyVal=function(d) {
	    return yScale(d[1]);
	};
	var dotSize=function(d) {
	    return Math.sqrt(d[2]*$scope.dotRatio[i]+$scope.dotShift[i]);
	};

	for (i=0;i<$scope.jq2plotdata.length;i++) {
	    svg.selectAll("circle"+i)
		.data($scope.jq2plotdata[i])
		.enter()
		.append("circle")
		.attr("cx", mousexVal)
		.attr("cy", mouseyVal)
	    //.attr("r", 10)//findme
		.attr("r", dotSize)
		.style("fill",$scope.d3colours[i])
		.on("mouseover", mouseOverFunction)
		.on("mouseout", mouseOutFunction);

	    var legendx=50;
	    var legendy=h-paddingmarginybottom+paddingmarginytop+i*20+10;
	    //			var legendText="legend"+i;
	    var legendSize=5;

	    svg.selectAll("legendIcon"+i)
		.data([1])
		.enter()
		.append("circle")
		.attr("cx",legendx)
		.attr("cy",legendy)
		.attr("r", legendSize)
		.style("fill",$scope.d3colours[i]);

	    //svg.append("svg:text")
	//	.attr("class", "x label")
	//	.attr("x", legendx+legendSize)
	//	.attr("y", legendy)
	//	.text($scope.legendText[i])
	//	.attr("text-anchor", "start")
	//	.attr("dy", ".35em")
	//	.style(legendStyle);

	    svg.append("svg:text")
		.attr("class", "x label")
		.attr("x", legendx+legendSize)
		.attr("y", legendy)
		.text($scope.legendText[i])
		.attr("text-anchor", "start")
		.attr("dy", ".35em")
		.style(legendStyle);

	    svg.append("svg:text")
		.attr("class", "watermark")
		.attr("x", paddingmarginxleft)
		.attr("y", paddingmarginytop)
		.text("www.yetipredict.com")
		.attr("text-anchor", "start")
		.attr("dy", ".71em")
		.style(legendStyle);

	    svg.append("path")
		.datum($scope.lineData[i][$scope.lineMatch])
		.attr("class", "line")
		.attr("d", line)
		.style(lineFitStyle)
		.style("stroke",$scope.d3colours[i].darker());
	}

	if($scope.yAxisProblem===1){
	    svg.append("text")
		.attr("class", "x label")
		.attr("x", w/2)
		.attr("y", h/2)
		.text("Warning: Y axis units do not match")
		.attr("text-anchor", "start")
		.attr("dy", ".35em")
		.style(legendStyle);
	}
	if($scope.xAxisProblem===1){
	    svg.append("text")
		.attr("class", "x label")
		.attr("x", w/2)
		.attr("y", h/2-50)
		.text("Warning: X axis units do not match")
		.attr("text-anchor", "start")
		.attr("dy", ".35em")
		.style(legendStyle);
	}	
	
	var axisStyle={"fill": "none","stroke":"black","stroke-width": "1px","shape-rendering": "crispEdges","font": "12px sans-serif"};

	var xAxisAppend=svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + (h-paddingmarginybottom) + ")")
	    .call(xAxis);
	xAxisAppend.selectAll('.axis line, .axis path')
	    .style(axisStyle);
	xAxisAppend.selectAll('text')
	    .style({"font": "12px sans-serif"});
	var yAxisAppend=svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + paddingmarginxleft + ",0)")
	    .call(yAxis);
	yAxisAppend.selectAll('.axis line, .axis path')
	    .style(axisStyle);
	yAxisAppend.selectAll('text')
	    .style({"font": "12px sans-serif"});

	//labels draw
	var labelStyle={"font": "12px sans-serif"};
	for (i=0;i<$scope.xlabel.length;i++) {
	    svg.append("svg:text")
		.attr("class", "x label")
//		.attr("x", w/2)
//		.attr("y", h-paddingmarginybottom+paddingmarginytop+13*(i-$scope.xlabel.length))
		.attr("x", w/2)
		.attr("y", 10+h-paddingmarginybottom+paddingmarginytop+13*(i-$scope.xlabel.length))
		.text($scope.xlabel[i])
		.attr("text-anchor", "middle")
		.style(labelStyle);
	}

	//y labels
	for (i=0;i<$scope.ylabel.length;i++) {
	    svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
//		.attr("x", -(h-paddingmarginybottom+paddingmarginytop)/2)
//		.attr("dy", (i+1)*20)
		.attr("x", -(h-paddingmarginybottom+paddingmarginytop)/2)
		.attr("dy", 20+(i+1)*20)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.text($scope.ylabel[i])
		.style(labelStyle);
	}
	//end label
	
	//end graph d3
    };

    $scope.saveSVG = function() {
	var html = d3.select("svg")
	    .attr("version", 1.1)
	    .attr("xmlns", "http://www.w3.org/2000/svg")
	    .node().parentNode.innerHTML;
	
	var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
	var img = '<img src="'+imgsrc+'">';
	//		d3.select("#svgdataurl").html(img);
	
	
	var canvas = document.querySelector("canvas"),

	context = canvas.getContext("2d");
	var image = new Image();
	image.src = imgsrc;
	image.onload = function() {
	    context.drawImage(image, 0, 0);
	    
	    var canvasdata = canvas.toDataURL("image/png");
	    
	    var pngimg = '<img src="'+canvasdata+'">';
	    //			d3.select("#pngdataurl").html(pngimg);
	    
	    var a = document.createElement("a");
	    a.download = "sample.png";
	    a.href = canvasdata;
	    document.body.appendChild(a);
	    a.click();
	};
	
    };

    angular.element($window).bind('resize',function(){
	//var angular.element($window).bind('resize')=function(){
	if ($scope.dataExistError===0) {
	    $scope.drawGraph();
	}
    });

    $scope.toggleTable=function(){
	$scope.showTable=1-$scope.showTable;
    };

    $scope.toggleGraphDetail=function(count){
	if($scope.graphDetailShow[count]===1) {
	    $scope.graphDetailShow[count]=0;
	}
	else {
	    $scope.graphDetailShow[count]=1;
	}
    };

    $scope.localGraph=function(){
	var i;
	var seriesMatchX=[];
	var seriesMatchY=[];
	var seriesMatchDot=[];
	for(i=0;i<$scope.localSelectionX.length;i++){
	    seriesMatchX.push($scope.localIndex.indexOf($scope.localSelectionX[i]));
	}
	for(i=0;i<$scope.localSelectionY.length;i++){
	    seriesMatchY.push($scope.localIndex.indexOf($scope.localSelectionY[i]));
	}
	for(i=0;i<$scope.localSelectionSize.length;i++){
	    if ($scope.localIndex.indexOf($scope.localSelectionSize[i])>-1) {
		seriesMatchDot.push($scope.localIndex.indexOf($scope.localSelectionSize[i]));
	    }
	    else {
		seriesMatchDot.push($scope.localSelectionSize[i]);
	    }
	}
	$scope.updateGraph(seriesMatchY,seriesMatchX,seriesMatchDot);
    };

    $scope.removeSeries=function(seriesUsed){
	var seriesMatch = $scope.localIndex.indexOf(seriesUsed);
	$scope.localSeries.splice(seriesMatch,1);
	$scope.dotChoices.splice(seriesMatch+1,1);
	$scope.localIndex.splice(seriesMatch,1);
	$scope.colourUpdate();
    };

    $scope.JSONToCSVConvertor = function() {
	var arrData=$scope.localSeries;
	console.log("arr data"+JSON.stringify(arrData));
	var i, j;
	var CSV = '';
	var row="";
	var lengthCheckArr=[];
	var filterLengthArray=[];
	var noteLengthArray=[];

	for (i=0;i<arrData.length;i++){
	    if (arrData[i].data!==-1){
		row += '"'+arrData[i].filter[xUnits]+'","'+arrData[i].label+'",,';

		lengthCheckArr.push(parseInt(Object.keys(arrData[i].data).length));

		var filterInstanceLength=0;
		filterInstanceLength=Object.keys(arrData[i].filter).length;
		filterLengthArray.push(filterInstanceLength);
		
		var noteInstanceLength=0;
		noteInstanceLength=Object.keys(arrData[i].note).length;
		noteLengthArray.push(noteInstanceLength);
	    }
	}
	CSV += row + '\r\n';
	console.log("here");
	var lengthCheck=Math.max.apply(null,lengthCheckArr);

	for (i = 0; i < lengthCheck; i++) {
	    row = "";
	    for (j=0;j<arrData.length;j++) {
		if (arrData[j].data!==-1){
		    row += '"' + Object.keys(arrData[j].data)[i] + '","'+arrData[j].data[Object.keys(arrData[j].data)[i]]+'",,';
		}
	    }
	    CSV += row + '\r\n';
	}
	CSV+='\r\n';
	var filterLength = Math.max.apply(null,filterLengthArray);

	for (i=0; i<filterLength;i++) {
	    row="";
	    for (j=0;j<arrData.length;j++) {
		if (arrData[j].data!==-1){
		    row += '"' + Object.keys(arrData[j].filter)[i] + '","'+arrData[j].filter[Object.keys(arrData[j].filter)[i]]+'",,';
		}
	    }
	    CSV += row + '\r\n';
	}

	var noteLength = Math.max.apply(null,noteLengthArray);
	
	for (i=0; i<noteLength;i++) {
	    row="";
	    for (j=0;j<arrData.length;j++) {
		if (arrData[j].data!==-1){
		    row += '"' + Object.keys(arrData[j].note)[i] + '","'+arrData[j].note[Object.keys(arrData[j].note)[i]]+'",,';
		}
	    }
	    CSV += row + '\r\n';
	}
	console.log("big old csv: "+JSON.stringify(CSV));
	var fileName = "";
	var ReportTitle="YetiPredict data";
	fileName += ReportTitle.replace(/ /g,"_");   
	console.log("file name: "+fileName);
	var uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);
	
	var link = document.createElement("a");    
	link.href = uri;

	//link.style = "visibility:hidden"; Removed this, wasn't allowing downloads in chrome
	link.download = fileName + ".csv";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    };
}]);
