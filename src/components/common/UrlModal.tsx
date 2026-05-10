import { Button, Form, Input, Modal } from 'antd';
import React from 'react';
import i18n from 'i18next';

import Icon from '../icon/Icon';

interface UrlModalProps {
	value?: string;
	onChange?: (value: string) => void;
	form?: any;
}

interface UrlModalState {
	url: string;
	tempUrl: string;
	visible: boolean;
}

class UrlModal extends React.Component<UrlModalProps, UrlModalState> {
	state: UrlModalState = {
		url: this.props.value || '',
		tempUrl: this.props.value || '',
		visible: false,
	};

	componentDidUpdate(prevProps: UrlModalProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				url: this.props.value || '',
				tempUrl: this.props.value || '',
			});
		}
	}

	handlers = {
		onOk: () => {
			const { onChange } = this.props;
			const { tempUrl } = this.state;
			onChange?.(tempUrl);
			this.setState({
				visible: false,
				url: tempUrl,
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
				tempUrl: prevState.url,
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
		const { url, visible, tempUrl } = this.state;
		const label = (
			<React.Fragment>
				<span style={{ marginRight: 8 }}>{i18n.t('common.url')}</span>
				<Button onClick={onClick} shape="circle" className="rde-action-btn">
					<Icon name="edit" />
				</Button>
			</React.Fragment>
		);

		return (
			<React.Fragment>
				<Form.Item label={label} colon={false}>
					<span style={{ wordBreak: 'break-all' }}>{url}</span>
				</Form.Item>
				<Modal onCancel={onCancel} onOk={onOk} open={visible}>
					<Form.Item label={i18n.t('common.url')} colon={false}>
						<Input
							value={tempUrl}
							onChange={event => {
								this.setState({ tempUrl: event.target.value });
							}}
						/>
					</Form.Item>
				</Modal>
			</React.Fragment>
		);
	}
}

export default UrlModal;
