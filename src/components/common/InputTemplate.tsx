import React from 'react';
import MonacoCodeEditor from '../monaco/MonacoCodeEditor';

interface InputTemplateProps {
	defaultValue?: string;
	value?: string;
	width?: string | number;
	height?: string | number;
	showLineNumbers?: boolean;
	newLineMode?: boolean;
	disabled?: boolean;
	onChange?: (value: string) => void;
}

export default function InputTemplate({
	defaultValue,
	disabled = false,
	height = '200px',
	newLineMode = true,
	onChange,
	showLineNumbers = true,
	value,
	width = '100%',
}: InputTemplateProps) {
	const [text, setText] = React.useState(value || '');

	React.useEffect(() => {
		setText(value || '');
	}, [value]);

	const handleChange = (nextValue: string) => {
		onChange?.(nextValue);
		setText(nextValue);
	};

	return (
		<MonacoCodeEditor
			language="handlebars"
			width={typeof width === 'number' ? `${width}px` : width}
			height={typeof height === 'number' ? `${height}px` : height}
			defaultValue={defaultValue || text}
			value={text}
			onChange={handleChange}
			readOnly={disabled}
			singleLine={!newLineMode}
			options={{
				folding: newLineMode,
				glyphMargin: false,
				lineNumbers: showLineNumbers ? 'on' : 'off',
				lineNumbersMinChars: showLineNumbers ? 3 : 0,
				wordWrap: newLineMode ? 'on' : 'off',
			}}
		/>
	);
}
