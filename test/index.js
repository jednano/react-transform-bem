import { readFile, writeFile } from 'fs';
import test from 'tape';
import { transform } from 'babel-core';
import bem from '..';

test('react-transform-bem', t => {
	let planned = 0;

	testFixture({
		name: 'block-string-literal',
		description: 'resolves a block defined as a string literal'
	});

	testFixture({
		name: 'block-simple-expression',
		description: 'resolves a block defined as a simple expression'
	});

	testFixture({
		name: 'block-spread-attr',
		description: 'resolves a block defined in a spread attribute'
	});

	testFixture({
		name: 'block-functional',
		description: 'resolves a block defined in a functional component'
	});

	testFixture({
		name: 'block-with-element',
		description: 'resolves a block with an element'
	});

	t.plan(planned);

	function testFixture({ name, description, pluginOptions = {} }) {
		planned++;
		readFixture(`${name}/input.jsx`, source => {
			readFixture(`${name}/expected.js`, expected => {
				const result = transform(source, {
					presets: ['react', 'es2015'],
					plugins: [bem, pluginOptions]
				});
				t.equal(result.code, expected + '', description);
				writeFile(`test/fixtures/${name}/actual.js`, result.code);
			});
		});
	}
});

function readFixture(name, callback) {
	readFile(`test/fixtures/${name}`, (err, contents) => {
		if (err) {
			throw err;
		}
		callback(contents);
	});
}
