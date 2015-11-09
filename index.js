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
			CallExpression(node) {
				if (t.isReturnStatement(node.parent)) {
					walkCallExpressions(null, node.node);
				}
			}
		}
	};
}

function walkCallExpressions(ancestorBlock, node) {
	if (!isReactCreateElementExpression(node)) {
		return;
	}

	const [ type, props, ...children ] = node.arguments;

	if (!t.isStringLiteral(type)) {
		return;
	}

	if (!t.isObjectExpression(props)) {
		return;
	}

	let { block, element, modifiers } = consumeBEMProperties(props);

	if (block && element) {
		throw new Error('BEM element cannot also be a block');
	}

	block = block || ancestorBlock;

	if (!validateBEMAttributes({ block, element, modifiers })) {
		return;
	}

	const { properties } = props;
	assignClassName({ properties, block, element, modifiers });

	children.forEach(walkCallExpressions.bind(this, block));
}

function isReactCreateElementExpression(node) {
	const { callee } = node;
	if (!t.isMemberExpression(callee)) {
		return false;
	}
	if (callee.object.name !== 'React') {
		return false;
	}
	if (callee.property.name !== 'createElement') {
		return false;
	}
	return true;
}

function consumeBEMProperties(obj) {
	let block, element, modifiers;
	obj.properties.forEach(({ key, value }, index) => {
		if (key.name === 'element') {
			element = consumeProperty({ value, index });
			return;
		}
		if (key.name === 'modifiers') {
			modifiers = consumeProperty({ value, index });
			return;
		}
		if (key.name === 'block') {
			block = consumeProperty({ value, index });
			return;
		}
	});
	obj.properties = compact(obj.properties);
	return { block, element, modifiers };

	function consumeProperty({ value, index }) {
		delete obj.properties[index];
		if (t.isIdentifier(value)) {
			return `{${value.name}}`;
		}
		return value.value;
	}
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

function assignClassName({ properties, block, element, modifiers }) {
	let prefix = `${opts.blockPrefix}${block}`;
	if (element) {
		prefix += `${opts.elementPrefix}${element}`;
	}
	const classNameList = buildModifiers(prefix, modifiers);
	const classNameProp = find(properties, prop => prop.key.name === 'className');
	if (classNameProp) {
		const { value } = classNameProp;
		value.value = classNameList.concat(value.value).join(' ');
		return;
	}
	properties.push(new t.ObjectProperty(
		new t.Identifier('className'),
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
