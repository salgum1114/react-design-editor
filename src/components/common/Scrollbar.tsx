import React from 'react';

type ScrollbarProps = React.HTMLAttributes<HTMLDivElement>;

export default function Scrollbar({ children, style, ...props }: ScrollbarProps) {
	return (
		<div {...props} style={{ height: '100%', overflow: 'auto', ...style }}>
			{children}
		</div>
	);
}
