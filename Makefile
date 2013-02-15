
SRC = $(wildcard lib/*.js)

clean:
	rm -fr build components template.js

test:
	@node test/server

test/built.js: lib/* test/*
	@node_modules/.bin/sourcegraph \
		-p javascript,nodeish,mocha \
		test/browser.js \
		| node_modules/.bin/bigfile \
			-p nodeish \
			-x null \
			> $@

.PHONY: clean test
