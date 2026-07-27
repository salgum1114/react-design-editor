import { Col, Form, Row } from 'antd';
import type { EditorProps } from '@monaco-editor/react';
import { debounce } from 'lodash-es';
import React from 'react';
import MonacoCodeEditor from './MonacoCodeEditor';
import MonacoPreview from './MonacoPreview';

const defaultStyle = {
	padding: 12,
};

interface MonacoEditorProps {
	isHTML?: boolean;
	isCSS?: boolean;
	isJS?: boolean;
	isPreview?: boolean;
	html?: string;
	css?: string;
	js?: string;
	onChangeHTML?: (value: string) => void;
	onChangeCSS?: (value: string) => void;
	onChangeJS?: (value: string) => void;
}

interface MonacoEditorState {
	html: string;
	css: string;
	js: string;
	htmlMarkers: MonacoMarkers;
	cssMarkers: MonacoMarkers;
	jsMarkers: MonacoMarkers;
}

type MonacoMarkers = Parameters<NonNullable<EditorProps['onValidate']>>[0];

class MonacoEditor extends React.Component<MonacoEditorProps, MonacoEditorState> {
	static defaultProps: Required<
		Pick<MonacoEditorProps, 'isHTML' | 'isCSS' | 'isJS' | 'isPreview' | 'html' | 'css' | 'js'>
	> = {
		isHTML: true,
		isCSS: true,
		isJS: true,
		isPreview: true,
		html: '',
		css: '',
		js: '',
	};

	state: MonacoEditorState = {
		html: this.props.html || '',
		css: this.props.css || '',
		js: this.props.js || '',
		htmlMarkers: [],
		cssMarkers: [],
		jsMarkers: [],
	};

	handlers = {
		onChangeHTML: debounce((value: string) => {
			this.setState({ html: value }, () => this.props.onChangeHTML?.(value));
		}, 500),
		onChangeCSS: debounce((value: string) => {
			this.setState({ css: value }, () => this.props.onChangeCSS?.(value));
		}, 500),
		onChangeJS: debounce((value: string) => {
			this.setState({ js: value }, () => this.props.onChangeJS?.(value));
		}, 500),
		getAnnotations: () => {
			const { htmlMarkers, cssMarkers, jsMarkers } = this.state;
			return { htmlAnnotations: htmlMarkers, cssAnnotations: cssMarkers, jsAnnotations: jsMarkers };
		},
		getCodes: () => {
			const { html, css, js } = this.state;
			return { html, css, js };
		},
	};

	componentWillUnmount() {
		this.handlers.onChangeHTML.cancel();
		this.handlers.onChangeCSS.cancel();
		this.handlers.onChangeJS.cancel();
	}

	render() {
		const { isHTML, isCSS, isJS, isPreview } = this.props;
		const { html, css, js } = this.state;

		return (
			<Row>
				{isHTML ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="HTML" colon={false}>
							<MonacoCodeEditor
								language="html"
								width="100%"
								height="200px"
								defaultValue={html}
								value={html}
								onChange={this.handlers.onChangeHTML}
								onValidate={htmlMarkers => this.setState({ htmlMarkers })}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isCSS ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="CSS" colon={false}>
							<MonacoCodeEditor
								language="css"
								width="100%"
								height="200px"
								defaultValue={css}
								value={css}
								onChange={this.handlers.onChangeCSS}
								onValidate={cssMarkers => this.setState({ cssMarkers })}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isJS ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="JS" colon={false}>
							<MonacoCodeEditor
								language="javascript"
								width="100%"
								height="200px"
								defaultValue={js}
								value={js}
								onChange={this.handlers.onChangeJS}
								onValidate={jsMarkers => this.setState({ jsMarkers })}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isPreview ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="Preview" colon={false}>
							<MonacoPreview html={html} css={css} js={js} />
						</Form.Item>
					</Col>
				) : null}
			</Row>
		);
	}
}

export default MonacoEditor;
