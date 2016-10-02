/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

myApp.controller('mainController',['$rootScope','$scope', '$http','$window', function($rootScope,$scope, $http,$window){
    "use strict";

    console.log("hi: "+localData);
    $scope.currentGroup=localData;
  //  $scope.groupList=[];
    //$scope.getGroups=function(){
//	$http.get('groupList')
//	    .success(function(inc){
//		$scope.groupList=inc;
//		$scope.group=$scope.groupList[0];
//		console.log("groups: "+$scope.groupList);
//	    });
  //  };
 //   $scope.getGroups();

    $scope.submit=function(){
	var toSubmit={};
	toSubmit.prediction=$scope.desc;
	if ($scope.end){
	    toSubmit.end=new Date($scope.end);
	}
	else {
	    toSubmit.end=null;
	}
	toSubmit.group=$scope.currentGroup;
	toSubmit.answers=$scope.answers;//.split(';');
	if ($scope.verbose){
	    toSubmit.verbose=$scope.verbose;
	}
	else {
	    toSubmit.verbose=null;
	}
	if ($scope.source){
	    toSubmit.source=$scope.source;
	}
	else{
	    toSubmit.source=null;
	}

	console.log("sending: "+JSON.stringify(toSubmit));
	var toSubmitString=encodeURIComponent(JSON.stringify(toSubmit));
	//$http.post('/newpredict',toSubmitString)
	console.log("toSubmitString: "+toSubmitString);
	$http.get('/newpredictsend/'+toSubmitString)
	    .success(function(response){
		$scope.feedback=response.message;
		if (response.success){
		    //console.log('/group/'+makeLower($scope.currentGroup)+"/"+makeLower(toSubmit.desc));
		    window.location.replace('/group/'+response.groupLower+"/"+response.predictionLower);
		}
		else {
		    $scope.feedback=response.message;
		}
		console.log("done");
//		window.location.href = 'predict';
	    })
	    .error(function(){
		console.log("fail");
	    });
    };
}]);
