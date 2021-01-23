/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

myApp.controller('mainController', ['$rootScope', '$scope', '$http','$window', function($rootScope, $scope, $http, $window){
    "use strict";

    $scope.groupList=[];
    $scope.getGroups=function(){
	$http.get('groupList')
	    .then(function(response){
	        var inc = response.data;
		$scope.groupList=inc;
		//$scope.group=$scope.groupList[0];
		console.log("groups: "+$scope.groupList);
	    });
    };
    $scope.getGroups();

    $scope.openOpts=[{'bin':0, 'label':'closed'},
		 {'bin':1, 'label':'open'}
		];
    $scope.open = 1;
    $scope.testVariableDeleteMe = "Hello world";
    $scope.submit = function(){
	var toSubmit = {};
	toSubmit.group = $scope.group;
	toSubmit.open = $scope.open;
	toSubmit.verbose = $scope.verbose;
	if ($scope.verbose){
	    toSubmit.verbose = $scope.verbose;
	}
	else {
	    toSubmit.verbose=null;
	}
	//$http.post('/newgroup',toSubmit)
	var toSubmitString=encodeURIComponent(JSON.stringify(toSubmit));
	$http.get('/newgroupsend/'+toSubmitString)
	    .then(function(response){
	        var inc = response.data;
		$scope.feedback=inc.message;
		if (inc.success){
		    window.location.replace('/group/'+inc.groupLower);
		    //window.location.replace('/predict');
		}
		else {
		    $scope.feedback=inc.message;
		}
		console.log("done");
	    });
    };

}]);
