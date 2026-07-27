import { ColorPicker as AntdColorPicker, Button } from 'antd';
import React from 'react';

type RGBAColor = {
	r: number;
	g: number;
	b: number;
	a: number;
};

type AntdColor = {
	toRgb: () => RGBAColor;
};

type ColorValue = string | RGBAColor;

interface ColorPickerProps {
	valueType?: 'string' | 'object';
	value?: ColorValue;
	onChange?: (value: ColorValue) => void;
}

const getBackgroundColor = (color: ColorValue) => {
	if (typeof color === 'string') {
		return color;
	}
	return `rgba(${color.r},${color.g},${color.b},${color.a})`;
};

export default function ColorPicker({ onChange, value, valueType = 'string' }: ColorPickerProps) {
	const [color, setColor] = React.useState<ColorValue>(value || 'rgba(255, 255, 255, 1)');

	React.useEffect(() => {
		setColor(value || 'rgba(255, 255, 255, 1)');
	}, [value]);

	const handleChange = (nextColor: AntdColor, css: string) => {
		const rgb = nextColor.toRgb();
		const newColor = valueType === 'string' ? css : { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
		setColor(newColor);
		onChange?.(newColor);
	};

	return (
		<AntdColorPicker value={getBackgroundColor(color)} onChange={handleChange}>
			<Button style={{ background: getBackgroundColor(color) }} shape="circle" />
		</AntdColorPicker>
	);
}
