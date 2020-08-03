import React from 'react';

export interface ItemProps extends React.HTMLAttributes<any> {
	alignSelf?: 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';
	order?: number;
	flexGrow?: number | string;
	flexShrink?: number | string;
	flexBasis?: number | string;
	flex?: number | string;
}

const Item: React.SFC<ItemProps> = props => {
	const { alignSelf, order, flexGrow, flexShrink, flexBasis, flex, style, children, ...other } = props;
	const newStyle = Object.assign(
		{},
		{
			alignSelf,
			order,
			flexGrow,
			flexShrink,
			flexBasis,
			flex,
		},
		style,
	) as any;
	return (
		<div
			style={Object.keys(newStyle).reduce((prev, key) => {
				if (newStyle[key]) {
					return Object.assign(prev, { [key]: newStyle[key] });
				}
				return prev;
			}, {})}
			{...other}
		>
			{children}
		</div>
	);
};

export default Item;
