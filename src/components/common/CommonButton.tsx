import { Button, Tooltip } from 'antd';
import type { ButtonProps } from 'antd';
import React from 'react';

import Icon from '../icon/Icon';

interface CommonButtonProps extends ButtonProps {
	name?: string;
	id?: string;
	wrapperStyle?: React.CSSProperties;
	wrapperClassName?: string;
	tooltipTitle?: React.ReactNode;
	tooltipPlacement?: any;
	icon?: string;
	iconStyle?: React.CSSProperties;
	iconClassName?: string;
	iconAnimation?: string;
	visible?: boolean;
	children?: React.ReactNode;
}

export default function CommonButton({
	children,
	icon,
	iconAnimation,
	iconClassName,
	iconStyle,
	tooltipPlacement,
	tooltipTitle,
	visible = true,
	wrapperClassName,
	wrapperStyle,
	...buttonProps
}: CommonButtonProps) {
	if (!visible) {
		return null;
	}

	const content = (
		<Button {...buttonProps}>
			{icon ? <Icon name={icon} style={iconStyle} className={iconClassName} animation={iconAnimation} /> : null}
			{children}
		</Button>
	);

	return (
		<Tooltip title={tooltipTitle} placement={tooltipPlacement}>
			{wrapperClassName || wrapperStyle ? (
				<span style={wrapperStyle} className={wrapperClassName}>
					{content}
				</span>
			) : (
				content
			)}
		</Tooltip>
	);
}
