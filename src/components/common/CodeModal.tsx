import { Button, Form, Modal } from 'antd';
import i18n from 'i18next';
import React from 'react';
import AceCodeEditor from '../ace/AceCodeEditor';

import Icon from '../icon/Icon';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

interface CodeModalProps {
	value?: string;
	onChange?: (value: string) => void;
	form?: any;
}

interface CodeModalState {
	code?: string;
	tempCode?: string;
	visible: boolean;
}

class CodeModal extends React.Component<CodeModalProps, CodeModalState> {
	state: CodeModalState = {
		code: this.props.value,
		tempCode: this.props.value,
		visible: false,
	};

	componentDidUpdate(prevProps: CodeModalProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				code: this.props.value,
				tempCode: this.props.value,
			});
		}
	}

	handlers = {
		onOk: () => {
			const { onChange } = this.props;
			const { tempCode } = this.state;
			onChange?.(tempCode || '');
			this.setState({
				visible: false,
				code: tempCode,
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
			this.setState(prevState => ({
				visible: true,
				tempCode: prevState.code,
			}));
		},
		onHide: () => {
			this.setState({
				visible: false,
			});
		},
	};

	render() {
		const { onOk, onCancel, onClick } = this.handlers;
		const { value } = this.props;
		const { code, visible, tempCode } = this.state;
		const label = (
			<React.Fragment>
				<span style={{ marginRight: 8 }}>{i18n.t('common.code')}</span>
				<Button onClick={onClick} shape="circle" className="rde-action-btn">
					<Icon name="edit" />
				</Button>
			</React.Fragment>
		);
		const codeLabel = <span>Code (value, styles, animations, userProperty)</span>;

		return (
			<React.Fragment>
				<Form.Item label={label} colon={false}>
					<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{code || value}</pre>
				</Form.Item>
				<Modal onCancel={onCancel} onOk={onOk} open={visible}>
					<Form.Item label={codeLabel} colon={false}>
						<AceCodeEditor
							mode="javascript"
							theme="github"
							width="100%"
							height="200px"
							defaultValue={code}
							value={tempCode}
							editorProps={{
								$blockScrolling: true,
							}}
							onChange={nextValue => {
								this.setState({ tempCode: nextValue });
							}}
						/>
					</Form.Item>
				</Modal>
			</React.Fragment>
		);
	}
}

export default CodeModal;
