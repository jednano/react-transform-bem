export default () => {
	const isFoo = true;
	const isBar = false;
	return (
		<div block="b" modifiers={{
			foo: isFoo,
			bar: isBar,
			baz: true,
			qux: false
		}} />
	);
};
