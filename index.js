import assign from 'lodash.assign';
import isString from 'lodash.isstring';

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
			CallExpression(node, parent) {
				const { callee } = node.node;
				if (!t.isMemberExpression(callee)) {
					return;
				}
				if (callee.object.name !== 'React') {
					return;
				}
				if (callee.property.name !== 'createElement') {
					return;
				}

				const args = node.node.arguments;
				let [ type, props ] = args;
				if (!t.isStringLiteral(type)) {
					return;
				}
				if (!t.isObjectExpression(props)) {
					return;
				}

				let block, element, modifiers;
				props.properties.forEach(prop => {
					const { key, value } = prop;
					if (key.name === 'block') {
						block = value.value;
					}
					if (key.name === 'element') {
						element = value.value;
					}
					if (key.name === 'modifiers') {
						modifiers = value.value;
					}
				});

				props.properties.forEach(prop => {
					const { key, value } = prop;
					if (key.name === 'className') {
						value.value =
							buildModifiers(element || block, modifiers)
							.concat(value.value)
							.join(' ');
					}
				});
			}
		}
	};
}

function buildModifiers(blockOrElement, modifiers) {
    if (!modifiers) {
        return [blockOrElement];
    }
    if (isString(modifiers)) {
        modifiers = modifiers.split(/\s+/);
    } else if (isPlainObject(modifiers)) {
        modifiers = keys(pick(modifiers, v => !!v));
    }
    return [blockOrElement].concat(modifiers.map(modifier => {
    	return [
    		opts.blockPrefix,
    		blockOrElement,
    		opts.modifierPrefix,
    		modifier
    	].join('');
    }));
}
