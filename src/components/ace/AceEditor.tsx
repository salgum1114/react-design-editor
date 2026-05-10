import { Col, Form, Row } from 'antd';
import { debounce } from 'lodash-es';
import React from 'react';
import AceCodeEditor from './AceCodeEditor';

import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

import AcePreview from './AcePreview';

const defaultStyle = {
	padding: 12,
};

interface AceEditorProps {
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

interface AceEditorState {
	html: string;
	css: string;
	js: string;
	htmlAnnotations: any[];
	cssAnnotations: any[];
	jsAnnotations: any[];
}

class AceEditor extends React.Component<AceEditorProps, AceEditorState> {
	private htmlRef: any;
	private cssRef: any;
	private jsRef: any;

	static defaultProps: Required<
		Pick<AceEditorProps, 'isHTML' | 'isCSS' | 'isJS' | 'isPreview' | 'html' | 'css' | 'js'>
	> = {
		isHTML: true,
		isCSS: true,
		isJS: true,
		isPreview: true,
		html: '',
		css: '',
		js: '',
	};

	state: AceEditorState = {
		html: this.props.html || '',
		css: this.props.css || '',
		js: this.props.js || '',
		htmlAnnotations: [],
		cssAnnotations: [],
		jsAnnotations: [],
	};

	handlers = {
		onChangeHTML: debounce((value: string) => {
			this.setState(
				{
					html: value,
					htmlAnnotations: this.htmlRef?.editor.getSession().getAnnotations() || [],
				},
				() => {
					this.props.onChangeHTML?.(value);
				},
			);
		}, 500),
		onChangeCSS: debounce((value: string) => {
			this.setState(
				{
					css: value,
					cssAnnotations: this.cssRef?.editor.getSession().getAnnotations() || [],
				},
				() => {
					this.props.onChangeCSS?.(value);
				},
			);
		}, 500),
		onChangeJS: debounce((value: string) => {
			this.setState(
				{
					js: value,
					jsAnnotations: this.jsRef?.editor.getSession().getAnnotations() || [],
				},
				() => {
					this.props.onChangeJS?.(value);
				},
			);
		}, 500),
		onValidateHTML: (annotations: any[]) => {
			let index = annotations.length;
			const originalLength = annotations.length;
			while (index--) {
				if (/doctype first\. Expected/.test(annotations[index].text)) {
					annotations.splice(index, 1);
				} else if (/Unexpected End of file\. Expected/.test(annotations[index].text)) {
					annotations.splice(index, 1);
				}
			}
			if (originalLength > annotations.length) {
				this.htmlRef?.editor.getSession().setAnnotations(annotations);
			}
		},
		getAnnotations: () => {
			const { htmlAnnotations, cssAnnotations, jsAnnotations } = this.state;
			return { htmlAnnotations, cssAnnotations, jsAnnotations };
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
							<AceCodeEditor
								ref={ref => {
									this.htmlRef = ref;
								}}
								mode="html"
								theme="github"
								width="100%"
								height="200px"
								defaultValue={html}
								value={html}
								editorProps={{
									$blockScrolling: true,
								}}
								onChange={this.handlers.onChangeHTML}
								onValidate={this.handlers.onValidateHTML}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isCSS ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="CSS" colon={false}>
							<AceCodeEditor
								ref={ref => {
									this.cssRef = ref;
								}}
								mode="css"
								theme="github"
								width="100%"
								height="200px"
								defaultValue={css}
								value={css}
								editorProps={{
									$blockScrolling: true,
								}}
								onChange={this.handlers.onChangeCSS}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isJS ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="JS" colon={false}>
							<AceCodeEditor
								ref={ref => {
									this.jsRef = ref;
								}}
								mode="javascript"
								theme="github"
								width="100%"
								height="200px"
								defaultValue={js}
								value={js}
								editorProps={{
									$blockScrolling: true,
								}}
								onChange={this.handlers.onChangeJS}
							/>
						</Form.Item>
					</Col>
				) : null}
				{isPreview ? (
					<Col span={12} style={defaultStyle}>
						<Form.Item label="Preview" colon={false}>
							<AcePreview html={html} css={css} js={js} />
						</Form.Item>
					</Col>
				) : null}
			</Row>
		);
	}
}

export default AceEditor;
