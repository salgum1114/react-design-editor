import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, Input } from 'antd';
import i18n from 'i18next';

import Icon from '../icon/Icon';
import { UrlModalLabel } from './UrlModalLabel';

class UrlModal extends Component {
	handlers = {
		onOk: () => {
			const { onChange } = this.props;
			const { tempUrl } = this.state;
			onChange(tempUrl);
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

	static propTypes = {
		value: PropTypes.any,
		onChange: PropTypes.func,
		form: PropTypes.any,
	};

	state = {
		url: this.props.value || '',
		tempUrl: '',
		visible: false,
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			url: nextProps.value || '',
		});
	}

	render() {
		const { form } = this.props;
		const { getFieldDecorator } = form;
		const { url, visible } = this.state;
		const label = (
			<UrlModalLabel onclick={this.handlers.onClick}/>
		);
		return (
			<React.Fragment>
				<Form.Item label={label} colon={false}>
					{getFieldDecorator('url', {
						rules: [
							{
								required: true,
								message: i18n.t('validation.enter-property', { arg: i18n.t('common.url') }),
							},
						],
						initialValue: url || '',
					})(<span style={{ wordBreak: 'break-all' }}>{url}</span>)}
				</Form.Item>
				<Modal onCancel={this.handlers.onCancel} onOk={this.handlers.onOk} visible={visible}>
					<Form.Item label={i18n.t('common.url')} colon={false}>
						<Input
							defaultValue={url}
							onChange={e => {
								this.setState({ tempUrl: e.target.value });
							}}
						/>
					</Form.Item>
				</Modal>
			</React.Fragment>
		);
	}
}

export default UrlModal;
