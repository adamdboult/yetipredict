/*global jQuery:false */
/*jshint browser:true */
/*global angular:false */
/*global $:false */

var myApp = angular.module("myApp", []);

myApp.directive("ngConfirmClick", [
  function () {
    return {
      link: function (scope, element, attr) {
        var msg = attr.ngConfirmClick || "Are you sure?";
        var clickAction = attr.confirmedClick;
        element.bind("click", function (event) {
          if (window.confirm(msg)) {
            scope.$eval(clickAction);
          }
        });
      },
    };
  },
]);

myApp.controller("mainController", [
  "$rootScope",
  "$scope",
  "$http",
  "$window",
  function ($rootScope, $scope, $http, $window) {
    "use strict";
    console.log("USING THE RIGHT ONE");
    $scope.updateMembers = function () {
      var toSend = { group: group, user: $scope.memberToAdd };
      $http
        .get("/updateMembers/" + encodeURIComponent(JSON.stringify(toSend)))
        .then(function (inc) {
          var inc = response.data;
          if (inc.success) {
            console.log("reload");
            location.reload();
          } else {
            $scope.feedback = inc.message;
          }
        });
    };

    $scope.deleteMember = function (member) {
      console.log("removing: " + member);
      var toRemoveObject = {};
      toRemoveObject.user = member;
      toRemoveObject.group = group;
      var toRemove = JSON.stringify(toRemoveObject);
      $http.get("/removeMember/" + toRemove).then(function (response) {
        location.reload();
      });
    };

    $scope.deleteGroup = function () {
      console.log("deleting");
      var toDeleteObject = {};
      toDeleteObject.group = group;
      var toDelete = encodeURIComponent(JSON.stringify(toDeleteObject));
      $http.get("/deleteGroup/" + toDelete).then(function (response) {
        var inc = response.data;
        $window.location.href = "/predict";
        console.log("resonse is: " + JSON.stringify(inc));
      });
    };
  },
]);
