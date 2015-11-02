import { readFile } from 'fs';
import test from 'tape';
import { transform } from 'babel-core';
import bem from '..';

test('react-transform-bem', t => {
	let planned = 0;

	testFixture({
		name: 'block',
		description: 'resolves a block\'s class name'
	});

	t.plan(planned);

	function testFixture({ name, description, pluginOptions = {} }) {
		planned++;
		readFixture(name, source => {
			readFixture(`${name}.expected`, expected => {
				const result = transform(source, {
					presets: ['react', 'es2015'],
					plugins: [bem, pluginOptions]
				});
				t.equal(result.code, expected + '', description);
			});
		});
	}
});

function readFixture(name, callback) {
	readFile(`test/fixtures/${name}.js`, (err, contents) => {
		if (err) {
			throw err;
		}
		callback(contents);
	});
}
