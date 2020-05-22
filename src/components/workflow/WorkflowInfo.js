import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Divider, Form, Input, Switch } from 'antd';
import i18n from 'i18next';

import CommonButton from '../common/CommonButton';
import WorkflowSiderContainer from './WorkflowSiderContainer';

class WorkflowInfo extends Component {
	static propTypes = {
		workflow: PropTypes.object,
		form: PropTypes.object,
		onChange: PropTypes.func,
	};

	state = {
		isEdit: false,
	};

	handlers = {
		onClick: () => {
			if (this.state.isEdit) {
				this.props.form.validateFields((err, values) => {
					if (err) {
						return;
					}
					this.props.onChange(null, { workflow: values }, null);
					this.setState({
						isEdit: !this.state.isEdit,
					});
				});
			} else {
				this.setState({
					isEdit: !this.state.isEdit,
				});
			}
		},
	};

	render() {
		const { workflow, form } = this.props;
		const { isEdit } = this.state;
		const component = isEdit ? (
			<React.Fragment>
				<Form.Item label={i18n.t('common.name')} colon={false}>
					{form.getFieldDecorator('name', {
						initialValue: workflow.name,
						rules: [
							{
								required: true,
								message: i18n.t('validation.enter-property', { arg: i18n.t('common.name') }),
							},
						],
					})(<Input />)}
				</Form.Item>
				<Form.Item label={i18n.t('common.description')} colon={false}>
					{form.getFieldDecorator('description', {
						initialValue: workflow.description,
					})(<Input.TextArea />)}
				</Form.Item>
				<Form.Item label={i18n.t('common.enabled')} colon={false}>
					{form.getFieldDecorator('enabled', {
						initialValue: workflow.enabled,
						valuePropName: 'checked',
					})(<Switch />)}
				</Form.Item>
			</React.Fragment>
		) : (
			<React.Fragment>
				<h2 style={{ color: workflow.enabled ? '#49a9ee' : 'rgba(0, 0, 0, 0.65)' }}>{workflow.name}</h2>
				<Divider style={{ margin: '12px 0' }} />
				<div>{workflow.description}</div>
			</React.Fragment>
		);
		const extra = (
			<CommonButton
				className="rde-action-btn"
				shape="circle"
				icon={isEdit ? 'save' : 'edit'}
				onClick={this.handlers.onClick}
				tooltipTitle={isEdit ? i18n.t('action.save') : i18n.t('action.modify')}
			/>
		);
		return (
			<WorkflowSiderContainer title={i18n.t('workflow.workflow-info')} icon="cog" extra={extra}>
				{component}
			</WorkflowSiderContainer>
		);
	}
}

export default Form.create()(WorkflowInfo);
