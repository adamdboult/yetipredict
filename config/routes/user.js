//var express=require('express');
//var bcrypt = require('bcrypt');
var User = require(__dirname + "/../models/user");
module.exports = function (app, passport) {
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

  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
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
    User.findOne({
      $or: [
        { "local.email": email.toLowerCase() },
        { "local.username": username.toLowerCase() },
      ],
    })
      .exec()
      .then(function (user) {
        // remove the err check here, since errors go to .catch()
        if (user) {
          req.flash("error_msg", "That email is already taken.");
          return res.redirect("/signup");
        } else if (password !== password2) {
          req.flash("error_msg", "Passwords do not match.");
          return res.redirect("/signup");
        } else if (validatePassword(password) === false) {
          req.flash("error_msg", "Please use a valid password.");
          return res.redirect("/signup");
        } else if (validateUsername(username.toLowerCase()) === false) {
          req.flash("error_msg", "Please use a valid username.");
          return res.redirect("/signup");
        } else if (validateEmail(email.toLowerCase()) === false) {
          req.flash("error_msg", "Please use a valid email address.");
          return res.redirect("/signup");
        } else {
          var newUser = new User();
          newUser.local.username = username.toLowerCase();
          newUser.local.admin = false;
          newUser.local.email = email.toLowerCase();
          newUser.groups = ["personal"];
          newUser.groupsProper = ["Personal"];
          newUser.groupScores = [];
          newUser.score = 0;
          newUser.local.password = newUser.generateHash(password); // generate hash
          return newUser.save();
        }
      })
      .then(function () {
        req.flash("success_msg", "You have now registered!");
        res.redirect("/login");
      })
      .catch(function (err) {
        res.render(err);
      });
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

/*
function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
*/
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
