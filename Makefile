

.PHONY: all
.PHONY: favicon
.PHONY: packages
.PHONY: scripts
#.PHONY: styles
.PHONY: clean
.PHONY: vendor
.PHONY: vendor_nodejs
.PHONY: vendor_python
.PHONY: install
.PHONY: install_nodejs
.PHONY: install_python

VENV_DIR := .venv
PYTHON := $(VENV_DIR)/bin/python



all: clean favicon packages scripts

    
vendor: vendor_nodejs vendor_python
	
vendor_nodejs:
	mkdir -p vendor/npm/pnpm_tgz
	npm pack pnpm@10.33.0 --pack-destination vendor/npm/pnpm_tgz
	npm install -g ./vendor/npm/pnpm_tgz/pnpm-10.33.0.tgz --prefix ./vendor/npm/pnpm_bin/
	./vendor/npm/pnpm_bin/bin/pnpm install --lockfile-only
	./vendor/npm/pnpm_bin/bin/pnpm config set store-dir vendor/pnpm-store
	./vendor/npm/pnpm_bin/bin/pnpm fetch

vendor_python:
	uv venv --clear --python 3.11 --seed $(VENV_DIR)
	uv pip compile requirements-dev.in --universal --generate-hashes --output-file requirements-dev.txt
	$(PYTHON) -m pip download -r requirements-dev.txt -d vendor/dist_dev
	$(PYTHON) -m pip download -d vendor/dist_dev pip setuptools wheel

clean:
	rm -rf ./public/
	mkdir ./public/

favicon:
	cp -R ./src/img/compiled/. ./public

packages:
	mkdir ./public/packages/
	cp -R ./node_modules/mathjax/es5/. ./public/packages/mathjax
	cp -R ./node_modules/bootstrap/dist/. ./public/packages/bootstrap
	#cp -R ./node_modules/jquery/dist/. ./public/packages/jquery
	cp -R ./node_modules/angular/. ./public/packages/angular
	cp -R ./node_modules/angular-route/. ./public/packages/angular-route
	cp -R ./node_modules/d3/dist/. ./public/packages/d3

scripts:
	mkdir ./public/js/
	cp -R ./src/js/. ./public/js
      
#styles:
#	mkdir ./public/css/
#	cp -R./src/styles ./public/css

install: install_python install_nodejs
	
install_python:
	uv pip sync requirements-dev.txt --find-links vendor/dist_dev --offline --no-index

install_nodejs:
	./vendor/npm/pnpm_bin/bin/pnpm install --offline --frozen-lockfile

