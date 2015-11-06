import assign from 'lodash.assign';
import compact from 'lodash.compact';
import isPlainObject from 'lodash.isplainobject';
import isString from 'lodash.isstring';
import keys from 'lodash.keys';
import pick from 'lodash.pick';

const defaultOptions = {
	blockPrefix: '',
	elementPrefix: '__',
	modifierPrefix: '--'
};

let opts;

export default ({ options, types: t }) => {
	opts = assign({}, defaultOptions, options);

	let block;

	return {
		visitor: {
			JSXElement(node, parent) {
				const { openingElement } = node.node;
				const attrs = openingElement.attributes;

				let element, modifiers;
				attrs.forEach(({ name, value }, index) => {
					if (name.name === 'element') {
						element = value.value;
						delete attrs[index];
						return;
					}
					if (name.name === 'modifiers') {
						modifiers = value.value;
						delete attrs[index];
						return;
					}
					if (name.name === 'block') {
						block = value.value;
						delete attrs[index];
						return;
					}
				});

				if (!block) {
					if (element) {
						throw new Error('BEM element must have an ancestor block');
					}
					if (modifiers) {
						throw new Error('BEM modifiers must be attached to a block or an element');
					}
					return;
				}

				openingElement.attributes = compact(attrs);

				attrs.forEach(({ name, value }) => {
					if (name.name === 'className') {
						let prefix = `${opts.blockPrefix}${block}`;
						if (element) {
							prefix += `${opts.elementPrefix}${element}`;
						}
						value.value = buildModifiers(prefix, modifiers)
							.concat(value.value)
							.join(' ');
					}
				});
			}
		}
	};
}

function buildModifiers(prefix, modifiers) {
	if (!modifiers) {
		return [prefix];
	}
	if (isString(modifiers)) {
		modifiers = modifiers.split(/\s+/);
	} else if (isPlainObject(modifiers)) {
		modifiers = keys(pick(modifiers, v => !!v));
	}
	return [prefix].concat(modifiers.map(
		modifier => `${prefix}${opts.modifierPrefix}${modifier}`
	));
}
