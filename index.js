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

	return {
		visitor: {
			JSXElement(node) {
				walkJSXElements(null, node.node);
			}
		}
	};

	function walkJSXElements(ancestorBlock, node) {
		if (!t.isJSXElement(node)) {
			return;
		}
		const { openingElement, children } = node;
		let { block, element, modifiers } = consumeBEMAttributes(openingElement);

		block = block || ancestorBlock;

		if (!validateBEMAttributes({ block, element, modifiers })) {
			return;
		}

		assignClassName({
			attrs: openingElement.attributes,
			block,
			element,
			modifiers
		});

		children.forEach(walkJSXElements.bind(this, block));
	}
}

function consumeBEMAttributes(elem) {
	let attrs = elem.attributes;
	let block, element, modifiers;
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
	elem.attributes = compact(attrs);
	return { block, element, modifiers };
}

function validateBEMAttributes({ block, element, modifiers }) {
	if (block) {
		return true;
	}
	if (element) {
		throw new Error('BEM element must have an ancestor block');
	}
	if (modifiers) {
		throw new Error('BEM modifiers must be attached to a block or an element');
	}
	return false;
}

function assignClassName({ attrs, block, element, modifiers }) {
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
