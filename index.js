import assign from 'lodash.assign';
import compact from 'lodash.compact';
import find from 'lodash.find';
import isPlainObject from 'lodash.isplainobject';
import isString from 'lodash.isstring';
import keys from 'lodash.keys';
import pick from 'lodash.pick';

const defaultOptions = {
	blockPrefix: '',
	elementPrefix: '__',
	modifierPrefix: '--'
};

let opts, t;

export default ({ options, types }) => {
	opts = assign({}, defaultOptions, options);
	t = types;

	return {
		visitor: {
			JSXElement(node) {
				walkJSXElements(null, node.node);
			}
		}
	};
}

function walkJSXElements(ancestorBlock, node) {
	if (!t.isJSXElement(node)) {
		return;
	}

	const { openingElement, children } = node;
	let { block, element, modifiers } = consumeBEMAttributes(openingElement);

	if (block && element) {
		throw new Error('BEM element cannot also be a block');
	}

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

function consumeBEMAttributes(elem) {
	let attrs = elem.attributes;
	let block, element, modifiers;
	attrs.forEach(({ name, value }, index) => {
		if (name.name === 'element') {
			element = value.value || `{${value.expression.name}}`;
			delete attrs[index];
			return;
		}
		if (name.name === 'modifiers') {
			modifiers = value.value || `{${value.expression.name}}`;
			delete attrs[index];
			return;
		}
		if (name.name === 'block') {
			block = value.value || `{${value.expression.name}}`;
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
	let prefix = `${opts.blockPrefix}${block}`;
	if (element) {
		prefix += `${opts.elementPrefix}${element}`;
	}
	const classNameList = buildModifiers(prefix, modifiers);
	const classNameAttr = find(attrs, attr => attr.name.name === 'className');
	if (classNameAttr) {
		const { value } = classNameAttr;
		value.value = classNameList.concat(value.value).join(' ');
		return;
	}
	attrs.push(new t.JSXAttribute(
		new t.JSXIdentifier('className'),
		new t.StringLiteral(classNameList.join(' '))
	));
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
