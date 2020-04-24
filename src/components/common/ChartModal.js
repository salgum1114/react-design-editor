import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'antd';
import ReactAce from 'react-ace';
import i18n from 'i18next';

import Icon from '../icon/Icon';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

class CodeModal extends Component {
	static propTypes = {
		value: PropTypes.any,
		onChange: PropTypes.func,
		form: PropTypes.any,
	};

	state = {
		chartOption: this.props.value,
		visible: false,
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			chartOption: nextProps.value,
		});
	}

	handlers = {
		onOk: () => {
			const { onChange } = this.props;
			const { tempChartOption } = this.state;
			onChange(tempChartOption);
			this.setState({
				visible: false,
				chartOption: tempChartOption,
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
		const { form } = this.props;
		const { getFieldDecorator } = form;
		const { visible, chartOption, tempChartOption } = this.state;
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
					{getFieldDecorator('chartOption', {
						initialValue: chartOption,
					})(<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{chartOption}</pre>)}
				</Form.Item>
				<Modal onCancel={onCancel} onOk={onOk} visible={visible} style={{ minWidth: 800 }}>
					<Form.Item label={codeLabel} colon={false}>
						<ReactAce
							ref={c => {
								this.jsRef = c;
							}}
							mode="javascript"
							theme="github"
							width="100%"
							height="600px"
							defaultValue={chartOption}
							value={tempChartOption}
							editorProps={{
								$blockScrolling: true,
							}}
							onChange={text => {
								this.setState({ tempChartOption: text });
							}}
						/>
					</Form.Item>
				</Modal>
			</React.Fragment>
		);
	}
}

export default CodeModal;
