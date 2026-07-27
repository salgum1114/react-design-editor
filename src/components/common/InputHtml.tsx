import { debounce } from 'lodash-es';
import React from 'react';
import MonacoCodeEditor from '../monaco/MonacoCodeEditor';
import { markersToErrors } from '../monaco/monacoEditor.model';

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
	const textRef = React.useRef(text);
	const errorsRef = React.useRef<Error[]>([]);
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
		debouncedValidateRef.current?.(errorsRef.current.length ? errorsRef.current : undefined);
	};

	const handleValidate: React.ComponentProps<typeof MonacoCodeEditor>['onValidate'] = markers => {
		errorsRef.current = markersToErrors(markers || []);
		debouncedValidateRef.current?.(errorsRef.current.length ? errorsRef.current : undefined);
	};

	return (
		<MonacoCodeEditor
			language="html"
			width={typeof width === 'number' ? `${width}px` : width}
			height={typeof height === 'number' ? `${height}px` : height}
			defaultValue={defaultValue || text}
			value={text}
			onChange={handleChange}
			onValidate={handleValidate}
			readOnly={disabled}
		/>
	);
}
