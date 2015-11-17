const Foo = ({ block }) => (
	<div {...{block}}>
		{children}
	</div>
);

export default () => (
	<Foo block="b" modifiers="m1 m2">
		<div element="e" />
	</Foo>
);
