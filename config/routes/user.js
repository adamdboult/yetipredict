//var express=require('express');
//var bcrypt = require('bcrypt');
var User = require(__dirname + "/../models/user");
module.exports = function (app, passport) {
  "use strict";
  /*
    app.get('/login', isLoggedOut, function(req, res) {
	res.render('login',{message:req.flash('loginMessage')});
    });

    app.get('/signup', isLoggedOut, function(req, res) {
	res.render('signup',{message:req.flash('signupMessage')});
    });
*/
  /////////
  /* GET */
  /////////
  app.get("/", function (req, res) {
    res.redirect("/predict");
    //res.render('home');
  });
  app.get("/about", function (req, res) {
    req.flash("user", req.user);
    //res.render('about', {user:req.user});
    res.render("about");
  });

  app.get("/login", isLoggedOut, function (req, res) {
    //var renderHeader = {};
    //renderHeader.group = "";
    //renderHeader.message = req.flash('loginMessage');
    //renderJade(req, res, 'login', renderHeader);
    //res.render('login',{message:req.flash('signupMessage')});
    res.render("login");
  });

  app.get("/signup", isLoggedOut, function (req, res) {
    //var renderHeader={};
    //renderHeader.group="";
    //renderHeader.message=req.flash('signupMessage');
    //renderJade(req,res,'signup',renderHeader);
    //res.render('signup',{message:req.flash('signupMessage')});
    res.render("signup");
  });

  app.get("/changepw", isLoggedIn, function (req, res) {
    //res.render('changepw',{message:req.flash('signupMessage')});
    res.render("changepw");
  });

  app.get("/changeemail", isLoggedIn, function (req, res) {
    //res.render('changeemail',{message:req.flash('signupMessage')});
    res.render("changeemail");
  });

  app.get("/profile", isLoggedIn, function (req, res) {
    //res.render('profile',{user:req.user});
    req.flash("user", req.user);
    res.render("profile");
  });

  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  ///////////
  /* LOGIN */
  ///////////
  /*
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/predict', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
*/

  /*
    app.post('/login', function(req,res) {
        passport.authenticate('local',{
            successRedirect : '/predict',
            failureRedirect : '/login',
            failureFlash : true
        });
    });
   */
  app.post("/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/predict",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
  });

  ////////////
  /* SIGNUP */
  ////////////

  /*
    app.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/predict', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    */
  app.post("/signup", (req, res) => {
    //console.log("hi");
    const { username, email, password, password2 } = req.body;
    //console.log(req.body);
    //console.log(username);

    //User.findOne({ $or:[{'local.email' : req.param('email').toLowerCase()},{'local.username':username.toLowerCase()}] }, function(err, user) {
    User.findOne(
      {
        $or: [
          { "local.email": email.toLowerCase() },
          { "local.username": username.toLowerCase() },
        ],
      },
      function (err, user) {
        // if there are any errors, return the error
        if (err) {
          //console.log("part 1");
          res.render(err);
        }
        // check to see if theres already a user with that email
        else if (user) {
          //console.log("part 2");
          req.flash("error_msg", "That email is already taken.");
          //res.render('signup');
          res.redirect("/signup");
        } else if (req.param("password") !== req.param("password2")) {
          //console.log("part 3");
          req.flash("error_msg", "Passwords do not match.");
          //res.render('signup');
          res.redirect("/signup");
        } else if (validatePassword(password) === false) {
          //console.log("part 4");
          req.flash("error_msg", "Please use a valid password.");
          //res.render('signup');
          res.redirect("/signup");
        } else if (validateUsername(username.toLowerCase()) === false) {
          //console.log("part 5");
          req.flash("error_msg", "Please use a valid username.");
          //res.render('signup');
          res.redirect("/signup");
        } else if (validateEmail(req.param("email").toLowerCase()) === false) {
          //console.log("part 6");
          req.flash("error_msg", "Please use a valid email address.");
          //res.render('signup');
          res.redirect("/signup");
        } else {
          //console.log("part 1");
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.local.username = username.toLowerCase();
          //newUser.local.groups=['a','b']; WFT is this?
          newUser.local.admin = false;
          newUser.local.email = req.param("email").toLowerCase();
          newUser.groups = ["personal"];
          newUser.groupsProper = ["Personal"];
          newUser.groupScores = [];
          newUser.score = 0;
          newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model
          // save the user
          newUser.save(function (err) {
            if (err) throw err;
            req.flash("success_msg", "You have now registered!");
            res.redirect("/login");
            //res.render(null, newUser);
          });
        }
      },
    );
  });

  //////////////////
  /* CHANGE EMAIL */
  //////////////////
  /*
    app.post('/changeemail',passport.authenticate('local-emailchange', {
	successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    */
};

////////////////
/* MIDDLEWARE */
////////////////

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //console.log("A1");
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    //console.log("A2");
    return next();
  }
  // if they aren't redirect them to the signup page
  //console.log("A3");
  res.redirect("/signup");
}

function isLoggedOut(req, res, next) {
  //console.log("B5");
  // if user is authenticated in the session, redirect to profile
  if (req.isAuthenticated()) {
    //console.log("B6");
    res.redirect("/profile");
  }
  // if they aren't carry on
  //console.log("B7");
  return next();
}

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateUsername(username) {
  var re = /^[a-z0-9_-]{3,15}$/; //needs to match regex in predict.js (to allow for adding users to groups etc)
  return re.test(username);
}

function validatePassword(password) {
  var passwordLength = password.length;
  return passwordLength > 5;
}
