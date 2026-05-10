import React from 'react';

interface ScrollbarProps {
	children?: React.ReactNode;
}

export default function Scrollbar({ children }: ScrollbarProps) {
	return <div style={{ height: '100%', overflow: 'auto' }}>{children}</div>;
}
