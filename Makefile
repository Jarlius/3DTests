public/build/out.js: $(wildcard public/js/*.js) $(wildcard public/views/*.view.js) public/app.js
	browserify $^ -o $@

run: public/build/out.js
	firefox public/index.html

test:
	node tests/camera.test.js

clean:
	rm -f public/build/out.js
