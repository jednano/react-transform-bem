const Foo = ({ block }) => (
	<div {...{block}}>
		{children}
	</div>
);

export default () => (
	<Foo block="b">
		<div element="e" />
	</Foo>
);
