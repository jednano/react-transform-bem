export default React.createClass({

	displayName: 'Foo',

	render() {
		const block = 'b';
		return (
			<div {...{block}} />
		);
	}

});
