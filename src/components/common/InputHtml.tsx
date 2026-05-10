import { debounce } from 'lodash-es';
import React from 'react';
import AceCodeEditor from '../ace/AceCodeEditor';

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-github';

interface InputHtmlProps {
	defaultValue?: string;
	value?: string;
	width?: string | number;
	height?: string | number;
	onChange?: (value: string) => void;
	onValidate?: (errors?: Error[]) => void;
	disabled?: boolean;
}

export default function InputHtml({
	defaultValue,
	disabled = false,
	height = '200px',
	onChange,
	onValidate,
	value,
	width = '100%',
}: InputHtmlProps) {
	const [text, setText] = React.useState(value || '');
	const aceRef = React.useRef<any>(null);
	const textRef = React.useRef(text);
	const debouncedValidateRef = React.useRef<any>(null);

	React.useEffect(() => {
		textRef.current = value || '';
		setText(value || '');
	}, [value]);

	React.useEffect(() => {
		const debouncedValidate = debounce((errors?: Error[]) => {
			onValidate?.(errors);
			onChange?.(textRef.current);
		}, 200);
		debouncedValidateRef.current = debouncedValidate;
		return () => {
			debouncedValidate.cancel();
		};
	}, [onChange, onValidate]);

	const handleChange = (nextValue: string) => {
		textRef.current = nextValue;
		setText(nextValue);
		debouncedValidateRef.current?.();
	};

	const handleValidate = (annotations: any[]) => {
		if (annotations.length) {
			const errors = annotations
				.filter(annotation => annotation.type === 'error')
				.map(annotation => new Error(`${annotation.row}:${annotation.column} ${annotation.text} error`));
			debouncedValidateRef.current?.(errors);
		}
	};

	return (
		<AceCodeEditor
			ref={aceRef}
			mode="html"
			theme="github"
			width={typeof width === 'number' ? `${width}px` : width}
			height={typeof height === 'number' ? `${height}px` : height}
			defaultValue={defaultValue || text}
			value={text}
			editorProps={{
				$blockScrolling: true,
			}}
			onChange={handleChange}
			onValidate={handleValidate}
			readOnly={disabled}
		/>
	);
}
