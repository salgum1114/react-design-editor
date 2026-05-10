import type { Ace } from 'ace-builds';
import ace from 'ace-builds/src-noconflict/ace';
import React from 'react';

type AceAnnotation = {
	row: number;
	column: number;
	type: string;
	text: string;
	[key: string]: any;
};

export interface AceCodeEditorHandle {
	editor: Ace.Editor | null;
}

interface AceCodeEditorProps {
	className?: string;
	defaultValue?: string;
	editorProps?: Record<string, any>;
	height?: string;
	maxLines?: number;
	minLines?: number;
	mode: string;
	onChange?: (value: string) => void;
	onValidate?: (annotations: AceAnnotation[]) => void;
	readOnly?: boolean;
	setOptions?: Record<string, any>;
	style?: React.CSSProperties;
	theme: string;
	value?: string;
	width?: string;
}

const AceCodeEditor = React.forwardRef<AceCodeEditorHandle, AceCodeEditorProps>(function AceCodeEditor(
	{
		className,
		defaultValue,
		editorProps,
		height = '200px',
		maxLines,
		minLines,
		mode,
		onChange,
		onValidate,
		readOnly = false,
		setOptions,
		style,
		theme,
		value,
		width = '100%',
	},
	ref,
) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const editorRef = React.useRef<Ace.Editor | null>(null);
	const onChangeRef = React.useRef(onChange);
	const onValidateRef = React.useRef(onValidate);
	const syncingValueRef = React.useRef(false);

	React.useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	React.useEffect(() => {
		onValidateRef.current = onValidate;
	}, [onValidate]);

	React.useImperativeHandle(
		ref,
		() => ({
			editor: editorRef.current,
		}),
		[],
	);

	React.useEffect(() => {
		if (!containerRef.current) {
			return undefined;
		}

		const editor = ace.edit(containerRef.current);
		editorRef.current = editor;
		Object.assign(editor as any, editorProps);
		editor.session.setMode(`ace/mode/${mode}`);
		editor.setTheme(`ace/theme/${theme}`);
		editor.setReadOnly(readOnly);
		editor.setOptions({
			...(setOptions || {}),
			maxLines,
			minLines,
		});
		editor.setValue(value ?? defaultValue ?? '', -1);

		const handleChange = () => {
			if (syncingValueRef.current) {
				return;
			}
			onChangeRef.current?.(editor.getValue());
		};

		const handleValidate = () => {
			onValidateRef.current?.((editor.session.getAnnotations() as AceAnnotation[]) || []);
		};

		editor.on('change', handleChange);
		editor.session.on('changeAnnotation', handleValidate);
		handleValidate();

		return () => {
			editor.off('change', handleChange);
			editor.session.off('changeAnnotation', handleValidate);
			editor.destroy();
			editorRef.current = null;
		};
	}, []);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}
		editor.session.setMode(`ace/mode/${mode}`);
	}, [mode]);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}
		editor.setTheme(`ace/theme/${theme}`);
	}, [theme]);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}
		Object.assign(editor as any, editorProps);
	}, [editorProps]);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}
		editor.setReadOnly(readOnly);
		editor.setOptions({
			...(setOptions || {}),
			maxLines,
			minLines,
		});
	}, [maxLines, minLines, readOnly, setOptions]);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor || value === undefined || value === editor.getValue()) {
			return;
		}
		syncingValueRef.current = true;
		editor.setValue(value, -1);
		syncingValueRef.current = false;
	}, [value]);

	React.useEffect(() => {
		editorRef.current?.resize();
	}, [height, width]);

	return <div ref={containerRef} className={className} style={{ ...style, width, height }} />;
});

export default AceCodeEditor;
