all:
	../node_modules/pegjs/bin/pegjs --optimize speed --format globals -e RCParser parser.peg && cp rvimrc_parser.js ../content_scripts/rvimrc_parser.js

test: all
	node ./test/test.js

clean:
	rm -f parser.js
