"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = React.createClass({

	displayName: 'Foo',

	render: function render() {
		return React.createElement(
			"div",
			{ className: "b b--m1 b--{m2} c1" },
			React.createElement("div", { className: "b__e1 b__e1--m3 b__e1--{m4} c2" })
		);
	}
});