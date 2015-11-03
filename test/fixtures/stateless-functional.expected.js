"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	return React.createElement("div", { block: "foo", modifiers: "x {y}", className: "foo foo--x foo--{y} z" });
};