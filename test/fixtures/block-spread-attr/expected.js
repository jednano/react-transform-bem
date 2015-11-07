'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = React.createClass({

	displayName: 'Foo',

	render: function render() {
		var block = 'b';
		return React.createElement('div', {
			className: '{block}'
		});
	}
});