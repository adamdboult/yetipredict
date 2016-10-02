//var express=require('express');
module.exports=function(app,passport,logger){
    'use strict';
/*
    app.get('/login', isLoggedOut, function(req, res) {
	res.render('login',{message:req.flash('loginMessage')});
    });

    app.get('/signup', isLoggedOut, function(req, res) {
	res.render('signup',{message:req.flash('signupMessage')});
    });
*/
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/predict', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/changepw', isLoggedIn, function(req, res) {
	res.render('changepw',{message:req.flash('signupMessage')});
    });

    app.get('/changeemail', isLoggedIn, function(req, res) {
	res.render('changeemail',{message:req.flash('signupMessage')});
    });

    app.post('/signup',passport.authenticate('local-signup', {
	successRedirect : '/predict', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/changeemail',passport.authenticate('local-emailchange', {
	successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile',{user:req.user});
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log("1");
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
	console.log("2");
        return next();
    }
    // if they aren't redirect them to the signup page
    console.log("3");
    res.redirect('/signup');
}
function isLoggedOut(req, res, next) {
    console.log("5");
    // if user is authenticated in the session, redirect to profile 
    if (req.isAuthenticated()){
	console.log("6");
	res.redirect('/profile');
    }
    // if they aren't carry on
    console.log("7");
    return next();
}
