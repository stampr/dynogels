REPORTER ?= list
SRC = $(shell find index.js lib -name "*.js" -type f | sort)
TESTSRC = $(shell find test -name "*.js" -type f | sort)

default: test

lint:
	npm run lint

test-unit: lint
	@node node_modules/.bin/mocha \
		test/*-test.js

test-integration: lint
	@node node_modules/.bin/mocha \
		test/integration/*-test.js

test-cov: lint
	@node node_modules/.bin/mocha \
		$(TESTSRC)

test-cov-html: lint
	@node node_modules/.bin/mocha \
		$(TESTSRC)

test-io: lint
	@node node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd \
		--grep "stream data after handling retryable error" \
		test/*-test.js

test: test-unit test-integration

.PHONY: test test-cov test-cov-html
