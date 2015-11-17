import assign from 'lodash.assign';
import compact from 'lodash.compact';
import find from 'lodash.find';
import isArray from 'lodash.isarray';
import isString from 'lodash.isstring';

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

	if (!t.isStringLiteral(type) || !t.isObjectExpression(props)) {
		children.forEach(walkCallExpressions.bind(this, ancestorBlock));
		return;
	}

	let { block, element, modifiers } = consumeBEMProperties(props);

	if (block && element) {
		throw new Error('BEM element cannot also be a block');
	}

	block = block || ancestorBlock;

	children.forEach(walkCallExpressions.bind(this, block));

	if (!validateBEMAttributes({ block, element, modifiers })) {
		return;
	}

	const { properties } = props;
	assignClassName({ properties, block, element, modifiers });
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
		return resolveTokenValue(value);
	}
}

function resolveTokenValue(token) {
	if (t.isStringLiteral(token) || t.isBooleanLiteral(token)) {
		return token.value;
	}
	if (t.isIdentifier(token)) {
		return `{${token.name}}`;
	}
	return token;
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
	const className = buildModifiers(prefix, modifiers);

	const classNameProp = find(properties, prop => prop.key.name === 'className');
	if (!classNameProp) {
		properties.push(buildClassName());
		return;
	}

	const { value } = classNameProp;

	if (t.isStringLiteral(value)) {
		value.value = `${className} ${value.value}`;
		return;
	}

	if (isArray(className)) {
		className.push(new t.StringLiteral(value.value));
		classNameProp.value = buildClassName();
		return;
	}

	throw new Error('Unsupported className for BEM block or element');

	function buildClassName() {
		return new t.ObjectProperty(
			new t.Identifier('className'),
			isString(className)
				? new t.StringLiteral(className)
				: new t.CallExpression(
					new t.Identifier('classnames'),
					className
				)
		);
	}
}

function buildModifiers(prefix, modifiers) {
	if (!modifiers) {
		return prefix;
	}
	if (isString(modifiers)) {
		return [prefix].concat(modifiers.split(/\s+/g).map(
			modifier => `${prefix}${opts.modifierPrefix}${modifier}`
		)).join(' ');
	}
	if (t.isObjectExpression(modifiers)) {
		return [new t.StringLiteral(prefix)].concat(
			compact(modifiers.properties.map(({ key, value }) => {
				key = new t.StringLiteral(
					`${prefix}${opts.modifierPrefix}${key.name}`
				);
				if (t.isBooleanLiteral(value)) {
					if (value.value === false) {
						return false;
					}
					return key;
				}
				return new t.ObjectExpression([
					new t.ObjectProperty(key, value)
				]);
			}))
		);
	}
	throw new Error('Unsupported value for BEM modifiers');
}
