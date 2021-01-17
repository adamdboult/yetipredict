/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module('myApp', []);

myApp.controller('mainController',['$rootScope','$scope', '$http','$window', function($rootScope,$scope, $http,$window){
    "use strict";
    $scope.userList=[];
    $scope.getUsers=function(){
	$http.get('/getUserList')
	    .success(function(inc){
		$scope.userList=inc.users;
	    });
    };
    $scope.getUsers();
    $scope.deleteUser=function(user){
	var toSend={};
	toSend.user=user;
	var toSubmitString=encodeURIComponent(JSON.stringify(toSend));
	$http.get('/deleteUser/'+toSubmitString)
	    .success(function(inc){
		location.reload();
	    });
    };
}]);
