//var express=require('express');

var regexObject = {
  alphanum: /^[a-zA-Z0-9]+$/,
  //special: /^[a-zA-Z0-9£\$€%;\.\+#@\? \-]+$/,
  special: /^[a-zA-Z0-9£$€%;.+#@? -]+$/, // "-" moved to the end of the set
  num: /^\d*\.?\d*$/,
  makeLower: /[^a-z0-9_-]+/g,
  username: /^[a-z0-9_-]{3,15}$/,
};

module.exports = function (app) {
  var PredictSerie = require(__dirname + "/../models/predict");
  var GroupSerie = require(__dirname + "/../models/group");
  var User = require(__dirname + "/../models/user");

  //var rootObject = { root: __dirname + "/../../public" };

  var validationCheck = {
    val: {
      name: "val",
      len: 100,
      chars: "num",
      required: true,
    },
    group: {
      name: "group",
      len: 100,
      chars: "special",
      required: true,
    },
    answer: {
      name: "answer",
      len: 100,
      chars: "special",
      required: true,
    },
    prediction: {
      name: "prediction",
      len: 100,
      chars: "special",
      required: true,
    },
    verbose: {
      name: "verbose",
      len: 5000,
      chars: "special",
      required: false,
    },
    answers: {
      name: "answers",
      len: 1000,
      chars: "special",
      required: true,
    },
    end: {
      name: "end",
      len: 1000,
      chars: "date",
      required: false,
    },
    source: {
      name: "source",
      len: 1000,
      chars: "special",
      required: false,
    },
    open: {
      name: "open",
      len: 1000,
      chars: "alphanum",
      required: true,
    },
    outcome: {
      name: "outcome",
      len: 5000,
      chars: "special",
      required: true,
    },
    comment: {
      name: "comment",
      len: 5000,
      chars: "special",
      required: true,
    },
    commentID: {
      name: "commentID",
      len: 5000,
      chars: "special",
      required: true,
    },
    up: {
      name: "up",
      len: 5000,
      chars: "special",
      required: true,
    },
    user: {
      name: "user",
      len: 5000,
      chars: "username",
      required: true,
    },
  };

  function voteFunction(req, group, prediction, up) {
    var findObject = {};
    group = makeLower(group);
    prediction = makeLower(prediction);
    findObject.group = group;
    findObject.ldesc = prediction;
    if (group === "personal") {
      findObject.author = req.user.local.username;
    }
    isMember(req, group, function (tf, groupProper) {
      if (tf && (up === -1 || up === 0 || up === 1)) {
        var findObjectAlready = JSON.parse(JSON.stringify(findObject));
        findObjectAlready["vote.name"] = req.user.local.username;
        var voteSend = {};
        var voteImpact;
        voteSend.name = req.user.local.username;
        voteSend.outcome = up;
        voteSend.date = new Date();
        PredictSerie.findOne(findObjectAlready, function (err, idwa) {
          var updateObject = {};
          if (idwa) {
            var voteNames = [];
            for (var i = 0; i < idwa.vote.length; i++) {
              voteNames.push(idwa.vote[i].name);
            }
            var voteIndex = voteNames.indexOf(req.user.local.username);
            var previousVote = idwa.vote[voteIndex];
            voteImpact = up - previousVote.outcome;
          } else {
            voteImpact = up;
          }

          if (voteSend.outcome === 0) {
            updateObject = { $inc: { score: voteImpact } };
          } else {
            updateObject = {
              $inc: { score: voteImpact },
              $push: { vote: voteSend },
            };
          }
          PredictSerie.findOneAndUpdate(
            findObject,
            updateObject,
            { safe: true, upsert: true },
            function (err, result) {
              var groupFind = { lName: group };
              GroupSerie.findOneAndUpdate(
                groupFind,
                { $inc: { score: voteImpact } },
                { safe: true, upsert: true },
                function (err2, result2) {
                  updateObject = {
                    $pull: {
                      vote: {
                        name: req.user.local.username,
                        date: { $lt: voteSend.date },
                      },
                    },
                  };
                  PredictSerie.findOneAndUpdate(
                    findObject,
                    updateObject,
                    { safe: true, upsert: true },
                    function (err3, result3) {},
                  );
                },
              );
            },
          );
        });
      }
    });
  }

  function stripIncomingObject(params, metaArray) {
    var candidate,
      re,
      result,
      entry,
      keyUsed,
      parsedParams,
      accepted,
      valCheckObject;
    result = {};
    accepted = true;
    parsedParams = JSON.parse(decodeURI(params));
    for (entry in metaArray) {
      console.log("entry is: " + metaArray[entry]);
      keyUsed = metaArray[entry];
      candidate = parsedParams[keyUsed];
      valCheckObject = validationCheck[keyUsed];
      if (valCheckObject.len > 0) {
        console.log("going here this time");
        if (!candidate) {
          console.log("aelpha");
        } else if (candidate.length > valCheckObject.len) {
          console.log("fail bravo");
          accepted = false;
        }
      }
      if (typeof candidate === "undefined") {
        console.log("aperhere");
        console.log(candidate === false);
        if (valCheckObject.required) {
          console.log("sad face");
          accepted = false;
        }
      } else {
        console.log("or here...");
        if (valCheckObject.chars !== "any") {
          if (valCheckObject.chars === "alphanum") {
            //re=/^[a-zA-Z0-9]+$/;
            re = regexObject.alphanum;
            if (re.test(candidate) === false) {
              console.error("Uh oh. " + candidate + " failed on alphanum.");
              accepted = false;
            }
          } else if (valCheckObject.chars === "special") {
            //re=/^[a-zA-Z0-9£\$€%;\.\+#@\? -]+$/;
            re = regexObject.special;
            if (re.test(candidate) === false) {
              console.error("Uh oh. " + candidate + " failed on special.");
              accepted = false;
            }
          } else if (valCheckObject.chars === "num") {
            //re=/^\d*\.?\d*$/;
            re = regexObject.num;
            if (re.test(candidate) === false) {
              console.error("Uh oh. " + candidate + " failed on num.");
              accepted = false;
            }
            //} else if (valCheckObject.chars === "date") {
          } else if (valCheckObject.chars === "username") {
            re = regexObject.username;
            if (re.test(candidate) === false) {
              console.error("Uh oh. " + candidate + " failed on num.");
              accepted = false;
            }
          }
        }
      }
      result[keyUsed] = candidate;
    }
    if (accepted) {
      return result;
    } else {
      return undefined;
    }
  }

  function stripIncomingString(params) {
    var result;
    result = decodeURI(params);
    return result;
  }

  function renderJade(req, res, dest, renderHeader) {
    //var message = renderHeader.message;
    var group = makeLower(renderHeader.group);
    var privacy,
      verbose,
      admins = [],
      members = [];

    GroupSerie.findOne({ lName: group }, "name open verbose admins members")
      .exec()
      .then((idwa) => {
        console.log(1);
        let privacy, verbose, admins, members;
        if (idwa) {
          privacy = idwa.open;
          verbose = idwa.verbose;
          admins = idwa.admins;
          members = idwa.members;
          renderHeader.groupProper = idwa.name;
        } else {
          privacy = false;
          verbose = "";
          admins = [];
          members = [];
        }
        console.log(2);
        renderHeader.myAdmins = [];
        renderHeader.myMembers = [];
        if (req.user) {
          renderHeader.myAdmins = req.user.admins;
          renderHeader.myMembers = req.user.members;
        }
        console.log(3);
        // Wrap getGroupsPrivate in a promise
        return new Promise((resolve, reject) => {
          getGroupsPrivate(req, function (groupList) {
            resolve({ groupList, privacy, verbose, admins, members });
          });
        });
      })
      .then(({ groupList, privacy, verbose, admins, members }) => {
        console.log(4);
        renderHeader.ara = { array: groupList };
        renderHeader.open = privacy;
        renderHeader.verbose = verbose;
        renderHeader.admins = admins;
        renderHeader.members = members;
        if (req.user) {
          renderHeader.user = req.user;
          renderHeader.adminAccess = false;
          if (admins.indexOf(makeLower(req.user.local.username)) > -1) {
            renderHeader.adminAccess = true;
          }
          if (req.user.local.admin) {
            renderHeader.adminAccess = true;
          }
        }
        renderHeader.predictionAccess = false;
        console.log(5);
        if (renderHeader.prediction) {
          console.log(6);
          // Wrap predictionPermission in a promise
          return new Promise((resolve, reject) => {
            predictionPermission(
              req,
              group,
              renderHeader.prediction,
              function (tf) {
                if (tf) {
                  renderHeader.predictionAccess = true;
                }
                resolve();
              },
            );
          });
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        res.render(dest, renderHeader);
      })
      .catch((err) => {
        console.error(err);
        res.render("404", { url: req.url });
      });
  }

  function getGroupsRaw(fn) {
    function compare(a, b) {
      if (a.lName === "personal") {
        return -1;
      } else if (a.open > b.open) {
        return 1;
      } else if (a.open < b.open) {
        return -1;
      } else if (a.score > b.score) {
        return -1;
      } else if (a.score < b.score) {
        return 1;
      } else {
        return 0;
      }
    }

    GroupSerie.find({}, "score name lName open members")
      .exec()
      .then((idwa) => {
        idwa.sort(compare);
        fn(idwa);
      })
      .catch((err) => {
        console.error(err);
        // Optionally handle the error, e.g.:
        // fn([]); or res.status(500).json({ error: err });
      });
  }

  function isMember(req, group, cb) {
    var findObject = { lName: makeLower(group) };
    GroupSerie.findOne(findObject, "members open name")
      .exec()
      .then((idwa) => {
        if (idwa) {
          if (idwa.open) {
            cb(true, idwa.name);
          } else if (req.user) {
            if (idwa.members.indexOf(req.user.local.username) > -1) {
              cb(true, idwa.name);
            } else if (req.user.local.admin) {
              cb(true, idwa.name);
            } else {
              cb(false, idwa.name);
            }
          } else {
            cb(false, idwa.name);
          }
        } else {
          cb(false, "");
        }
      })
      .catch((err) => {
        // Handle errors as appropriate; here we simply return a failure
        cb(false, "");
      });
  }

  function isAdmin(req, group, cb) {
    if (req.user.local.admin) {
      cb(true);
    } else {
      var findObject = { lName: makeLower(group) };

      GroupSerie.findOne(findObject, "admins name")
        .exec()
        .then((idwa) => {
          if (idwa.admins.indexOf(req.user.local.username) > -1) {
            cb(true, idwa.name);
          } else {
            cb(false, idwa.name);
          }
        })
        .catch((err) => {
          cb(false, "");
        });
    }
  }

  function isAdminMaster(req, cb) {
    if (req.user.local.admin) {
      cb(true);
    } else {
      cb(false);
    }
  }

  function predictionPermission(req, group, prediction, cb) {
    if (req.user) {
      var useGroup = makeLower(group);
      if (req.user.local.admin) {
        cb(true);
      } else if (useGroup === "personal") {
        cb(true);
      } else {
        var usePrediction = makeLower(prediction);
        var findObject = { lName: useGroup };

        GroupSerie.findOne(findObject, "admins")
          .exec()
          .then((groupResult) => {
            if (groupResult.admins.indexOf(req.user.local.username) > -1) {
              cb(true);
              // Return a resolved promise so that the next .then() knows not to proceed
              return Promise.resolve(null);
            } else {
              // Proceed with the nested query
              return PredictSerie.findOne(
                { ldesc: usePrediction, group: useGroup },
                "lauthor",
              ).exec();
            }
          })
          .then((predictResult) => {
            // If we already handled the response (returned null), do nothing.
            if (predictResult === null) return;

            if (predictResult.lauthor === req.user.local.username) {
              cb(true);
            } else {
              cb(false);
            }
          })
          .catch((err) => {
            // On any error, simply call cb(false)
            cb(false);
          });
      }
    } else {
      cb(false);
    }
  }

  function getGroupsLower(fn) {
    getGroupsRaw(function (groups) {
      var groupList = [];
      var group;
      var candidate;
      for (group in groups) {
        candidate = groups[group];
        if (groupList.indexOf(candidate.lName) === -1) {
          groupList.push(candidate.lName);
        }
      }
      fn(groupList);
    });
  }

  function getGroupsPrivate(req, fn) {
    getGroupsRaw(function (groups) {
      var groupList = [];
      var groupObjects = [];
      var candidate;
      var userCheck;
      var adminCheck;
      if (req.user) {
        userCheck = req.user.local.username;
        adminCheck = req.user.local.admin;
      }
      var group;
      var objectCandidate = {};
      for (group in groups) {
        candidate = groups[group];
        if (
          groupList.indexOf(candidate.name) === -1 &&
          (candidate.open === true ||
            candidate.members.indexOf(userCheck) > -1 ||
            adminCheck)
        ) {
          groupList.push(candidate.name);
          objectCandidate = {};
          objectCandidate.name = candidate.name;
          objectCandidate.open = candidate.open;
          objectCandidate.personal = false;
          objectCandidate.lName = candidate.lName;
          if (candidate.name === "Personal") {
            objectCandidate.personal = true;
            if (req.user) {
              groupObjects.push(objectCandidate);
            }
          } else {
            groupObjects.push(objectCandidate);
          }
        }
      }
      if (!req.user) {
        groupList.splice(groupList.indexOf("Personal"), 1);
      }
      fn(groupObjects);
    });
  }

  function groupsInit() {
    GroupSerie.findOne({ lName: "personal" }, "lName")
      .exec()
      .then((idwa) => {
        if (!idwa) {
          const groupObj = {
            name: "Personal",
            lName: "personal",
            open: true,
            score: 0,
          };
          const groupReceive = new GroupSerie(groupObj);
          return groupReceive.save();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  groupsInit();

  function getUsers(fn) {
    User.find({}, "local")
      .exec()
      .then((idwa) => {
        var userList = [];
        for (var x in idwa) {
          userList.push(idwa[x].local.username);
        }
        fn(userList);
      })
      .catch((err) => {
        console.error(err);
        // Optionally handle error, e.g., call fn([]) or similar.
      });
  }

  app.get("/newgroup", function (req, res) {
    if (req.isAuthenticated() === false) {
      res.redirect("/signup");
    } else {
      var renderHeader = {};
      renderHeader.message = "";
      renderHeader.group = "";
      renderJade(req, res, "newgroup", renderHeader);
    }
  });

  app.get("/getUserList", function (req, res) {
    var group;
    //isAdmin(req,group,function(tf){
    //    if(tf){
    getUsers(function (inc) {
      res.json({ users: inc });
    });
    //    }
    //    else{
    //	res.json({message:"error"});
    //    }
    //});
  });

  app.get("/users", function (req, res) {
    var group;
    //isAdmin(req,group,function(tf){
    //  if(tf){
    var renderHeader = {};
    renderHeader.message = "";
    renderHeader.group = "";
    renderJade(req, res, "users", renderHeader);
    //    }
    //    else{
    //	res.redirect('/');
    //    }
    //});
  });

  app.get("/getUserName", function (req, res) {
    if (req.user === undefined) {
      res.json({});
    } else {
      res.json({ username: req.user.local.username });
    }
  });

  /*app.get('/predict', function(req, res) {
	var renderHeader={};
	renderHeader.message="";
	renderHeader.group="";
	renderJade(req,res,'predict',renderHeader);
    });*/

  //    app.get('/predict', function(req,res) {
  //	res.redirect('/predict?page=0');
  //  });

  function predictionsOrGroup(req, res, renderHeader, template) {
    getGroupsPrivate(req, function (groupList) {
      var group;
      var groupArray = [];
      var pagelen = 20;
      var pagenum = 0;
      if (req.query.page) {
        pagenum = req.query.page;
      }
      var sortBy = "score";
      if (req.query.sort) {
        if (req.query.sort === "score") {
          sortBy = "score";
        } else if (req.query.sort === "date") {
          sortBy = "date";
        }
      }
      for (group in groupList) {
        if (groupList[group].lName !== "personal") {
          groupArray.push(groupList[group].lName);
        }
      }
      var predictionFind = {};
      //complete find allows queries to only return complete predcitions or incomplete predictions. 1 is only completes, 0 only incomplete and -1 all
      var completeFind = -1;
      var completeFindURL = -1;
      if (req.query.complete) {
        if (parseInt(req.query.complete) === 1) {
          completeFind = true;
          completeFindURL = 1;
        }
        if (parseInt(req.query.complete) === 0) {
          completeFind = false;
          completeFindURL = 0;
        }
      }
      var groupFind;
      var personalFind;
      var send = 1;
      if (renderHeader.group === "") {
        groupFind = { group: { $in: groupArray } };
        //if (completeFind === -1) {
        //} else {
        //  groupFind.complete = completeFind;
        //}
        if (completeFind !== -1) {
          groupFind.complete = completeFind;
        }
        if (req.user) {
          personalFind = { group: "personal", author: req.user.local.username };
          if (completeFind !== -1) {
            personalFind.complete = completeFind;
          }
          predictionFind = { $or: [groupFind, personalFind] };
        } else {
          predictionFind = groupFind;
        }
      } else if (groupArray.indexOf(renderHeader.group) > -1) {
        predictionFind = { group: renderHeader.group };
        if (completeFind !== -1) {
          predictionFind.complete = completeFind;
        }
      } else if (renderHeader.group === "personal") {
        if (req.user) {
          predictionFind = { group: renderHeader.group };
          predictionFind.author = req.user.local.username;
          if (completeFind !== -1) {
            predictionFind.complete = completeFind;
          }
        } else {
          send = 0;
        }
      } else {
        send = 2;
      }
      if (send === 1) {
        console.log("DAT" + sortBy);
        var sortObj = { complete: 1, start: -1 };
        if (sortBy === "score") {
          sortObj = { complete: 1, score: -1 };
        }
        console.log(sortBy === "score");
        console.log(sortBy === "date");

        PredictSerie.countDocuments(predictionFind)
          .exec()
          .then((edw1) => {
            return PredictSerie.find(predictionFind)
              .sort(sortObj)
              .skip(pagenum * pagelen)
              .limit(pagelen)
              .select(
                "desc score ldesc group groupProper open start complete outcomes headline",
              )
              .exec()
              .then((idw) => ({ edw1, idw }));
          })
          .then(({ edw1, idw }) => {
            renderHeader.thisPage = parseInt(pagenum);
            renderHeader.totalPages = Math.ceil(edw1 / pagelen);
            renderHeader.predictionsArray = idw;
            renderHeader.sortURL = "sort=" + sortBy;
            renderHeader.completeURL = "complete=" + completeFindURL;
            renderHeader.nextPage =
              "?page=" +
              (parseInt(pagenum) + 1) +
              "&sort=" +
              sortBy +
              "&complete=" +
              completeFindURL;
            renderHeader.previousPage =
              "?page=" +
              parseInt(pagenum - 1) +
              "&sort=" +
              sortBy +
              "&complete=" +
              completeFindURL;
            renderJade(req, res, template, renderHeader);
          })
          .catch((err) => {
            res.send(err);
          });
      } else {
        if (send === 0) {
          res.redirect("/signup");
        } else {
          res.redirect("/nopermission/" + renderHeader.group);
        }
      }
    });
  }

  app.get("/predict", function (req, res) {
    var renderHeader = {};
    renderHeader.message = "";
    renderHeader.group = "";
    //var doc;
    predictionsOrGroup(req, res, renderHeader, "predict");
  });

  app.get("/group/:group", function (req, res) {
    var renderHeader = {};
    renderHeader.message = "";
    //renderHeader.group="";
    renderHeader.group = makeLower(req.params.group);
    //var doc;
    predictionsOrGroup(req, res, renderHeader, "group");
  });

  app.get("/grouplist", function (req, res) {
    var renderHeader = {};
    renderHeader.message = "";
    renderHeader.group = "";
    renderJade(req, res, "grouplist", renderHeader);
  });

  function Comparator(a, b) {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  }

  app.get("/sub/:id", isLoggedIn, function (req, res) {
    var metaArray = ["val", "group", "answer", "prediction"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var datetime = new Date();
      reqObject.name = req.user.local.username;
      reqObject.date = datetime;
      reqObject.weight = 0.5;

      var findObject = {};
      findObject.group = makeLower(reqObject.group);
      findObject.ldesc = makeLower(reqObject.prediction);
      if (makeLower(reqObject.group) === "personal") {
        findObject.author = req.user.local.username;
      }

      var predictionStrip = {};
      predictionStrip.val = reqObject.val;
      predictionStrip.weight = reqObject.weight;
      predictionStrip.name = reqObject.name;
      predictionStrip.date = reqObject.date;
      predictionStrip.answer = reqObject.answer;
      var i, j;
      isMember(req, reqObject.group, function (tf, groupProper) {
        if (
          reqObject.val >= 0 &&
          reqObject.val <= 1 &&
          reqObject.name &&
          reqObject.group &&
          tf
        ) {
          PredictSerie.findOne(findObject)
            .exec()
            .then((idwa) => {
              if (!idwa) {
                console.log("sending 2");
                res.json({});
                // Return a resolved promise to short‐circuit the rest of the chain.
                return Promise.resolve(null);
              }

              // Determine if this prediction is allowed.
              let allowed = true;
              for (let i = 0; i < idwa.outcomes.length; i++) {
                if (
                  idwa.outcomes[i].answer === predictionStrip.answer &&
                  idwa.outcomes[i] > -1
                ) {
                  allowed = false;
                  break;
                }
              }

              // Build the highLightObject and update headline value.
              const highLightObject = {};
              const dataResponse = idwa.data;
              dataResponse.push(predictionStrip);
              for (let j = 0; j < dataResponse.length; j++) {
                if (dataResponse[j].answer === predictionStrip.answer) {
                  if (highLightObject[dataResponse[j].name]) {
                    if (
                      new Date(dataResponse[j].date) >
                      new Date(highLightObject[dataResponse[j].name][1])
                    ) {
                      highLightObject[dataResponse[j].name] = [
                        dataResponse[j].val,
                        new Date(dataResponse[j].date),
                      ];
                    }
                  } else {
                    highLightObject[dataResponse[j].name] = [
                      dataResponse[j].val,
                      new Date(dataResponse[j].date),
                    ];
                  }
                }
              }
              let meanTotal = 0;
              let meanCount = 0;
              for (let useName in highLightObject) {
                meanCount++;
                meanTotal += highLightObject[useName][0];
              }
              const mean = meanTotal / meanCount;
              const headlineUpdate = idwa.headline;
              const position = idwa.answers.indexOf(predictionStrip.answer);
              headlineUpdate[position] = mean;

              if (!allowed) {
                console.log("sending 1");
                res.json({});
                return Promise.resolve(null);
              }

              // If allowed, update the PredictSerie document.
              return PredictSerie.findOneAndUpdate(
                findObject,
                {
                  $push: { data: predictionStrip },
                  $set: { headline: headlineUpdate },
                  $addToSet: { users: reqObject.name },
                },
                { safe: true, upsert: true },
              ).exec();
            })
            .then((result) => {
              // If result is null then we already sent a response.
              if (!result) return;

              const voteRequestPartial = {
                up: 1,
                group: findObject.group,
                prediction: findObject.ldesc,
              };
              req.params.id = JSON.stringify(voteRequestPartial);
              voteFunction(req, findObject.group, findObject.ldesc, 1);

              const userFind = { "local.username": reqObject.name };
              return User.findOneAndUpdate(
                userFind,
                {
                  $addToSet: {
                    groups: findObject.group,
                    predictions: findObject.group + "&" + findObject.ldesc,
                    groupsProper: groupProper,
                    predictionsProper: findObject.group + "&" + result.desc,
                  },
                },
                { safe: true, upsert: true },
              ).exec();
            })
            .then((result0) => {
              if (result0) {
                console.log("sending 0");
                res.json({});
                console.log("sent 0");
              }
            })
            .catch((err) => {
              console.error(err);
              res.json({});
            });
        } else {
          console.log("sending 3");
          res.json({ message: "Invalid number" });
        }
      });
    }
  });

  app.get("/removeMember/:id", function (req, res) {
    //var keyArray=['group','member'];
    /*var metaArray=[
	    {
		"name": "group",
		"len": 100,
		"chars": "special",
		"required":true
	    },
	    {
		"name": "member",
		"len": 100,
		"chars": "special",
		"required":true
	    }
	];*/
    var metaArray = ["group", "user"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var findObject = { lName: makeLower(reqObject.group) };
      var name = makeLower(reqObject.user);
      //var permission = false;
      isAdmin(req, reqObject.group, function (tf, groupProper) {
        if (tf) {
          GroupSerie.findOne(findObject, "members")
            .exec()
            .then((groupResult) => {
              if (
                groupResult.members.indexOf(name) > -1 &&
                name !== "admin" &&
                name !== req.user.local.username
              ) {
                const findUser = { "local.username": name };
                return User.findOneAndUpdate(
                  findUser,
                  {
                    $pull: {
                      predictions: { $regex: findObject.lName + "&.*" },
                      predictionsAdmin: { $regex: findObject.lName + "&.*" },
                      groups: findObject.lName,
                      admins: findObject.lName,
                      predictionsProper: { $regex: findObject.lName + "&.*" },
                      predictionsAdminProper: {
                        $regex: findObject.lName + "&.*",
                      },
                      groupsProper: groupProper,
                      adminsProper: groupProper,
                    },
                  },
                  { safe: true, upsert: true },
                ).exec();
              } else {
                res.json({ message: "already a member" });
                // Return null to short-circuit the chain
                return Promise.resolve(null);
              }
            })
            .then((updatedUser) => {
              // If a response has already been sent, stop processing.
              if (res.headersSent) return Promise.resolve(null);
              if (!updatedUser) {
                res.json({ message: "no such member" });
                return Promise.resolve(null);
              }
              return GroupSerie.findOneAndUpdate(
                findObject,
                { $pull: { members: name } },
                { safe: true, upsert: true },
              ).exec();
            })
            .then((result) => {
              if (!res.headersSent && result) {
                res.json({ success: true });
              }
            })
            .catch((err) => {
              if (!res.headersSent) {
                res.json({ message: "Error" });
              }
            });
        }
      });
    }
  });

  app.get("/updateMembers/:id", function (req, res) {
    var metaArray = ["group", "user"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      //	var keyArray=['group','name'];
      //	incoming=stripIncoming(req.params.id,keyArray);
      var findObject = { lName: makeLower(reqObject.group) };
      var newName = makeLower(reqObject.user);
      //var permission = false;
      isAdmin(req, findObject.lName, function (tf, groupProper) {
        if (tf) {
          GroupSerie.findOne(findObject, "members")
            .exec()
            .then((groupResult) => {
              if (
                groupResult.members.indexOf(newName) === -1 &&
                newName !== "admin"
              ) {
                const findUser = { "local.username": newName };
                return User.findOneAndUpdate(
                  findUser,
                  {
                    $addToSet: {
                      groups: findObject.lName,
                      groupsProper: groupProper,
                    },
                  },
                  { safe: true, upsert: true },
                )
                  .exec()
                  .then((userResult) => {
                    if (userResult) {
                      return GroupSerie.findOneAndUpdate(
                        findObject,
                        { $push: { members: newName } },
                        { safe: true, upsert: true },
                      ).exec();
                    } else {
                      res.json({ message: "no such member" });
                      // Return null to break out of the chain
                      return Promise.resolve(null);
                    }
                  });
              } else {
                res.json({ message: "already a member" });
                return Promise.resolve(null);
              }
            })
            .then((finalResult) => {
              // Only send success if we got a result from the last update.
              if (finalResult !== null) {
                res.json({ success: true });
              }
            })
            .catch((err) => {
              res.json({ message: "Error" });
            });
        }
      });
    }
  });

  app.get("/newpredictsend/:id", function (req, res) {
    if (req.isAuthenticated() === false) {
      res.redirect("/signup");
    } else {
      var metaArray = [
        "verbose",
        "group",
        "answers",
        "prediction",
        "end",
        "source",
      ];
      var reqObject = stripIncomingObject(req.params.id, metaArray);
      if (!reqObject) {
        res.json({ message: "Submission not valid" });
      } else {
        isMember(req, reqObject.group, function (tf, groupProper) {
          //var desc=cleanStringPred(incoming.prediction);
          var desc = reqObject.prediction;
          var verbose = reqObject.verbose;
          var end = new Date(reqObject.end);
          var answersSplit = reqObject.answers.split(";");
          var answers = [];
          var outcomes = [];
          var i;
          for (i = 0; i < answersSplit.length; i++) {
            answers.push(answersSplit[i]);
            outcomes.push({
              answer: answersSplit[i],
              outcome: -1,
              decider: makeLower(req.user.local.username),
              decideDate: new Date(),
              decideVerbose: "",
            });
          }
          var headline = [];
          for (i = 0; i < answers.length; i++) {
            headline[i] = -1;
          }
          var source = reqObject.source;
          var group = makeLower(reqObject.group);
          var ldesc = makeLower(desc);
          var dateMin = new Date();
          var dateMax = new Date();

          var newYear = dateMin.getFullYear() + 50;
          var open = true;
          var anon = false;
          dateMax.setFullYear(newYear);
          if (end > dateMax) {
            end = dateMax;
          }
          if (desc && group && tf) {
            var prediction = {
              ldesc: ldesc,
              score: 0,
              group: group,
              groupProper: groupProper,
              desc: desc,
              author: req.user.local.username,
              lauthor: makeLower(req.user.local.username),
              start: new Date(),
              end: end,
              min: 0,
              max: 1,
              scale: 0.01,
              complete: false,
              users: [makeLower(req.user.local.username)],
              source: source,
              data: [],
              outcomes: outcomes,
              answers: answers,
              headline: headline,
              verbose: verbose,
              textOnly: false,
              open: open,
              anon: anon,
            };
            var findObject = {
              ldesc: prediction.ldesc,
              group: prediction.group,
            };
            if (prediction.group === "personal") {
              findObject.author = req.user.local.username;
            }
            if (makeLower(prediction.group) === "personal") {
              findObject.author = req.user.local.username;
            }

            PredictSerie.findOne(findObject)
              .exec()
              .then((idw) => {
                if (idw) {
                  res.send({ message: "already exists" });
                  // Return null to short-circuit the chain.
                  return Promise.resolve(null);
                } else {
                  const predictReceive = new PredictSerie(prediction);
                  return predictReceive.save();
                }
              })
              .then((predictReceive) => {
                if (!predictReceive) return;
                const voteRequestPartial = {
                  up: 1,
                  group: prediction.group,
                  prediction: prediction.ldesc,
                };
                req.params.id = JSON.stringify(voteRequestPartial);
                voteFunction(req, findObject.group, findObject.ldesc, 1);
                res.send({
                  success: true,
                  predictionLower: prediction.ldesc,
                  groupLower: prediction.group,
                });
                const userFind = {
                  "local.username": makeLower(req.user.local.username),
                };
                return User.findOneAndUpdate(
                  userFind,
                  {
                    $addToSet: {
                      groups: prediction.group,
                      predictions: prediction.group + "&" + prediction.ldesc,
                      predictionsAdmin:
                        prediction.group + "&" + prediction.ldesc,
                      groupsProper: groupProper,
                      predictionsProper:
                        prediction.group + "&" + prediction.desc,
                      predictionsAdminProper:
                        prediction.group + "&" + prediction.desc,
                    },
                  },
                  { safe: true, upsert: true },
                ).exec();
              })
              .catch((err) => {
                // This catch handles errors from either the findOne or save operations.
                res.send({ message: "oops" });
              });
          } else {
            res.send({ message: "incomplete" });
          }
        });
      }
    }
  });

  app.get("/newgroupsend/:id", function (req, res) {
    if (req.isAuthenticated() === false) {
      res.redirect("/signup");
    } else {
      console.log("start");
      var metaArray = ["verbose", "group", "open"];
      console.log("PARAMS: " + req.params.id);
      var reqObject = stripIncomingObject(req.params.id, metaArray);
      console.log("obj: " + JSON.stringify(reqObject));
      if (!reqObject) {
        res.json({ message: "Data not valid" });
      } else {
        console.log("doing this...");
        //incoming=stripIncoming(req.params.id,keyArray);
        getGroupsLower(function (groupList) {
          //var group=cleanString(incoming.group);
          var group = reqObject.group;
          var open = reqObject.open;
          var verbose = reqObject.verbose;
          var lName = makeLower(group);
          var createdDate = new Date();
          console.log("now");
          if (group && groupList.indexOf(lName) === -1) {
            console.log("and");
            var groupObj = {};
            groupObj.name = group;
            groupObj.score = 0;
            groupObj.lName = lName;
            groupObj.open = open;
            groupObj.admins = [makeLower(req.user.local.username)];
            groupObj.members = [makeLower(req.user.local.username)];
            groupObj.verbose = verbose;
            groupObj.created = createdDate;
            var groupReceive = new GroupSerie(groupObj);
            
groupReceive
  .save()
  .then((groupReceived) => {
    console.log("good");
    res.send({ success: true, groupLower: groupObj.lName });
    const userFind = { "local.username": makeLower(req.user.local.username) };

    // You can also chain the update if needed, or simply fire and forget.
    User.findOneAndUpdate(
      userFind,
      {
        $addToSet: {
          admins: lName,
          groups: lName,
          adminsProper: groupReceived.name,
          groupsProper: groupReceived.name,
        },
      },
      { safe: true, upsert: true }
    ).exec().catch((err0) => {
      // Optionally log update errors here
      console.error("Error updating user:", err0);
    });
  })
  .catch((err) => {
    console.log("bad");
    res.send({ message: "went wrong" });
  });
            
            
          } else {
            res.json({ message: "already exists" });
          }
        });
      }
    }
  });

  app.get("/predictData/:id", function (req, res) {
    console.log("incoming predictionr request");
    var metaArray = ["prediction", "group"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var findObject = { ldesc: makeLower(reqObject.prediction) };
      findObject.group = makeLower(reqObject.group);
      var nameCheck;
      //var adminCheck;
      if (req.user) {
        nameCheck = req.user.local.username;
        adminCheck = req.user.local.admin;
      }
      if (findObject.group === "personal") {
        findObject.author = nameCheck;
      }
      isMember(req, findObject.group, function (tf, groupProper) {
        if (tf) {
          PredictSerie.findOne(findObject)
            .exec()
            .then((idw) => {
              console.log("sending: " + JSON.stringify(idw));
              res.json(idw);
            })
            .catch((err) => {
              res.send(err);
            });
        } else {
          res.json({});
        }
      });
    }
  });

  app.get("/commentData/:id", function (req, res) {
    var metaArray = ["prediction", "group"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var findObject = { ldesc: makeLower(reqObject.prediction) };
      findObject.group = makeLower(reqObject.group);
      var nameCheck;
      var adminCheck;
      if (req.user) {
        nameCheck = req.user.local.username;
        //adminCheck = req.user.local.admin;
      }
      if (findObject.group === "personal") {
        findObject.author = nameCheck;
      }
      isMember(req, findObject.group, function (tf, groupProper) {
        if (tf) {
          PredictSerie.findOne(findObject)
            .exec()
            .then((idw) => {
              res.json(idw.comment);
            })
            .catch((err) => {
              res.send(err);
            });
        } else {
          res.json({});
        }
      });
    }
  });

  app.get("/getvote/:id", function (req, res) {
    console.log("getting vote");
    if (req.user) {
      var metaArray = ["prediction", "group"];
      var reqObject = stripIncomingObject(req.params.id, metaArray);
      if (!reqObject) {
        res.json({});
      } else {
        var findObject = {};
        findObject.ldesc = makeLower(reqObject.prediction);
        findObject.group = makeLower(reqObject.group);
        findObject["vote.name"] = req.user.local.username;
        if (findObject.group === "personal") {
          findObject.lauthor = makeLower(req.user.local.username);
        }

        PredictSerie.findOne(findObject)
          .exec()
          .then((idw) => {
            console.log("found vote: " + JSON.stringify(idw));
            if (!idw) {
              return res.json({ outcome: 0 });
            }
            const vote = idw.vote[0].outcome;
            return res.json({ outcome: vote });
          })
          .catch((err) => {
            res.send(err);
          });
      }
    } else {
      res.json({ outcome: 0 });
    }
  });

  app.get("/declareAnswer/:id", function (req, res) {
    var metaArray = ["prediction", "group", "answer", "outcome"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    var answerDeclared = reqObject.answer;
    if (!reqObject) {
      res.json({});
    } else {
      var prediction = makeLower(reqObject.prediction);
      var findObject = { ldesc: prediction };
      var group = makeLower(reqObject.group);
      findObject.group = group;
      var nameCheck;
      var adminCheck;
      if (req.user) {
        nameCheck = req.user.local.username;
        //adminCheck = req.user.local.admin;
      }
      if (makeLower(group) === "personal") {
        findObject.author = nameCheck;
      }
      predictionPermission(req, group, prediction, function (tf) {
        if (tf) {
          PredictSerie.findOne(findObject)
            .exec()
            .then((foundPrediction) => {
              // Extract outcomes and build an array of declared answers
              const outcomes = foundPrediction.outcomes;
              const answersAvailable = [];
              for (let i = 0; i < outcomes.length; i++) {
                answersAvailable.push(outcomes[i].answer);
              }
              const answerMatch = answersAvailable.indexOf(answerDeclared);
              let outcomebase = -1;
              if (answerMatch > -1) {
                outcomebase = foundPrediction.outcomes[answerMatch].outcome;
                foundPrediction.outcomes.splice(answerMatch, 1);
              }
              // Create the new/replacement outcome
              const newOutcome = {
                answer: answerDeclared,
                decider: nameCheck,
                decideDate: new Date(),
                decideVerbose: "",
                outcome:
                  reqObject.outcome === 1
                    ? 1
                    : reqObject.outcome === 0
                      ? 0
                      : -1,
              };

              // If no change in outcome, respond immediately
              if (outcomebase === newOutcome.outcome) {
                res.json({});
                return Promise.resolve(null);
              } else {
                foundPrediction.outcomes.push(newOutcome);
                let complete = true;
                for (let i = 0; i < outcomes.length; i++) {
                  if (outcomes[i].outcome === -1) {
                    complete = false;
                  }
                }
                if (foundPrediction.answers.length !== outcomes.length) {
                  complete = false;
                }
                foundPrediction.complete = complete;
                return foundPrediction.save();
              }
            })
            .then((savedPrediction) => {
              // If no update was needed, savedPrediction will be null
              if (!savedPrediction) return Promise.resolve(null);

              // Determine affected users based on the new answer
              const affectedUsers = [];
              for (let i = 0; i < savedPrediction.data.length; i++) {
                if (
                  affectedUsers.indexOf(savedPrediction.data[i].name) === -1 &&
                  savedPrediction.data[i].answer === answerDeclared
                ) {
                  affectedUsers.push(savedPrediction.data[i].name);
                }
              }

              // Build predictionData, allForMean, etc.
              const useData = savedPrediction.data;
              const predictionData = {};
              let allForMean = [];
              for (let entry = 0; entry < useData.length; entry++) {
                const xCandidate = new Date(useData[entry].date);
                const yCandidate = useData[entry].val;
                const nameCandidate = useData[entry].name;
                if (useData[entry].answer === answerDeclared) {
                  const toAdd = [yCandidate, xCandidate];
                  const toAddName = [yCandidate, xCandidate, nameCandidate];
                  if (predictionData[nameCandidate]) {
                    predictionData[nameCandidate].push(toAdd);
                  } else {
                    predictionData[nameCandidate] = [toAdd];
                  }
                  allForMean.push(toAddName);
                }
              }
              allForMean = allForMean.sort(Comparator);
              const startDate = allForMean[0][1];
              for (let entry in predictionData) {
                predictionData[entry].sort(Comparator);
              }
              const finishDate = new Date();
              const scoreObject = {};
              let meanScore;
              let rejectedCandidate;
              let nextDate, differenceDate;
              for (let userName in predictionData) {
                const meanInputObject = {};
                const meanData = [];
                for (let entry = 0; entry < allForMean.length; entry++) {
                  if (allForMean[entry][2] !== userName) {
                    meanInputObject[allForMean[entry][2]] =
                      allForMean[entry][0];
                    const useDate = new Date(allForMean[entry][1]);
                    let meanTotal = 0;
                    let meanCount = 0;
                    for (let useName in meanInputObject) {
                      meanCount++;
                      meanTotal += meanInputObject[useName];
                    }
                    const mean = meanTotal / meanCount;
                    if (allForMean[entry][1] > predictionData[userName][0][1]) {
                      meanData.push([mean, useDate, meanTotal, meanCount]);
                    } else {
                      rejectedCandidate = [mean, useDate, meanTotal, meanCount];
                    }
                  }
                }
                let firstPoint;
                if (meanData[0]) {
                  if (meanData[0][1] > predictionData[userName][0][1]) {
                    firstPoint = [0.5, predictionData[userName][0][1], 0.5, 1];
                  } else {
                    firstPoint = rejectedCandidate;
                    firstPoint[1] = predictionData[userName][0][1];
                  }
                } else {
                  if (allForMean[0][1] < predictionData[userName][0][1]) {
                    firstPoint = rejectedCandidate;
                    firstPoint[1] = predictionData[userName][0][1];
                  } else {
                    firstPoint = [0.5, predictionData[userName][0][1], 0.5, 1];
                  }
                }
                meanData.unshift(firstPoint);
                let totalWeight = 0;
                for (let i = 0; i < predictionData[userName].length; i++) {
                  if (i < predictionData[userName].length - 1) {
                    nextDate = predictionData[userName][i + 1][1];
                  } else {
                    nextDate = finishDate;
                  }
                  differenceDate = nextDate - predictionData[userName][i][1];
                  totalWeight +=
                    differenceDate * predictionData[userName][i][0];
                }
                const userScore =
                  totalWeight / (finishDate - predictionData[userName][0][1]);
                let totalMeanWeight = 0;
                for (let i = 0; i < meanData.length; i++) {
                  if (i < meanData.length - 1) {
                    nextDate = meanData[i + 1][1];
                  } else {
                    nextDate = finishDate;
                  }
                  differenceDate = nextDate - meanData[i][1];
                  totalMeanWeight += differenceDate * meanData[i][0];
                }
                meanScore = totalMeanWeight / (finishDate - meanData[0][1]);
                scoreObject[userName] =
                  (((userScore - meanScore) *
                    (finishDate - predictionData[userName][0][1])) /
                    (finishDate - startDate)) *
                  100;
                if (newOutcome.outcome === 0) {
                  scoreObject[userName] *= -1;
                }
              }
              // Pass along affectedUsers and scoreObject for the next stage.
              return { affectedUsers, scoreObject, newOutcome };
            })
            .then((result) => {
              if (!result) return Promise.resolve(null);
              const { affectedUsers, scoreObject, newOutcome } = result;
              const userFind = { "local.username": { $in: affectedUsers } };
              const outcomeToPush =
                newOutcome.outcome === 1
                  ? true
                  : newOutcome.outcome === 0
                    ? false
                    : undefined;
              const updateObject = {
                $pull: {
                  outcomes: {
                    answer: answerDeclared,
                    group: findObject.group,
                  },
                },
              };
              // Update users to remove previous outcomes
              return User.update(userFind, updateObject, { multi: true })
                .exec()
                .then(() => ({ userFind, outcomeToPush, scoreObject }));
            })
            .then((result) => {
              if (!result) return Promise.resolve(null);
              const { userFind, outcomeToPush, scoreObject } = result;
              // Use a stream to update each affected user document
              return new Promise((resolve, reject) => {
                const stream = User.find(userFind, "score outcomes local", {
                  multi: true,
                }).stream();
                stream.on("data", (doc) => {
                  let scoreToUse = 0;
                  for (let i = 0; i < doc.outcomes.length; i++) {
                    scoreToUse += doc.outcomes[i].score;
                  }
                  scoreToUse += scoreObject[doc.local.username];
                  const newUpdate = {
                    answer: answerDeclared,
                    prediction: findObject.ldesc,
                    group: findObject.group,
                    outcome: outcomeToPush,
                    date: new Date(),
                    score: scoreObject[doc.local.username],
                  };
                  doc.score = scoreToUse;
                  doc.outcomes.push(newUpdate);
                  // Save each user document; errors here are logged but not propagated.
                  doc.save().catch((err) => console.error(err));
                });
                stream.on("end", resolve);
                stream.on("error", reject);
              });
            })
            .then(() => {
              res.json({});
            })
            .catch((err) => {
              console.error(err);
              res.json({ error: "An error occurred" });
            });
        } else {
          res.json({});
        }
      });
    }
  });

  app.get("/deleteGroup/:id", function (req, res) {
    var metaArray = ["group"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var group = makeLower(reqObject.group);
      isAdmin(req, group, function (tf, groupProper) {
        if (makeLower(group) === "personal") {
          tf = false;
        }
        if (tf) {
          var findObject = {};
          findObject.group = group;

          PredictSerie.find(findObject)
            .exec()
            .then((idwa0) => {
              // Build a unique list of affected users from all matching PredictSerie documents
              let affectedUsers = [];
              for (let i = 0; i < idwa0.length; i++) {
                for (let j = 0; j < idwa0[i].users.length; j++) {
                  const candidate = idwa0[i].users[j];
                  if (affectedUsers.indexOf(candidate) === -1) {
                    affectedUsers.push(candidate);
                  }
                }
              }
              // Return the affected users for the next chain
              return affectedUsers;
            })
            .then((affectedUsers) => {
              // Remove all PredictSerie documents matching findObject
              return PredictSerie.find(findObject)
                .remove()
                .exec()
                .then(() => affectedUsers);
            })
            .then((affectedUsers) => {
              // Remove the corresponding GroupSerie document
              const groupFindObject = { lName: group };
              return GroupSerie.findOne(groupFindObject)
                .remove()
                .exec()
                .then(() => affectedUsers);
            })
            .then((affectedUsers) => {
              // Send the response immediately after removals
              res.json({ success: true });
              // Then update users: remove pulled properties from each affected user
              const userFind = { "local.username": { $in: affectedUsers } };
              const updateObject = {
                $pull: {
                  predictions: { $regex: findObject.group + "&.*" },
                  predictionsAdmin: { $regex: findObject.group + "&.*" },
                  groups: findObject.group,
                  admins: findObject.group,
                  outcomes: { group: findObject.group },
                  predictionsProper: { $regex: findObject.group + "&.*" },
                  predictionsAdminProper: { $regex: findObject.group + "&.*" },
                  groupsProper: groupProper,
                  adminsProper: groupProper,
                },
              };
              return User.update(userFind, updateObject, { multi: true })
                .exec()
                .then(() => affectedUsers);
            })
            .then((affectedUsers) => {
              // Now update each affected user by recalculating their score.
              return new Promise((resolve, reject) => {
                const userFind = { "local.username": { $in: affectedUsers } };
                const stream = User.find(userFind, "score outcomes local", {
                  multi: true,
                }).stream();
                stream.on("data", (doc) => {
                  let scoreToUse = 0;
                  for (let i = 0; i < doc.outcomes.length; i++) {
                    scoreToUse += doc.outcomes[i].score;
                  }
                  doc.score = scoreToUse;
                  // Save each document; log errors if any occur during save.
                  doc.save().catch((err) => console.error(err));
                });
                stream.on("end", resolve);
                stream.on("error", reject);
              });
            })
            .catch((err) => {
              console.error(err);
              // Optionally, handle errors by sending a response:
              // res.status(500).json({ success: 0, error: err });
            });
        } else {
          res.json({ success: false });
        }
      });
    }
  });

  app.get("/sendComment/:id", function (req, res) {
    console.log("got comment here")
    var metaArray = ["comment", "group", "prediction"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    console.log("got comment here2")
    if (!reqObject) {
        console.log("got comment here3")
      res.json({ message: "Comment not valid" });
    } else {
    console.log("got comment here4")
      var group = makeLower(reqObject.group);
      //var comment = reqObject.comment;
      var prediction = makeLower(reqObject.prediction);
      if (req.isAuthenticated() === false) {
    console.log("got comment here5")
        res.redirect("/signup");
      } else {
    console.log("got comment here6")
        var findObject = {};
        findObject.group = group;
        findObject.ldesc = makeLower(prediction);
        if (makeLower(group) === "personal") {
          findObject.author = req.user.local.username;
        }
    console.log("got comment here7")
        isMember(req, group, function (tf, groupProper) {
          if (tf) {
    console.log("got comment here8")
            PredictSerie.findOne(findObject)
              .exec()
              .then((foundPrediction) => {
    console.log("got comment here9")
                if (foundPrediction) {
                  const commentSend = {
                    name: req.user.local.username,
                    text: reqObject.comment,
                    date: new Date(),
                    score: 0,
                  };
                  return PredictSerie.findOneAndUpdate(
                    findObject,
                    { $push: { comment: commentSend } },
                    { safe: true, upsert: true },
                  )
                    .exec()
                    .then(() => res.json({ success: true }));
                } else {
                  res.json({});
                }
              })
              .catch((err) => {
                res.send(err);
              });
          } else {
            res.json({});
          }
        });
      }
    }
  });

  app.get("/deleteComment/:id", function (req, res) {
    //var reqObject={};
    //var keyArray=['commentID','group','prediction'];
    //reqObject=stripIncoming(req.params.id,keyArray);
    /*var metaArray=[
	    {
		"name": "commentID",
		"len": 5000,
		"chars": "special",
		"required":true
	    },		{
		"name": "group",
		"len": 1000,
		"chars": "special",
		"required":true
	    },
	    {
		"name": "prediction",
		"len": 1000,
		"chars": "special",
		"required":true
	    }
	    ];*/
    var metaArray = ["commentID", "group", "prediction"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var group = makeLower(reqObject.group);
      var commentID = reqObject.commentID;
      var prediction = reqObject.prediction;
      if (req.isAuthenticated() === false) {
        res.redirect("/signup");
      } else {
        var findObject = {};
        findObject.group = group;
        findObject.ldesc = makeLower(prediction);
        if (makeLower(group) === "personal") {
          findObject.author = req.user.local.username;
        }
        isAdmin(req, group, function (tf) {
          if (tf) {
            PredictSerie.findOne(findObject)
              .exec()
              .then((foundPrediction) => {
                if (foundPrediction) {
                  const commentSend = { _id: commentID };
                  return PredictSerie.findOneAndUpdate(
                    findObject,
                    { $pull: { comment: commentSend } },
                    { safe: true, upsert: true },
                  )
                    .exec()
                    .then(() => res.json({}));
                } else {
                  res.json({});
                }
              })
              .catch((err) => {
                res.send(err);
              });
          } else {
            res.json({});
          }
        });
      }
    }
  });

  app.get("/sendUpdate/:id", function (req, res) {
    var metaArray = ["comment", "group", "prediction"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({ message: "Data not valid" });
    } else {
      var group = makeLower(reqObject.group);
      //var comment = reqObject.comment;
      var prediction = reqObject.prediction;
      if (req.isAuthenticated() === false) {
        res.redirect("/signup");
      } else {
        var findObject = {};
        findObject.group = group;
        findObject.ldesc = makeLower(prediction);
        if (makeLower(group) === "personal") {
          findObject.author = req.user.local.username;
        }
        predictionPermission(req, group, findObject.ldesc, function (tf) {
          if (tf) {
            PredictSerie.findOne(findObject)
              .exec()
              .then((foundPrediction) => {
                if (foundPrediction) {
                  const updateSend = {
                    name: req.user.local.username,
                    text: reqObject.comment,
                    date: new Date(),
                  };
                  return PredictSerie.findOneAndUpdate(
                    findObject,
                    { $push: { verboseUpdate: updateSend } },
                    { safe: true, upsert: true },
                  )
                    .exec()
                    .then(() => res.json({ success: true }));
                } else {
                  res.json({});
                }
              })
              .catch((err) => {
                res.send(err);
              });
          } else {
            res.json({});
          }
        });
      }
    }
  });

  app.get("/vote/:id", function (req, res) {
    if (req.isAuthenticated() === false) {
      res.json({});
    } else {
      var metaArray = ["up", "group", "prediction"];
      var reqObject = stripIncomingObject(req.params.id, metaArray);
      console.log("voting with: " + JSON.stringify(reqObject));
      if (!reqObject) {
        res.json({});
      } else {
        res.json({});
        var group = reqObject.group;
        var prediction = reqObject.prediction;
        var up = reqObject.up;
        voteFunction(req, group, prediction, up);
      }
    }
  });

  app.get("/deleteGraph/:id", function (req, res) {
    //var incObject={};
    //var keyArray=['desc','group'];
    //incObject=stripIncoming(req.params.id,keyArray);

    /*var metaArray=[
	    {
		"name": "prediction",
		"len": 5000,
		"chars": "special",
		"required":true
	    },		{
		"name": "group",
		"len": 1000,
		"chars": "special",
		"required":true
	    }
	    ];*/
    var metaArray = ["prediction", "group"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    if (!reqObject) {
      res.json({});
    } else {
      var findObject = {};
      if (makeLower(reqObject.group) === "personal") {
        findObject.author = req.user.local.username;
      }
      findObject.ldesc = makeLower(reqObject.prediction);
      findObject.group = makeLower(reqObject.group);
      predictionPermission(
        req,
        findObject.group,
        findObject.ldesc,
        function (tf) {
          if (tf) {
            let inc;
            PredictSerie.findOne(findObject)
              .exec()
              .then((foundPrediction) => {
                inc = foundPrediction; // store for later use
                return PredictSerie.findOne(findObject).remove().exec();
              })
              .then(() => {
                // Send response immediately after removal
                res.send({ a: 1 });
                const userFind = { "local.username": { $in: inc.users } };
                const updateObject = {
                  $pull: {
                    predictions: {
                      $regex: findObject.group + "&" + findObject.ldesc,
                    },
                    predictionsAdmin: {
                      $regex: findObject.group + "&" + findObject.ldesc,
                    },
                    predictionsProper: {
                      $regex: findObject.group + "&" + inc.desc,
                    },
                    predictionsAdminProper: {
                      $regex: findObject.group + "&" + inc.desc,
                    },
                    outcomes: {
                      group: findObject.group,
                      prediction: findObject.ldesc,
                    },
                  },
                };
                return User.update(userFind, updateObject, {
                  multi: true,
                }).exec();
              })
              .then(() => {
                const userFind = { "local.username": { $in: inc.users } };
                // Process each affected user via a stream
                return new Promise((resolve, reject) => {
                  const stream = User.find(userFind, "score outcomes local", {
                    multi: true,
                  }).stream();
                  stream.on("data", (doc) => {
                    let scoreToUse = 0;
                    for (let i = 0; i < doc.outcomes.length; i++) {
                      scoreToUse += doc.outcomes[i].score;
                    }
                    doc.score = scoreToUse;
                    // Save document; errors here are logged but don't stop the stream
                    doc.save().catch((err) => console.error(err));
                  });
                  stream.on("end", resolve);
                  stream.on("error", reject);
                });
              })
              .catch((err) => {
                res.send(err);
              });
          }
        },
      );
    }
  });

  //    app.get('/predictionabout/:id',function(req,res){
  app.get("/group/:group/:prediction/about/", function (req, res) {
    var group = makeLower(req.params.group);
    var prediction = makeLower(req.params.prediction);
    isMember(req, group, function (tf, groupProper) {
      if (tf) {
        var findObject = {
          ldesc: makeLower(prediction),
          group: makeLower(group),
        };
        if (makeLower(group) === "personal") {
          findObject.author = req.user.local.username;
        }

        PredictSerie.findOne(
          findObject,
          "desc ldesc complete verbose verboseUpdate answers outcomes groupProper",
        )
          .exec()
          .then((idwa) => {
            if (!idwa) {
              return res.render("404", { url: req.url });
            }
            const renderHeader = {
              group: group, // assuming group is defined in an outer scope
              groupProper: idwa.groupProper,
              message: "",
              prediction: idwa.ldesc,
              answers: idwa.answers,
              outcomes: idwa.outcomes,
              predictionProper: idwa.desc,
              verboseAbout: idwa.verbose,
              complete: idwa.complete,
              verboseUpdateAbout: idwa.verboseUpdate,
            };
            renderJade(req, res, "predictionabout", renderHeader);
          })
          .catch((err) => {
            res.render("404", { url: req.url });
          });
      } else {
        res.redirect("/predict");
      }
    });
  });

  app.get("/deleteUser/:id", function (req, res) {
    var test;
    /*var metaArray=[
	    {
		"name": "user",
		"len": 5000,
		"chars": "special",
		"required":true
	    }
	    ];*/
    var metaArray = ["user"];
    var reqObject = stripIncomingObject(req.params.id, metaArray);
    console.log("stripped to: " + JSON.stringify(reqObject));
    if (!reqObject) {
      res.json({});
    } else {
      test = reqObject.user;
      //var group;
      isAdminMaster(req, function (tf) {
        if (tf && test !== "admin") {
          var findObject = {};
          findObject["local.username"] = test;

          User.findOne(findObject)
            .remove()
            .exec()
            .then((removedDoc) => {
              console.log("Removed document:", removedDoc);
              res.json({ success: 1 });
            })
            .catch((err) => {
              res.status(500).json({ success: 0, error: err });
            });
        } else {
          res.json({ message: "error" });
        }
      });
    }
  });

  app.get("/newpredict/:id", function (req, res) {
    var group;
    group = stripIncomingString(req.params.id);
    if (req.isAuthenticated() === false) {
      res.redirect("/signup");
    } else {
      //var message = "";
      isMember(req, group, function (tf, groupProper) {
        if (tf) {
          //var message;
          //var group = group;
          var renderHeader = {};
          renderHeader.group = group;
          renderHeader.message = "";
          renderJade(req, res, "newpredict", renderHeader);
        } else {
          res.redirect("/predict");
        }
      });
    }
  });

  app.get("/users/:id", function (req, res) {
    var user = stripIncomingString(req.params.id);
    var renderHeader = {};
    var findObject = {};
    findObject["local.username"] = makeLower(user);

    User.findOne(
      findObject,
      "groups groupsProper admins adminsProper predictions predictionsProper predictionsAdmin predictionsAdminProper score groupScores",
    )
      .exec()
      .then((idw) => {
        if (!idw) {
          return res.render("404", { url: req.url });
        }
        // Build the renderHeader object from the found user
        renderHeader.userDescription = {};
        renderHeader.userDescription.score = idw.score;
        renderHeader.userDescription.name = makeLower(user);
        renderHeader.message = "";
        renderHeader.group = "";

        let i;
        let groupAccess = {};
        let groupsFind = {};
        let myGroups = req.user ? req.user.groups : [];
        groupsFind.lName = { $in: idw.groups };

        // Return the promise for the second query
        return GroupSerie.find(groupsFind)
          .exec()
          .then((idwa) => {
            // Determine group access for each group from the found GroupSerie documents
            for (i = 0; i < idwa.length; i++) {
              if (idwa[i].lName === "personal") {
                groupAccess[idwa[i].lName] = false;
              } else {
                if (idwa[i].open === true) {
                  groupAccess[idwa[i].lName] = true;
                } else if (myGroups.indexOf(idwa[i].lName) > -1) {
                  groupAccess[idwa[i].lName] = true;
                }
              }
            }

            // Initialize arrays in the user description
            renderHeader.userDescription.groups = [];
            renderHeader.userDescription.admins = [];
            renderHeader.userDescription.predictions = [];
            renderHeader.userDescription.predictionsAdmin = [];
            renderHeader.userDescription.groupsProper = [];
            renderHeader.userDescription.adminsProper = [];
            renderHeader.userDescription.predictionsProper = [];
            renderHeader.userDescription.predictionsAdminProper = [];

            // Process groups arrays based on groupAccess
            for (i = 0; i < idw.groups.length; i++) {
              if (groupAccess[idw.groups[i]] === true) {
                renderHeader.userDescription.groups.push(idw.groups[i]);
                renderHeader.userDescription.groupsProper.push(
                  idw.groupsProper[i],
                );
              }
            }
            for (i = 0; i < idw.admins.length; i++) {
              if (groupAccess[idw.admins[i]] === true) {
                renderHeader.userDescription.admins.push(idw.admins[i]);
                renderHeader.userDescription.adminsProper.push(
                  idw.adminsProper[i],
                );
              }
            }

            // Process predictions arrays
            let addReg, addProp;
            for (i = 0; i < idw.predictions.length; i++) {
              if (groupAccess[idw.predictions[i].split("&")[0]] === true) {
                addReg =
                  idw.predictions[i].split("&")[0] +
                  "/" +
                  idw.predictions[i].split("&")[1];
                addProp =
                  idw.predictionsProper[i].split("&")[0] +
                  "/" +
                  idw.predictionsProper[i].split("&")[1];
                renderHeader.userDescription.predictions.push(addReg);
                renderHeader.userDescription.predictionsProper.push(addProp);
              }
            }
            for (i = 0; i < idw.predictionsAdmin.length; i++) {
              if (groupAccess[idw.predictionsAdmin[i].split("&")[0]] === true) {
                addReg =
                  idw.predictionsAdmin[i].split("&")[0] +
                  "/" +
                  idw.predictionsAdmin[i].split("&")[1];
                addProp =
                  idw.predictionsAdminProper[i].split("&")[0] +
                  "/" +
                  idw.predictionsAdminProper[i].split("&")[1];
                renderHeader.userDescription.predictionsAdmin.push(addReg);
                renderHeader.userDescription.predictionsAdminProper.push(
                  addProp,
                );
              }
            }
            // Finally, render the jade template with the built header
            renderJade(req, res, "user", renderHeader);
          });
      })
      .catch((err) => {
        res.render("404", { url: req.url });
      });
  });

  app.get("/profile", isLoggedIn, function (req, res) {
    var renderHeader = {};
    renderHeader.message = "";
    renderHeader.group = "";
    //console.log("got here"+isLoggedIn);
    renderJade(req, res, "profile", renderHeader);
  });

  app.get("/group/:group/:prediction", function (req, res) {
    var group, prediction;
    group = makeLower(req.params.group);
    prediction = makeLower(req.params.prediction);
    var predictFindObject = { ldesc: prediction, group: group };
    if (group === "personal") {
      predictFindObject.author = req.user.local.username;
    }
    isMember(req, group, function (tf, groupProper) {
      if (tf) {
        GroupSerie.findOne({ lName: group })
          .exec()
          .then((idwa) => {
            return PredictSerie.findOne(predictFindObject)
              .exec()
              .then((idwa2) => {
                if (!idwa2) {
                  return res.render("404", { url: req.url });
                }
                const renderHeader = {
                  group: idwa.name,
                  groupLower: makeLower(idwa.name),
                  message: "",
                  prediction: prediction,
                  predictionProper: idwa2.desc,
                };
                renderJade(req, res, "prediction", renderHeader);
              });
          })
          .catch((err) => {
            res.render("404", { url: req.url });
          });
      } else {
        res.redirect("/predict");
      }
    });
  });

  //this is groupabout rather than group/about (like predictions), as otherwise you couldn't have a prediction called about
  app.get("/groupabout/:group", function (req, res) {
    var group;
    group = stripIncomingString(req.params.group);
    isMember(req, group, function (tf, groupProper) {
      if (tf) {
        //var message;
        //var group = group;
        var renderHeader = {};
        renderHeader.group = group;
        renderHeader.message = "";
        renderJade(req, res, "groupabout", renderHeader);
      } else {
        res.redirect("/predict");
      }
    });
  });

  app.get("/nopermission/:group", function (req, res) {
    var group;
    group = stripIncomingString(req.params.group);
    if (group === "personal") {
      res.redirect("/signup");
    } else {
      isMember(req, group, function (tf, groupProper) {
        if (tf) {
          res.redirect("/group/" + group);
        } else {
          //var message;
          //var group = group;
          var renderHeader = {};
          renderHeader.group = group;
          renderHeader.message = "";
          renderJade(req, res, "nopermission", renderHeader);
        }
      });
    }
  });
};

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  console.log("is logged in start");
  if (req.isAuthenticated()) {
    console.log("a");
    return next();
  }
  console.log("c");
  // if they aren't redirect them to the signup page
  res.redirect("/signup");
  console.log("d");
}
/*
function isLoggedOut(req, res, next) {
  // if user is authenticated in the session, redirect to profile
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  }
  // if they aren't carry on
  return next();
}
*/
function makeLower(raw) {
  var response;
  response = raw.toLowerCase().replace(regexObject.makeLower, "");
  return response;
}
