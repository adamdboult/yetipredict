var myApp = angular.module("myApp", []);

myApp.controller("mainController", [
  "$rootScope",
  "$scope",
  "$http",
  "$window",
  function ($rootScope, $scope, $http, $window) {
    console.log("hi: " + localData);
    $scope.currentGroup = localData;

    $scope.submit = function () {
      var toSubmit = {};
      toSubmit.prediction = $scope.desc;
      if ($scope.end) {
        toSubmit.end = new Date($scope.end);
      } else {
        toSubmit.end = null;
      }
      toSubmit.group = $scope.currentGroup;
      toSubmit.answers = $scope.answers; //.split(';');
      if ($scope.verbose) {
        toSubmit.verbose = $scope.verbose;
      } else {
        toSubmit.verbose = null;
      }
      if ($scope.source) {
        toSubmit.source = $scope.source;
      } else {
        toSubmit.source = null;
      }

      console.log("sending: " + JSON.stringify(toSubmit));
      var toSubmitString = encodeURIComponent(JSON.stringify(toSubmit));
      //$http.post('/newpredict',toSubmitString)
      console.log("toSubmitString: " + toSubmitString);
      $http.get("/newpredictsend/" + toSubmitString).then(function (response) {
        var inc = response.data;
        $scope.feedback = inc.message;
        if (inc.success) {
          //console.log('/group/'+makeLower($scope.currentGroup)+"/"+makeLower(toSubmit.desc));
          window.location.replace(
            "/group/" + inc.groupLower + "/" + inc.predictionLower,
          );
        } else {
          $scope.feedback = inc.message;
        }
        console.log("done");
        //		window.location.href = 'predict';
      });
    };
  },
]);
