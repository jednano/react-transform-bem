import { readFile, writeFile } from 'fs';
import test from 'tape';
import { transform } from 'babel-core';
import bem from '..';

test('react-transform-bem', t => {
	let planned = 0;

	testFixture({
		name: 'block',
		description: 'resolves a block'
	});

	testFixture({
		name: 'block-with-element',
		description: 'resolves a block with an element'
	});

	testFixture({
		name: 'functional',
		description: 'resolves a functional component with a block'
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
