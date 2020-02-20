"use strict";
/*jshint node:true */

//////////////////
/* DEPENDENCIES */
//////////////////
// include gulp
var gulp = require('gulp'); 

// include plug-ins
var jshint = require('gulp-jshint');
//var changed = require('gulp-changed');
//var minifyHTML = require('gulp-minify-html');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
//var minifyCSS = require('gulp-minify-css');
var sass=require('gulp-sass');
var rmdir = require('rimraf');
var fs=require('fs');
var shell=require('gulp-shell');
var Q = require('q');

/////////////////
/* DIRECTORIES */
/////////////////
var bowerDir = __dirname+'/bower_components';

var jsConcatFilesHeader = [
    __dirname+'/src/scripts/analytics.js',
    //bowerDir+'/bootstrap/dist/js/bootstrap.js',
    //bowerDir+'/Bootflat/bootflat/icheck.min.js',
    //bowerDir+'/Bootflat/bootflat/jquery.fs.selecter.min.js',
    //bowerDir+'/Bootflat/bootflat/jquery.fs.stepper.min.js',
    //bowerDir+'/browser-update/browser-update.min.js',
    bowerDir+'/d3/d3.min.js',
    //bowerDir+'/flat-ui/dist/js/flat-ui.min.js'
    //bowerDir+'/bootstrap-material-design/dist/js/material.min.js',
    //bowerDir+'/bootstrap-material-design/dist/js/ripples.min.js',
    //bowerDir+'/bootstrap-material-design/dist/js/material.min.js'
    //bowerDir+'/angular/angular.min.js'
];

var jsConcatFilesData = [__dirname+'/src/scripts/coreData.js'];
var jsConcatFilesPrediction = [__dirname+'/src/scripts/prediction.js'];
var jsConcatFilesGroupAbout = [__dirname+'/src/scripts/groupabout.js'];
var jsConcatFilesNewGroup = [__dirname+'/src/scripts/newgroup.js'];
var jsConcatFilesNewPredict = [__dirname+'/src/scripts/newpredict.js'];
var jsConcatFilesPredictionAbout = [__dirname+'/src/scripts/predictionabout.js'];
var jsConcatFilesUsers = [__dirname+'/src/scripts/users.js'];

var jshintFiles = [
    __dirname+'/server.js',
    __dirname+'/dataCombiner.js',
    __dirname+'/gulpfile.js',
    __dirname+'/config/passport.js',
    __dirname+'/config/routes/predict.js',
    __dirname+'/config/routes/data.js',
    __dirname+'/config/routes/routes.js',
    __dirname+'/config/routes/user.js',
    __dirname+'/src/scripts/coreData.js',
    __dirname+'/src/scripts/group.js',
    __dirname+'/src/scripts/groupabout.js',
    __dirname+'/src/scripts/newgroup.js',
    __dirname+'/src/scripts/newpredict.js',
    __dirname+'/src/scripts/predictabout.js',
    __dirname+'/src/scripts/users.js',
    __dirname+'/src/scripts/invite.js'
];
var stylesFiles = [
    //bowerDir+'/bootstrap/dist/css/bootstrap.css',
    //bowerDir+'/Bootflat/bootflat/css/bootflat.min.css',
    //bowerDir+'/bootstrap-theme-bootswatch-flatly/css/bootstrap.min.css',
    //bowerDir+'/bootstrap-material-design/dist/css/roboto.min.css',
    //bowerDir+'/bootstrap-material-design/dist/css/material.min.css',
    //bowerDir+'/bootstrap-material-design/dist/css/ripples.min.css',
    //bowerDir+'/flat-ui/dist/css/flat-ui.min.css',
    __dirname+'/src/styles/core.scss'
];

//var fontFiles = [
//    bowerDir+'/bootstrap/dist/fonts/**/*',
//    //bowerDir+'/flat-ui/dist/fonts/**/*'
//    bowerDir+'/bootstrap-material-design/dist/fonts/**/*'
//];



//var jsFallBack=[bowerDir+'/jquery/dist/jquery.min.js'];
//var mathjaxprefix=bowerDir+'/MathJax';
//var mathjaxFolder=[mathjaxprefix+'/MathJax.js',
//		   mathjaxprefix+'/config/**/*',
//		   mathjaxprefix+'/fonts/HTML-CSS/TeX/woff/**/*',
//		   mathjaxprefix+'/jax/**/*',
//		   mathjaxprefix+'/extensions/**/*'
//		  ];
//var mathjaxFolder=[mathjaxprefix+'/MathJax.js',
//		   mathjaxprefix+'/config/**/*',
//		   mathjaxprefix+'/images/**/*',
//		   mathjaxprefix+'/jax/**/*',
//		   mathjaxprefix+'/fonts/HTML-CSS/TeX/woff/**/*',
//		   mathjaxprefix+'/extensions/**/*'
//		  ];

