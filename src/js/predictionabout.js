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
    $scope.master = {};
    $scope.currentGroup = localData;
    $scope.currentArray = localArra;
    $scope.members = members;
    //$scope.verbose=verbose;
    //$scope.verboseUpdate=verboseUpdate;

    //if (typeof answers !== "undefined"){
    //	$scope.aboutAnswers=answers;
    //}
    $scope.aboutAnswers = [];

    $scope.declareYesToggle = [];
    $scope.declareNoToggle = [];
    $scope.declareOpenToggle = [];

    if (typeof outcomes !== "undefined") {
      console.log("outcomes: " + JSON.stringify(outcomes));
      var outcomestemp = {};
      var i, j;
      for (i = 0; i < outcomes.length; i++) {
        if (outcomes[i].outcome === 1) {
          outcomestemp[outcomes[i].answer] = "True!";
        } else if (outcomes[i].outcome === 0) {
          outcomestemp[outcomes[i].answer] = "False!";
        } else {
          outcomestemp[outcomes[i].answer] = "";
        }
      }
      console.log("temp" + JSON.stringify(outcomestemp));
      console.log("ANSWERS" + JSON.stringify(answers));
      for (i = 0; i < answers.length; i++) {
        $scope.declareYesToggle[i] = 0;
        $scope.declareNoToggle[i] = 0;
        $scope.declareOpenToggle[i] = 1;
        $scope.aboutAnswers[i] = {};
        $scope.aboutAnswers[i].value = "Open";
        $scope.aboutAnswers[i].name = answers[i];
        for (j = 0; j < outcomes.length; j++) {
          if (outcomes[j].answer === answers[i]) {
            if (outcomes[j].outcome === 1) {
              $scope.aboutAnswers[i].value = "True";
              $scope.declareOpenToggle[i] = 0;
              $scope.declareYesToggle[i] = 1;
            } else if (outcomes[j].outcome === 0) {
              $scope.aboutAnswers[i].value = "False";
              $scope.declareOpenToggle[i] = 0;
              $scope.declareNoToggle[i] = 1;
            }
          }
        }
      }
      console.log("about answers" + JSON.stringify($scope.aboutAnswers));
    }
    console.log("members: " + members);
    $http.get("/getUserName").then(function (response) {
      var name = response.data;
      $scope.userName = name.username;
    });

    $scope.declareAnswer = function (declareAnswer, declareOutcome) {
      var toSend = {
        group: localData,
        prediction: predictionAbout,
        answer: declareAnswer.name,
        outcome: declareOutcome,
      };
      var toSendString = encodeURIComponent(JSON.stringify(toSend));
      console.log("sending: " + JSON.stringify(toSend));
      $http.get("/declareAnswer/" + toSendString).then(function (response) {
        location.reload();
      });
    };

    $scope.sendUpdate = function () {
      var toSendObject = {};
      toSendObject.comment = $scope.commentInput;
      toSendObject.group = $scope.currentGroup;
      toSendObject.prediction = predictionAbout;
      var toSendString = encodeURIComponent(JSON.stringify(toSendObject));
      console.log("sending: " + toSendString);
      $http.get("/sendUpdate/" + toSendString).then(function (response) {
        var inc = response.data;
        if (inc.success) {
          location.reload();
        } else {
          $scope.feedback = inc.message;
        }
      });
    };

    $scope.deletePrediction = function () {
      var toDeleteObject = {};
      toDeleteObject.prediction = predictionAbout;
      toDeleteObject.group = $scope.currentGroup;
      var toDelete = encodeURIComponent(JSON.stringify(toDeleteObject));
      $http.get("/deleteGraph/" + toDelete).then(function (response) {
        $window.location.href = "/predict";
      });
    };

    $scope.deleteMember = function (member) {
      var toRemoveObject = {};
      toRemoveObject.member = member;
      toRemoveObject.group = $scope.currentGroup;
      var toRemove = JSON.stringify(toRemoveObject);
      $http.get("/removeMember/" + toRemove).then(function (response) {
        location.reload();
      });
    };

    $scope.updateMembers = function () {
      var toSend = { group: $scope.currentGroup, name: $scope.memberToAdd };
      $http
        .get("/updateMembers/" + encodeURIComponent(JSON.stringify(toSend)))
        .then(function (response) {
          var inc = response.data;
          if (inc.success) {
            location.reload();
          } else {
            $scope.feedback = inc.message;
          }
        });
    };

    $scope.graphMeta = {};

    $scope.selectGraph = function (key) {
      console.log("key" + JSON.stringify(key));
      var reqPredictionObject = {};
      reqPredictionObject.prediction = key;
      reqPredictionObject.group = $scope.currentGroup;
      var reqPredictionString = encodeURIComponent(
        JSON.stringify(reqPredictionObject),
      );
      $http
        .get("/predictData/" + reqPredictionString)
        .then(function (response) {
          var inc = response.data;
          $scope.users = inc.users;
          $scope.predNameForLink = inc.ldesc;
          $scope.outcomes = {};
          var i;
          for (i = 0; i < inc.outcomes.length; i++) {
            $scope.outcomes[inc.outcomes[i].answer] = inc.outcomes[i].outcome;
          }
          $scope.answers = inc.answers;
          $scope.headline = inc.headline;
          for (i = 0; i < inc.comment.length; i++) {
            inc.comment[i].date = new Date(inc.comment[i].date).toDateString();
          }
          $scope.comments = inc.comment;
          $scope.graphMeta.author = inc.author;
          $scope.deleteShow = 0;

          $scope.verbose = inc.verbose;
          if (
            $scope.userName === $scope.graphMeta.author ||
            $scope.userName === "admin"
          ) {
            $scope.deleteShow = 1;
          }
          $scope.graphMeta.group = inc.group;
          $scope.graphMeta.end = new Date(inc.end).toDateString();
          $scope.graphMeta.source = inc.source;
        });
    };
    $scope.selectGraph(predictionAbout);
  },
]);
