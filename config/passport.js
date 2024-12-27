var LocalStrategy = require("passport-local").Strategy;
// load up the user model
var User = require(__dirname + "/models/user");
//var bcrypt = require('bcrypt');

module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session
  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  // =========================================================================
  // NEW ============================================================
  // =========================================================================
  passport.use(
    new LocalStrategy(function (username, password, done) {
      // callback with email and password from our form
      //logger.debug("gain?");
      //console.log("login!");
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      //console.log("name: "+username);
      User.findOne(
        { "local.username": username.toLowerCase() },
        function (err, user) {
          // if there are any errors, return the error before anything else
          if (err) {
            return done(err);
          }
          //console.log("one");
          // if no user is found, return the message
          if (!user) {
            console.log("bb");
            //return done(null, false, req.flash('error_msg', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            return done(null, false, { message: "No user found." }); // req.flash is the way to set flashdata using connect-flash
          }
          //console.log("ff");
          // if the user is found but the password is wrong
          if (!user.validPassword(password)) {
            console.log("cc");
            return done(null, false, { message: "Oops! Wrong password." }); // create the loginMessage and save it to session as flashdata
            //return done(null, false, req.flash('error_msg', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
          }
          // all is well, return successful user
          console.log("dd");
          return done(null, user);
        },
      );
    }),
  );
};