var datepickerFolder=[bowerDir+'/bootstrap-datepicker/js/**/*'];

gulp.task('clean', function() {
    var deferred = Q.defer();
    rmdir(__dirname+'/public', function(error){
	rmdir(__dirname+'/data', function(error){
	    fs.mkdirSync(__dirname+'/public');
	    fs.mkdirSync(__dirname+'/data');
	    deferred.resolve();
	});
    });
    return deferred.promise;
});

//gulp.task('fallbackjs',['clean'],function() {
//    gulp.src(jsFallBack)
//	.pipe(gulp.dest(__dirname+'/public/js/'));
//});

//gulp.task('mathjax',['clean'],function() {
//    gulp.src(mathjaxFolder,{base:mathjaxprefix})
//	.pipe(gulp.dest(__dirname+'/public/js/MathJax/'));
//});

gulp.task('datepicker',['clean'],function() {
    gulp.src(datepickerFolder,{base:bowerDir+'/bootstrap-datepicker/js'})
	.pipe(gulp.dest(__dirname+'/public/js/datepicker/'));
});

/*gulp.task('css', function () {
    return gulp.src('css/*.css')
        .pipe(gulp.dest('build/css'));
});
*/


// JS hint task
gulp.task('jshint', ['clean'], function() {
    gulp.src(jshintFiles)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

// JS concat, strip debugging and minify
gulp.task('scripts', ['clean'], function() {
    gulp.src(jsConcatFilesHeader)
	.pipe(concat('coreHeader.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesData)
	.pipe(concat('coreData.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesPrediction)
	.pipe(concat('prediction.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesGroupAbout)
	.pipe(concat('groupabout.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesNewPredict)
	.pipe(concat('newpredict.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesNewGroup)
	.pipe(concat('newgroup.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesPredictionAbout)
	.pipe(concat('predictionabout.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesUsers)
	.pipe(concat('users.js'))
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(gulp.dest(__dirname+'/public/js/'));
});

gulp.task('scripts-debug', ['clean'], function() {
    gulp.src(jsConcatFilesHeader)
	.pipe(concat('coreHeader.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesData)
	.pipe(concat('coreData.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesPrediction)
	.pipe(concat('prediction.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesGroupAbout)
	.pipe(concat('groupabout.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesNewPredict)
	.pipe(concat('newpredict.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesPredictionAbout)
	.pipe(concat('predictionabout.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesNewGroup)
	.pipe(concat('newgroup.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
    gulp.src(jsConcatFilesUsers)
	.pipe(concat('users.js'))
	.pipe(gulp.dest(__dirname+'/public/js/'));
});

// CSS concat, auto-prefix and minify
/*
gulp.task('fonts', ['clean'], function() {
    gulp.src(fontFiles)
	.pipe(gulp.dest(__dirname+'/public/fonts/'));
});
*/
gulp.task('styles', ['clean'], function() {
    gulp.src(stylesFiles)
	.pipe(concat('styles.scss'))
        .pipe(sass())
	.pipe(autoprefix('last 2 versions'))
	//.pipe(minifyCSS({keepSpecialComments:false}))
    //	.pipe(stripDebug())
	.pipe(gulp.dest(__dirname+'/public/css/'));
});
// minify new images
gulp.task('imagemin', ['clean'], function() {
    var imgSrc = __dirname+'/src/img/compiled/*',
	imgDst = __dirname+'/public/img';
    
    gulp.src(imgSrc)
	.pipe(gulp.dest(imgDst));
});

// jade
gulp.task('jade', ['clean'], function() {
    var YOUR_LOCALS = {};
    //	gulp.src([__dirname+'/src/jade/*.jade'])
    //	.pipe(jade({
    //		locals: YOUR_LOCALS
    //	}))
    //	.pipe(gulp.dest(__dirname+'/public/'));
});

// jade


gulp.task('csvProcess',['clean'], shell.task([
    './csv-manipulation.py'
]));

gulp.task('nonScript', ['styles', 'jade', 'imagemin', 'csvProcess', 'datepicker'], function(){
});
//gulp.task('nonScript',['styles','jade','imagemin','fonts','csvProcess','mathjax','datepicker','fallbackjs'], function(){
//});

gulp.task('debug', ['nonScript', 'scripts-debug', 'jshint'], function(){
});

gulp.task('default', ['nonScript', 'scripts'], function(){
});

