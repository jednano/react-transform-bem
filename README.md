# react-transform-bem

[![NPM version](http://img.shields.io/npm/v/react-transform-bem.svg?style=flat)](https://www.npmjs.org/package/react-transform-bem)
[![npm license](http://img.shields.io/npm/l/react-transform-bem.svg?style=flat-square)](https://www.npmjs.org/package/react-transform-bem)
[![Travis Build Status](https://img.shields.io/travis/jedmao/react-transform-bem.svg?label=unix)](https://travis-ci.org/jedmao/react-transform-bem)

[![npm](https://nodei.co/npm/react-transform-bem.svg?downloads=true)](https://nodei.co/npm/react-transform-bem/)

A [`react-transform`](https://github.com/litek/react-transform) that
constructs BEM classes from `block`, `element` and `modifiers` attributes.

## Introduction

**_Warning: This project is not yet production ready._**

Writing BEM classes in your HTML can be a pain; instead, this transform
constructs class names for you. All you have to do is specify which DOM
elements are blocks with the `block` attribute, elements with the
`element` attribute and modifiers with the `modifiers` attribute. These
attributes will be consumed and replaced with the `className` attribute,
where all necessary class names are written.

## Installation

```
$ npm install react-transform-bem [--save[-dev]]
```

## Usage

The following React component...

```jsx
export default () => (
	<div block="person" modifiers="female">
		<div element="mouth" />
		<div element="hand" modifiers="right open" />
	</div>
);
```

Becomes...

```html
<div class="person person--female">
	<div class="person__mouth"></div>
	<div class="person__hand person__hand--right person__hand--open"></div>
</div>
```

To prevent too many class names from being generated, you won't find classes
like `person--female__mouth` and especially not `person--female__hand--right`;
instead, you would target `person__mouth` within `person--female` by writing
`.person--female .person__mouth` in CSS. This increases CSS specificity only
slightly and only when a modifier is used, which is still quite maintainable.

## Configuration

A common strategy is to place a
[babelrc](https://babeljs.io/docs/usage/babelrc/) file at your project root.
Here is a default configuration for [`babel-plugin-react-transform`](https://github.com/gaearon/babel-plugin-react-transform):

```json
{
	"presets": ["react", "es2015"],
	"plugins": [
		["react-transform", {
			"transforms": [
				{
					"transform": "react-transform-bem",
					"imports": [
						"react",
						"classnames",
						"lodash.assign",
						"lodash.compact",
						"lodash.find",
						"lodash.isstring"
					],
					"blockPrefix": "",
					"elementPrefix": "__",
					"modifierPrefix": "--"
				}
			]
		}]
	]
}
```

## Options

### blockPrefix

Type: `String`<br>
Required: `false`<br>
Default: `empty`

You may wish to namespace all of your BEM blocks. The `blockPrefix` allows you to do this.
If you set `blockPrefix` to `foo-`, all of your blocks will be prefixed with `foo-` (e.g., `foo-block1`, `foo-block2`).

### elementPrefix

Type: `String`<br>
Required: `false`<br>
Default: `__`

The string that appears between a BEM block its elements (e.g., `block__element`).

### modifierPrefix

Type: `String`<br>
Required: `false`<br>
Default: `--`

The string that appears between a BEM block and its modifiers (e.g., `block--modifier`);
also, between a BEM element and its modifiers (e.g., `block__element--modifier`).
