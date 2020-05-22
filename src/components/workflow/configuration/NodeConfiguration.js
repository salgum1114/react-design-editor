import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import i18n from 'i18next';
import { Form, Input, Select, InputNumber, Switch, Col, Tooltip } from 'antd';

import Icon from '../../icon/Icon';
import InputScript from '../../common/InputScript';
import InputTemplate from '../../common/InputTemplate';
import InputJson from '../../common/InputJson';
import Configuration from './index';

export const getNode = nodeClazz => {
	const classPath = nodeClazz.split('.');
	return classPath[classPath.length - 1];
};

export const getConfiguration = clazz => Configuration[clazz] || null;

export const getEllipsis = (text, length) => {
	if (!length) {
		return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
			? text.length > 8
				? text.substring(0, 8).concat('...')
				: text
			: text.length > 15
			? text.substring(0, 15).concat('...')
			: text;
	}
	return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
		? text.length > length / 2
			? text.substring(0, length / 2).concat('...')
			: text
		: text.length > length
		? text.substring(0, length).concat('...')
		: text;
};

export default class NodeConfiguration extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		selectedItem: PropTypes.object,
		form: PropTypes.object,
		workflow: PropTypes.object,
	};

	state = {
		errors: null,
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.selectedItem && nextProps.selectedItem) {
			if (this.props.selectedItem.id !== nextProps.selectedItem.id) {
				this.setState({
					errors: null,
				});
			}
		}
	}

	getForm(form, configuration, key, formConfig) {
		let component = null;
		const {
			disabled,
			icon,
			extra,
			help,
			description,
			span,
			max,
			min,
			placeholder,
			valuePropName,
			required,
		} = formConfig;
		let initialValue = configuration[key] || formConfig.default;
		let rules = required
			? [{ required: true, message: i18n.t('validation.enter-property', { arg: formConfig.label }) }]
			: [];
		if (formConfig.rules) {
			rules = rules.concat(formConfig.rules);
		}
		let selectFormItems = null;
		switch (formConfig.type) {
			case 'text':
				component = <Input disabled={disabled} minLength={min} maxLength={max} placeholder={placeholder} />;
				break;
			case 'textarea':
				component = <Input.TextArea disabled={disabled} placeholder={placeholder} />;
				break;
			case 'number':
				component = <InputNumber style={{ width: '100%' }} disabled={disabled} min={min} max={max} />;
				initialValue = configuration[key];
				break;
			case 'boolean':
				component = <Switch disabled={disabled} />;
				break;
			case 'select':
				component = (
					<Select placeholder={placeholder} disabled={disabled}>
						{formConfig.items.map(item => {
							if (item.forms && item.value === initialValue) {
								selectFormItems = Object.keys(item.forms).map(formKey => {
									return this.getForm(form, configuration, formKey, item.forms[formKey]);
								});
							}
							return (
								<Select.Option key={item.value} value={item.value}>
									{item.label}
								</Select.Option>
							);
						})}
					</Select>
				);
				break;
			case 'script':
				component = <InputScript onValidate={this.handlers.onValidate} disabled={disabled} />;
				rules.push({ required: true, validator: this.handlers.aceEditorValidator });
				break;
			case 'template':
				component = <InputTemplate showLineNumbers={false} newLineMode={false} disabled={disabled} />;
				break;
			case 'templatearea':
				component = <InputTemplate height="120px" disabled={disabled} />;
				break;
			case 'json':
				component = <InputJson onValidate={this.handlers.onValidate} disabled={disabled} />;
				rules.push({ required: true, validator: this.handlers.aceEditorValidator });
				break;
			case 'tags':
				component = (
					<Select
						mode="tags"
						dropdownStyle={{ display: 'none' }}
						placeholder={placeholder}
						disabled={disabled}
					>
						{initialValue.map(item => (
							<Select.Option key={item} value={item}>
								{item}
							</Select.Option>
						))}
					</Select>
				);
				break;
			case 'custom':
				component = (
					<formConfig.component
						onValidate={this.handlers.onValidate}
						form={form}
						configuration={configuration}
						selectedItem={this.props.selectedItem}
						workflow={this.props.workflow}
						disabled={disabled}
					/>
				);
				break;
			default:
				component = <Input minLength={min} maxLength={max} placeholder={placeholder} disabled={disabled} />;
		}
		const label =
			description && description.length ? (
				<React.Fragment>
					{icon ? <Icon name={icon} /> : null}
					<span>{formConfig.label}</span>
					<Tooltip title={description} placement="topRight">
						<span style={{ float: 'right', marginLeft: 280 }}>
							<Icon name="question-circle" />
						</span>
					</Tooltip>
				</React.Fragment>
			) : (
				<React.Fragment>
					{icon ? <Icon name={icon} /> : null}
					<span>{formConfig.label}</span>
				</React.Fragment>
			);
		return (
			<React.Fragment key={key}>
				<Col key={key} span={span || 24}>
					<Form.Item label={label} help={help} extra={extra} colon={false}>
						{form.getFieldDecorator(`configuration.${key}`, {
							initialValue,
							rules,
							valuePropName: typeof initialValue === 'boolean' ? 'checked' : valuePropName || 'value',
						})(component)}
					</Form.Item>
				</Col>
				{selectFormItems}
			</React.Fragment>
		);
	}

	createForm(canvasRef, form, selectedItem) {
		const { configuration, nodeClazz } = selectedItem;
		if (!nodeClazz) {
			return null;
		}
		const clazz = getNode(nodeClazz);
		const formConfig = getConfiguration(clazz);
		if (isEmpty(formConfig)) {
			return null;
		}
		if (isEmpty(configuration)) {
			return null;
		}
		const components = Object.keys(formConfig).map(key => {
			return this.getForm(form, configuration, key, formConfig[key]);
		});
		return components;
	}

	handlers = {
		onValidate: errors => {
			this.setState({
				errors,
			});
			this.props.selectedItem.set({
				errors,
			});
		},
		aceEditorValidator: (rule, value, callback) => {
			const { errors } = this.state;
			if (errors && errors.length) {
				callback(errors);
				return;
			}
			callback();
		},
	};

	render() {
		const { selectedItem, form, canvasRef } = this.props;
		if (!selectedItem || isEmpty(selectedItem)) {
			return null;
		}
		return this.createForm(canvasRef, form, selectedItem);
	}
}
