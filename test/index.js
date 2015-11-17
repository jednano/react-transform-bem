import { readFile, writeFile } from 'fs';
import { join } from 'path';
import test from 'tape';
import { transform } from 'babel-core';
import glob from 'glob';
import reactTransformBEM from '..';

test('react-transform-bem', t => {
	glob(join(__dirname, 'cases', '*'), (err, folders) => {
		if (err) {
			throw err;
		}
		t.plan(folders.length);
		folders.forEach(folder => testCase(folder));
	});

	function testCase(folder) {
		readFile(join(folder, 'input.jsx'), (err, source) => {
			if (err) {
				throw err;
			}
			const xform = () => transform(source, {
				presets: ['react', 'es2015'],
				plugins: [
					[reactTransformBEM, pluginOptions || {}]
				]
			});
			const {
				pluginOptions,
				description,
				throwsRegExp
			} = require(join(folder, 'spec'));
			if (throwsRegExp) {
				t.throws(xform, new RegExp(throwsRegExp), description);
				return;
			}
			readFile(join(folder, 'expected.js'), (err2, expected) => {
				if (err2) {
					throw err2;
				}
				const result = xform();
				t.equal(result.code, expected + '', description);
				writeFile(join(folder, 'actual.js'), result.code);
			});
		});
	}
});
