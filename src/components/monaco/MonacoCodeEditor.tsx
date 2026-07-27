import Editor, { type EditorProps, type Monaco, type OnMount } from '@monaco-editor/react';
import React from 'react';
import './monacoEnvironment';
import { normalizeMonacoLanguage } from './monacoEditor.model';

type MonacoEditorInstance = Parameters<OnMount>[0];

export interface MonacoCodeEditorHandle {
	readonly editor: MonacoEditorInstance | null;
	readonly monaco: Monaco | null;
}

interface MonacoCodeEditorProps {
	className?: string;
	defaultValue?: string;
	height?: string;
	language: string;
	onChange?: (value: string) => void;
	onMount?: OnMount;
	onValidate?: EditorProps['onValidate'];
	options?: EditorProps['options'];
	readOnly?: boolean;
	singleLine?: boolean;
	theme?: string;
	value?: string;
	width?: string;
}

const MonacoCodeEditor = React.forwardRef<MonacoCodeEditorHandle, MonacoCodeEditorProps>(
	function MonacoCodeEditor(
		{
			className,
			defaultValue,
			height = '200px',
			language,
			onChange,
			onMount,
			onValidate,
			options,
			readOnly = false,
			singleLine = false,
			theme = 'vs-dark',
			value,
			width = '100%',
		},
		ref,
	) {
		const editorRef = React.useRef<MonacoEditorInstance | null>(null);
		const monacoRef = React.useRef<Monaco | null>(null);

		React.useImperativeHandle(
			ref,
			() => ({
				get editor() {
					return editorRef.current;
				},
				get monaco() {
					return monacoRef.current;
				},
			}),
			[],
		);

		const handleMount: OnMount = (editorInstance, monaco) => {
			editorRef.current = editorInstance;
			monacoRef.current = monaco;

			if (singleLine) {
				editorInstance.addCommand(monaco.KeyCode.Enter, (): void => {});
			}

			onMount?.(editorInstance, monaco);
		};

		return (
			<div className={`rde-monaco-editor ${className || ''}`} style={{ width, height }}>
				<Editor
					defaultLanguage={normalizeMonacoLanguage(language)}
					defaultValue={defaultValue}
					height="100%"
					language={normalizeMonacoLanguage(language)}
					onChange={nextValue => onChange?.(nextValue || '')}
					onMount={handleMount}
					onValidate={onValidate}
					options={{
						automaticLayout: true,
						contextmenu: true,
						fixedOverflowWidgets: true,
						fontFamily: "'Roboto Mono', Consolas, monospace",
						fontSize: 12,
						lineNumbersMinChars: 3,
						minimap: { enabled: false },
						overviewRulerLanes: 0,
						padding: { top: 9, bottom: 9 },
						readOnly,
						renderLineHighlight: 'line',
						scrollBeyondLastLine: false,
						smoothScrolling: true,
						tabSize: 2,
						...options,
					}}
					theme={theme}
					value={value}
					width="100%"
				/>
			</div>
		);
	},
);

export default MonacoCodeEditor;
