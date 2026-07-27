import { Button, Form, Modal } from 'antd';
import React from 'react';
import Icon from '../icon/Icon';
import MonacoEditor from './MonacoEditor';

interface MonacoCodeValue {
	html?: string;
	css?: string;
	js?: string;
}

interface MonacoModalProps {
	value?: MonacoCodeValue;
	onChange?: (value: MonacoCodeValue) => void;
	form?: any;
}

interface MonacoModalState {
	code: Required<MonacoCodeValue>;
	visible: boolean;
}

class MonacoModal extends React.Component<MonacoModalProps, MonacoModalState> {
	private monacoRef: MonacoEditor | null = null;

	state: MonacoModalState = {
		code: {
			html: this.props.value?.html || '',
			css: this.props.value?.css || '',
			js: this.props.value?.js || '',
		},
		visible: false,
	};

	componentDidUpdate(prevProps: MonacoModalProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				code: {
					html: this.props.value?.html || '',
					css: this.props.value?.css || '',
					js: this.props.value?.js || '',
				},
			});
		}
	}

	handlers = {
		onOk: () => {
			const code = this.monacoRef?.handlers.getCodes() || this.state.code;
			this.props.onChange?.(code);
			this.setState({ visible: false, code });
		},
		onCancel: () => {
			this.setState({ visible: false });
		},
		onClick: () => {
			this.setState({ visible: true });
		},
	};

	render() {
		const {
			code: { html, css, js },
			visible,
		} = this.state;
		const label = (
			<React.Fragment>
				<span style={{ marginRight: 8 }}>Code Editor</span>
				<Button onClick={this.handlers.onClick} shape="circle">
					<Icon name="code" />
				</Button>
			</React.Fragment>
		);

		return (
			<React.Fragment>
				<Form.Item label={label} colon={false}>
					<span />
				</Form.Item>
				<Form.Item label="HTML" colon={false}>
					<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{html}</pre>
				</Form.Item>
				<Form.Item label="CSS" colon={false}>
					<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{css}</pre>
				</Form.Item>
				<Form.Item label="JS" colon={false}>
					<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{js}</pre>
				</Form.Item>
				<Modal
					rootClassName="rde-editor-modal"
					onCancel={this.handlers.onCancel}
					onOk={this.handlers.onOk}
					open={visible}
					width="80%"
				>
					<MonacoEditor
						ref={instance => {
							this.monacoRef = instance;
						}}
						html={html}
						css={css}
						js={js}
					/>
				</Modal>
			</React.Fragment>
		);
	}
}

export default MonacoModal;
