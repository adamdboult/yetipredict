/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

var yFunction=[];
yFunction.push(
    function(d) {
	return d*d;
    }
);

yFunction.push(
    function(d) {
	return 0.3/d;
    }
);

yFunction.push(
    function(d) {
	return 0.2/d;
    }
);

var linesInGraph=[];    
linesInGraph.push(
    {
	name:"Supply",
	graph:0
    }
);
    
linesInGraph.push(
    {
	name:"Demand",
	graph:1
    }
);

linesInGraph.push(
    {
	name:"Demand 2",
	graph:2
    }
);

var lineLinks=[];
lineLinks.push(
    ["Supply","Demand"]  
);

lineLinks.push(
    ["Supply","Demand 2"]  
);

var stepX=0.01;

var axisLabels=["Quantity","Price"];
$scope.drawGraph();
