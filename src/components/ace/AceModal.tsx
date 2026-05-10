import { Button, Form, Modal, notification } from 'antd';
import React from 'react';

import Icon from '../icon/Icon';
import AceEditor from './AceEditor';

notification.config({
	top: 80,
	duration: 1,
});

interface AceCodeValue {
	html?: string;
	css?: string;
	js?: string;
}

interface AceModalProps {
	value?: AceCodeValue;
	onChange?: (value: AceCodeValue) => void;
	form?: any;
}

interface AceModalState {
	code: Required<AceCodeValue>;
	visible: boolean;
}

class AceModal extends React.Component<AceModalProps, AceModalState> {
	private aceRef: any;

	state: AceModalState = {
		code: {
			html: this.props.value?.html || '',
			css: this.props.value?.css || '',
			js: this.props.value?.js || '',
		},
		visible: false,
	};

	componentDidUpdate(prevProps: AceModalProps) {
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
			const { onChange } = this.props;
			const code = this.aceRef.handlers.getCodes();
			onChange?.(code);
			this.setState({
				visible: false,
				code,
			});
		},
		onCancel: () => {
			this.modalHandlers.onHide();
		},
		onClick: () => {
			this.modalHandlers.onShow();
		},
	};

	modalHandlers = {
		onShow: () => {
			this.setState({
				visible: true,
			});
		},
		onHide: () => {
			this.setState({
				visible: false,
			});
		},
	};

	render() {
		const { onOk, onCancel, onClick } = this.handlers;
		const {
			code: { html, css, js },
			visible,
		} = this.state;
		const label = (
			<React.Fragment>
				<span style={{ marginRight: 8 }}>Code Editor</span>
				<Button onClick={onClick} shape="circle">
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
				<Modal onCancel={onCancel} onOk={onOk} open={visible} width="80%">
					<AceEditor
						ref={instance => {
							this.aceRef = instance;
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

export default AceModal;
