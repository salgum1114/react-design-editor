import React, { Component } from 'react';
import i18n from 'i18next';
import PropTypes from 'prop-types';
import { List, Divider, Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import ReactJson from 'react-json-view';

import { FlexBox } from '../flex';
import CommonButton from '../common/CommonButton';
import InputJson from '../common/InputJson';
import WorkflowSiderContainer from './WorkflowSiderContainer';

const initSelectedVar = {
	type: 'text',
	key: null,
	value: null,
};

class WorkflowGlobalParameters extends Component {
	static propTypes = {
		workflow: PropTypes.object,
		form: PropTypes.object,
		onChange: PropTypes.func,
	};

	state = {
		types: ['text', 'number', 'boolean', 'json'],
		vars: this.props.workflow.vars || {},
		selectedVar: initSelectedVar,
		visible: false,
		isEdit: false,
		errors: null,
	};

	getComponentByType = (type) => {
		switch (type) {
			case 'text':
				return <Input />;
			case 'number':
				return <InputNumber />;
			case 'boolean':
				return <Switch />;
			case 'json':
				return <InputJson onValidate={this.handlers.onValidate} />;
			default:
				return <Input />;
		}
	};

	getType = (variable) => {
		if (typeof variable.value === 'number') {
			return 'number';
		} else if (typeof variable.value === 'boolean') {
			return 'boolean';
		} else {
			if (variable.value.startsWith('{') && variable.value.endsWith('}')) {
				return 'json';
			} else {
				return 'text';
			}
		}
	};

	handlers = {
		onModalVisible: (visible) => {
			if (visible) {
				this.setState(
					{
						visible,
					},
					() => {
						this.props.form.resetFields();
					},
				);
				return;
			}
			this.setState(
				{
					visible,
					selectedVar: initSelectedVar,
				},
				() => {
					this.props.form.resetFields();
				},
			);
		},
		onAdd: () => {
			this.setState(
				{
					isEdit: false,
					selectedVar: initSelectedVar,
				},
				() => {
					this.handlers.onModalVisible(true);
				},
			);
		},
		onClear: () => {
			this.props.onChange(null, { workflow: { vars: {} } }, null);
			this.setState({
				vars: {},
				selectedVar: initSelectedVar,
			});
		},
		onDelete: (key) => {
			delete this.state.vars[key];
			this.props.onChange(null, { workflow: { vars: this.state.vars } }, null);
			this.setState({
				vars: this.state.vars,
			});
		},
		onEdit: (variable) => {
			variable.type = this.getType(variable);
			this.setState(
				{
					isEdit: true,
					selectedVar: variable,
				},
				() => {
					this.handlers.onModalVisible(true);
				},
			);
		},
		onOk: () => {
			this.props.form.validateFields((err, values) => {
				if (err) {
					return;
				}
				if (this.state.isEdit) {
					delete this.state.vars[this.state.selectedVar.key];
				}
				const vars = Object.assign({}, this.state.vars, { [values.key]: values.value });
				this.setState(
					{
						vars,
					},
					() => {
						this.props.onChange(null, { workflow: { vars } }, null);
						this.handlers.onModalVisible(false);
					},
				);
			});
		},
		onCancel: () => {
			this.handlers.onModalVisible(false);
		},
		onChange: (value) => {
			let newValue = null;
			if (value === 'number') {
				newValue = 0;
			} else if (value === 'boolean') {
				newValue = false;
			}
			const selectedVar = Object.assign({}, this.state.selectedVar, {
				type: value,
				value: newValue,
			});
			this.setState({
				selectedVar,
			});
		},
		onValidate: (errors) => {
			this.setState({
				errors,
			});
		},
		keyValidator: (rule, value, callback) => {
			if (!this.state.isEdit) {
				if (this.state.vars[value]) {
					callback(i18n.t('common.enter-exist', { arg: value }));
					return false;
				}
			}
			callback();
			return true;
		},
		valueValidator: (rule, value, callback) => {
			if (this.state.errors) {
				callback(this.state.errors);
				return false;
			}
			callback();
			return true;
		},
	};

	render() {
		const { form } = this.props;
		const { vars, selectedVar, visible, isEdit, types } = this.state;
		const dataSource = Object.keys(vars).reduce((prev, key) => {
			prev.push({ key, value: vars[key] });
			return prev;
		}, []);
		const rules = [{ required: true, message: i18n.t('common.enter-property') }];
		if (selectedVar.type === 'json') {
			rules.push({
				required: true,
				validator: this.handlers.valueValidator,
			});
		}
		return (
			<WorkflowSiderContainer title={i18n.t('workflow.variables')} icon="globe">
				<FlexBox justifyContent="flex-end">
					<CommonButton className="rde-action-btn" shape="circle" icon="plus" onClick={this.handlers.onAdd} />
					<CommonButton
						className="rde-action-btn"
						type="danger"
						shape="circle"
						icon="times"
						onClick={this.handlers.onClear}
					/>
				</FlexBox>
				<Divider style={{ margin: '12px 0' }} />
				<List
					dataSource={dataSource}
					renderItem={(variable) => {
						const actions = [
							<CommonButton
								className="rde-action-btn"
								shape="circle"
								icon="edit"
								onClick={() => this.handlers.onEdit(variable)}
							/>,
							<CommonButton
								className="rde-action-btn"
								shape="circle"
								icon="trash"
								onClick={() => this.handlers.onDelete(variable.key)}
							/>,
						];
						const description =
							this.getType(variable) === 'json' ? (
								<ReactJson
									src={JSON.parse(variable.value)}
									name={false}
									enableClipboard={false}
									displayDataTypes={false}
									groupArraysAfterLength={10}
									collapseStringsAfterLength={100}
								/>
							) : (
								<pre>{variable.value.toString()}</pre>
							);
						return (
							<List.Item actions={actions}>
								<List.Item.Meta title={variable.key} description={description} />
							</List.Item>
						);
					}}
				/>
				<Modal
					title={isEdit ? i18n.t('workflow.variables-modify') : i18n.t('workflow.variables-add')}
					onOk={this.handlers.onOk}
					onCancel={this.handlers.onCancel}
					visible={visible}
				>
					<Form.Item label={i18n.t('common.key')} colon={false}>
						{form.getFieldDecorator('key', {
							initialValue: selectedVar.key,
							rules: [
								{ required: true, message: i18n.t('common.enter-property') },
								{ required: true, validator: this.handlers.keyValidator },
							],
						})(<Input />)}
					</Form.Item>
					<Form.Item label={i18n.t('common.type')} colon={false}>
						<Select
							defaultValue={selectedVar.type}
							value={selectedVar.type}
							onChange={this.handlers.onChange}
							style={{ width: '100%' }}
						>
							{types.map((type) => (
								<Select.Option key={type} value={type}>
									{type}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label={i18n.t('common.value')} colon={false}>
						{form.getFieldDecorator('value', {
							initialValue: selectedVar.value,
							rules,
							valuePropName: selectedVar.type === 'boolean' ? 'checked' : 'value',
						})(this.getComponentByType(selectedVar.type))}
					</Form.Item>
				</Modal>
			</WorkflowSiderContainer>
		);
	}
}

export default Form.create()(WorkflowGlobalParameters);
