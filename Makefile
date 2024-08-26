
##########
# README #
##########



##########
# JSHINT #
##########
all: empty_dest favicon packages scripts styles

    
empty_dest:
	rm -rf ./public/
	mkdir ./public/

favicon:
	cp ./src/img/compiled/* ./public/

packages:
	mkdir ./public/packages/
	cp -R ./node_modules/mathjax/es5 ./public/packages/mathjax
	cp -R ./node_modules/bootstrap/dist ./public/packages/bootstrap
	cp -R ./node_modules/jquery/dist ./public/packages/jquery
	#cp -R ./node_modules/popper.js/dist/umd ./public/packages/popper.js
	cp -R ./node_modules/angular ./public/packages/angular
	cp -R ./node_modules/angular-route ./public/packages/angular-route
	cp -R ./node_modules/d3/dist ./public/packages/d3

scripts:
	#mkdir ./public/js/
	cp -R ./src/js ./public/js
      
styles:
	mkdir ./public/css/
	cp ./src/styles/**/*.css ./public/css/ || true
	#sass ./src/styles/core.scss:./public/css/core.css
