var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require(__dirname+'/models/user');

module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	    done(err, user);
	});
    });
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
	passReqToCallback : true // allows us to pass back the entire request to the callback
    },
						   function(req, username, password, done) {
						       // find a user whose email is the same as the forms email
						       // we are checking to see if the user trying to login already exists
						       User.findOne({ $or:[{'local.email' : req.param('email').toLowerCase()},{'local.username':username.toLowerCase()}] }, function(err, user) {
							   // if there are any errors, return the error
							   if (err)
							       return done(err);
							   // check to see if theres already a user with that email
							   if (user) {
							       return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
							   } 
							   else if (req.param('password')!==req.param('password2')) {
							       return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
							   }
							   else if (validatePassword(password)===false) {
							       return done(null, false, req.flash('signupMessage', 'Please use a valid password.'));
							   }
							   else if (validateUsername(username.toLowerCase())===false) {
							       return done(null, false, req.flash('signupMessage', 'Please use a valid username.'));
							   }
							   else if (validateEmail(req.param('email').toLowerCase())===false){
							       return done(null, false, req.flash('signupMessage', 'Please use a valid email address.'));
							   }
							   else {
							       // if there is no user with that email
							       // create the user
							       var newUser = new User();
							       // set the user's local credentials
							       newUser.local.username=username.toLowerCase();
							       //newUser.local.groups=['a','b']; WFT is this?
							       newUser.local.admin=false;
							       newUser.local.email = req.param('email').toLowerCase();
							       newUser.groups=["personal"];
							       newUser.groupsProper=["Personal"];
							       newUser.groupScores=[];
							       newUser.score=0;
							       newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model
							       // save the user
							       newUser.save(function(err) {
								   if (err)
								       throw err;
								   return done(null, newUser);
							       });
							   }
						       });
						   }));



    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-login', new LocalStrategy({
	// by default, local strategy uses username and password, we will override with email
//	usernameField : 'username',
//	passwordField : 'password',
	passReqToCallback : true // allows us to pass back the entire request to the callback
    },
						  function(req, username, password, done) { // callback with email and password from our form
						      console.log("login!");
						      // find a user whose email is the same as the forms email
						      // we are checking to see if the user trying to login already exists
						      console.log("name: "+username);
						      User.findOne({ 'local.username' : username.toLowerCase() }, function(err, user) {
							  // if there are any errors, return the error before anything else
							  if (err) {
							      return done(err);
							  }
							  console.log("one");
							  // if no user is found, return the message
							  if (!user){
							      return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
							  }

							  // if the user is found but the password is wrong
							  if (!user.validPassword(password)){
							      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
							  }
							  // all is well, return successful user

							  return done(null, user);
						      });
						  }));

    passport.use('local-emailchange', new LocalStrategy({
	passReqToCallback : true // allows us to pass back the entire request to the callback
    },
						  function(req, username, password, done) { // callback with email and password from our form
						      // find a user whose email is the same as the forms email
						      // we are checking to see if the user trying to login already exists
						      console.log("yo");
						      console.log("hi"+req.local.user);
						      console.log("lo"+JSON.stringify(req.local));
						      User.findOneAndUpdate({ 'local.username' : username.toLowerCase() },
									    {'local.email':req.param('newemail')},
									    {safe: true, upsert: true},
									    function(err, result) {
										if (result)
										    return done(null,result);
										return done(null,false);
//										console.log("r"+JSON.stringify(result));
									    });
						  }));
};

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 


function validateUsername(username) { 
    var re = /^[a-z0-9_-]{3,15}$/;//needs to match regex in predict.js (to allow for adding users to groups etc)
    return re.test(username);
} 


function validatePassword(password) { 
    var passwordLength=password.length;
    return passwordLength>5;
} 
