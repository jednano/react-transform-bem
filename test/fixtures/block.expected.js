'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({

	displayName: 'Foo',

	render: function render() {
		return _react2.default.createElement('div', { block: 'foo', modifiers: 'x {y}', className: 'foo foo--x foo--{y} z' });
	}
});