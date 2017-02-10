/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

myApp.controller('mainController',['$rootScope','$scope', '$http','$window', function($rootScope,$scope, $http,$window){
    "use strict";
    angular.element($window).bind('resize',function(){
	$scope.drawGraph();
    });
    
    $scope.drawGraph=function(){

	var w = Math.min.apply(null,[700,document.getElementById('main').clientWidth]);
	var h = w*(5/8);
	var objID;
	var svg;

	var margin={top:50,right:150,bottom:50,left:50},
	width=w-margin.left-margin.right,
	height=h-margin.top-margin.bottom;

	var name;
	var i,j;

	var xDomain=[0,1];
	var yDomain=[0,1];

	var xScale = d3.scale.linear()
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
	    return xScale(d[1]);
	};
	var mouseyVal=function(d) {
	    return yScale(d[0]);
	};

	var line = d3.svg.line()
	    .x(function(d) {return xScale(d[1]);})
	    .y(function(d) {return yScale(d[0]);});

	var axisStyle={"fill": "none","stroke":"black","stroke-width": "1","shape-rendering": "crispEdges","font": "12px sans-serif"};
	objID="#canvasHold";
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
	var labelStyle={"font": "12px sans-serif"};
	svg.append("svg:text")
	    .attr("class", "x label")
	    .attr("x", w/2)
	    .attr("y", h-margin.bottom+margin.top-10)
	    .text(axisLabels[0])
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
	    .text(axisLabels[1])
	    .style(labelStyle);

	var data;
	var lineFitStyle;
	var legendStyle;


	var d3Colours=[];
	d3Colours.push(d3.rgb(50,150,50));
	d3Colours.push(d3.rgb(150,50,50));
	d3Colours.push(d3.rgb(50,50,150));

	console.log("d3: "+d3Colours);
	
	//Original lines
	for (j=0;j<linesInGraph.length;j++){
	    data=[];
	    for (i = xDomain[0]; i < xDomain[1]; i+=stepX){
		if (yFunction[linesInGraph[j].graph](i) >= yDomain[0] && yFunction[linesInGraph[j].graph](i) <= yDomain[1]){
		    data.push([yFunction[linesInGraph[j].graph](i),i]);
		}
	    }

	    lineFitStyle={"fill": "none","stroke": d3Colours[j],"stroke-width": "2px"};
	    legendStyle={"font": "12px sans-serif"};
	    svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.style(lineFitStyle);
		//.style({"stroke":"red"});

	    //svg.selectAll("circle")
	//	.data(data)
	//	.enter()
	//	.append("circle")
	//	.attr("cx", mousexVal)
	//	.attr("cy", mouseyVal)
	//	.attr("r", 1);

	    var legendSize=5,
		legendX = 15,
		legendMargin=15;
	    
	    svg.selectAll("legendIcon"+j)
		.data([1])
		.enter()
		.append("circle")
		.attr("cx",w-margin.right+legendMargin)
		.attr("cy",margin.top+j*20)
		.attr("r", legendSize)
		.style("fill",d3Colours[j]);
	    
	    svg.append("svg:text")
		.attr("class", "x label")
		.attr("x", w-margin.right+legendMargin+legendX)
		.attr("y", margin.top+j*20)
		.text(linesInGraph[j].name)
		.attr("text-anchor", "start")
		.attr("dy", ".35em")
		.style(legendStyle);

	}
	//Match lines
	var diffNow,
	    diffPast,
	    xCross,
	    yCross;

	
	for (j=0; j<yFunction.length;j++){
	    
	}
	var k,
	    xToUse,
	    yToUse;
	for (j=0; j<lineLinks.length; j++){
	    console.log("line link: "+lineLinks[j]);
	    console.log("link 1: "+lineLinks[j][0]);
	    console.log("link 2: "+lineLinks[j][1]);
	    for (k=0; k<linesInGraph.length;k++){
		console.log("graph line: "+linesInGraph[k].name);
		if (lineLinks[j][0]===linesInGraph[k].name){
		    console.log("alpha");
		    xToUse=linesInGraph[k].graph;
		}
		if (lineLinks[j][1]===linesInGraph[k].name){
		    console.log("bravo");
		    yToUse=linesInGraph[k].graph;		    
		}
		console.log("x2u: "+xToUse);
		console.log("y2u: "+yToUse);
	    }

	    var firstTime=true;	    
	    for (i = xDomain[0]; i < xDomain[1]; i+=stepX){
		if (firstTime === false){
		    diffPast=diffNow;
		    //
		    if (yFunction[xToUse](i)>yFunction[yToUse](i)){
			console.log("a");
			diffNow=true;
		    }
		    else {
			console.log("b");
			diffNow=false;
		    }
		    if (diffPast !== diffNow){
			xCross=i;
			yCross=yFunction[yToUse](i);
		    }
		}
		else {
		    firstTime = false;
		    //
		    if (yFunction[xToUse](i)>yFunction[yToUse](i)){
			console.log("c");
			diffNow=true;
		    }
		    else {
			console.log("d");
			diffNow=false;
		    }
		}
	    }
	    console.log("drawing lines");

	    svg.append("line")
		.style("stroke", "black")
		.attr("x1",xScale(0))
		.attr("y1",yScale(yCross))
		.attr("x2",xScale(xCross))
		.attr("y2",yScale(yCross));
	    
	    svg.append("line")
		.style("stroke", "black")
		.attr("x1",xScale(xCross))
		.attr("y1",yScale(0))
		.attr("x2",xScale(xCross))
		.attr("y2",yScale(yCross));

	    console.log("drawing lines done");

	}


    };
}]);
