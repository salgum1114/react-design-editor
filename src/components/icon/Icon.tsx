import React from 'react';

interface IconProps {
	name?: string | null;
	color?: string;
	style?: React.CSSProperties;
	className?: string;
	size?: number;
	innerIcon?: string | null;
	innerColor?: string;
	innerClassName?: string;
	innerSize?: number;
	prefix?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	animation?: string;
}

const getIconHtml = (
	prefix: string,
	name: string,
	className: string,
	size: number,
	color: string,
	style?: React.CSSProperties,
	onClick?: React.MouseEventHandler<HTMLElement>,
) => {
	const iconClassName = `${prefix} fa-${name} ${className}`.trim();
	const iconStyle = Object.assign({}, style, {
		fontSize: `${size}em`,
		color,
	});
	return <i className={iconClassName} style={iconStyle} onClick={onClick} />;
};

export default function Icon({
	className = '',
	color = '',
	innerClassName = '',
	innerColor = '',
	innerIcon = null,
	innerSize = 1,
	name = null,
	onClick,
	prefix = 'fas',
	size = 1,
	style,
}: IconProps) {
	if (!name) {
		return null;
	}

	let normalizedName = name;
	if (normalizedName.startsWith('icon-')) {
		normalizedName = normalizedName.substring('icon-'.length);
	}

	const iconHtml = getIconHtml(prefix, normalizedName, className, size, color, style, onClick);
	if (!innerIcon) {
		return iconHtml;
	}

	const innerIconHtml = getIconHtml(prefix, innerIcon, innerClassName, innerSize, innerColor, style, onClick);

	return (
		<span className="fa-stack">
			{iconHtml}
			{innerIconHtml}
		</span>
	);
}
