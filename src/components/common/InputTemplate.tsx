import React from 'react';
import AceCodeEditor from '../ace/AceCodeEditor';

import 'ace-builds/src-noconflict/mode-handlebars';
import 'ace-builds/src-noconflict/theme-github';

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
	const aceRef = React.useRef<any>(null);
	const keyboardHandlerAttachedRef = React.useRef(false);

	React.useEffect(() => {
		setText(value || '');
	}, [value]);

	React.useEffect(() => {
		if (!newLineMode && aceRef.current?.editor && !keyboardHandlerAttachedRef.current) {
			aceRef.current.editor.keyBinding.addKeyboardHandler(
				(_data: any, _hashId: any, _keyString: any, keyCode: number) => {
					if (keyCode === 13) {
						return { command: 'null' };
					}
					return undefined;
				},
			);
			keyboardHandlerAttachedRef.current = true;
		}
	}, [newLineMode]);

	const handleChange = (nextValue: string) => {
		onChange?.(nextValue);
		setText(nextValue);
	};

	return (
		<AceCodeEditor
			ref={aceRef}
			mode="handlebars"
			theme="github"
			width={typeof width === 'number' ? `${width}px` : width}
			height={typeof height === 'number' ? `${height}px` : height}
			defaultValue={defaultValue || text}
			value={text}
			editorProps={{
				$blockScrolling: true,
			}}
			onChange={handleChange}
			maxLines={!newLineMode ? 1 : undefined}
			setOptions={{
				showLineNumbers,
				readOnly: disabled,
			}}
		/>
	);
}
