
test/built.js: lib/* test/*
	@node_modules/.bin/sourcegraph \
		-p javascript,nodeish,mocha \
		test/browser.js \
		| node_modules/.bin/bigfile \
			-p nodeish \
			-x null \
			> $@
