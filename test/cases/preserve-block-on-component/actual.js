"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var Foo = function Foo(_ref) {
	var block = _ref.block;
	return React.createElement(
		"div",
		{
			className: "{block}"
		},
		children
	);
};

exports.default = function () {
	return React.createElement(
		Foo,
		{ block: "b" },
		React.createElement("div", {
			className: "b__e"
		})
	);
};