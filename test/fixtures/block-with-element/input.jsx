export default React.createClass({

	displayName: 'Foo',

	render() {
		return (
			<div block="b" modifiers="m1 {m2}" className="c1">
				<div element="e1" modifiers="m3 {m4}" className="c2" />
			</div>
		);
	}

});
