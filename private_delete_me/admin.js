module.exports = function (app, passport, logger) {
  "use strict";
  var User = require(__dirname + "/../config/models/user");

  function adminInit() {
    //User.findOne({'local.username':'admin'},function(err,idwa){
    //User.findOne({'local.username':'admin'}).exec(function(err, idwa) {
    User.findOne({ "local.username": "admin" })
      .exec()
      .then((idwa) => {
        if (idwa) {
          // User already exists
        } else {
          const adminUser = new User();
          adminUser.local.username = "admin";
          adminUser.local.admin = true;
          adminUser.local.password = adminUser.generateHash("dingogodancer");
          adminUser.local.email = "";
          adminUser.groups = ["personal"];
          adminUser.groupsProper = ["Personal"];
          adminUser.groupScores = [];
          adminUser.score = 0;

          return adminUser.save();
        }
      })
      .then(() => {
        // Optionally do something after saving
      })
      .catch((err) => {
        // Handle any errors that occurred during the query or save
        console.error(err);
      });
  }
  adminInit();
};
