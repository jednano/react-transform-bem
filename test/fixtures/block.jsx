import React from 'react';

export default React.createClass({

	displayName: 'Foo',

	render() {
		return (
			<div block="foo" modifiers="x {y}" className="z" />
		);
	}

});
