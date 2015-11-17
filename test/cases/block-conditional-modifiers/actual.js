"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var isFoo = true;
	var isBar = false;
	return React.createElement("div", {
		className: classnames("b", {
			"b--foo": isFoo
		}, {
			"b--bar": isBar
		}, "b--baz")
	});
};