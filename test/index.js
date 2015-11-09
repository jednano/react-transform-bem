import { readFile, writeFile } from 'fs';
import { join } from 'path';
import test from 'tape';
import { transform } from 'babel-core';
import glob from 'glob';
import reactTransformBEM from '..';

test('react-transform-bem', t => {
	glob(join(__dirname, 'fixtures', '*'), (err, folders) => {
		if (err) {
			throw err;
		}
		t.plan(folders.length);
		folders.forEach(folder => testFixture(folder));
	});

	function testFixture(folder) {
		readFile(join(folder, 'input.jsx'), (err, source) => {
			if (err) {
				throw err;
			}
			readFile(join(folder, 'expected.js'), (err2, expected) => {
				if (err2) {
					throw err2;
				}
				const { pluginOptions, description } = require(join(folder, 'spec'));
				const result = transform(source, {
					presets: ['react', 'es2015'],
					plugins: [
						[reactTransformBEM, pluginOptions || {}]
					]
				});
				t.equal(result.code, expected + '', description);
				writeFile(join(folder, 'actual.js'), result.code);
			});
		});
	}
});
