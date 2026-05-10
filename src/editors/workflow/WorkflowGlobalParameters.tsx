import { Divider, Form, Input, InputNumber, List, Modal, Select, Switch } from 'antd';
import i18n from 'i18next';
import React from 'react';
import { CommonButton, InputJson } from '../../components/common';
import { Flex } from '../../components/flex';
import WorkflowSiderContainer from './WorkflowSiderContainer';

interface IProps {
	workflow?: any;
	onChange?: any;
}

type VariableType = 'text' | 'number' | 'boolean' | 'json';

interface SelectedVar {
	type: VariableType;
	key: string;
	value: any;
}

const initSelectedVar: SelectedVar = {
	type: 'text',
	key: '',
	value: '',
};

const WorkflowGlobalParameters = ({ workflow, onChange }: IProps) => {
	const [form] = Form.useForm();
	const [types] = React.useState<VariableType[]>(['text', 'number', 'boolean', 'json']);
	const [vars, setVars] = React.useState<Record<string, any>>(workflow?.vars || {});
	const [selectedVar, setSelectedVar] = React.useState<SelectedVar>(initSelectedVar);
	const [visible, setVisible] = React.useState(false);
	const [isEdit, setIsEdit] = React.useState(false);
	const [errors, setErrors] = React.useState<any>(null);

	React.useEffect(() => {
		setVars(workflow?.vars || {});
	}, [workflow?.vars]);

	const handleValidate = (nextErrors: any) => {
		setErrors(nextErrors);
	};

	const getComponentByType = (type: VariableType): React.ReactElement<any> => {
		switch (type) {
			case 'text':
				return <Input />;
			case 'number':
				return <InputNumber />;
			case 'boolean':
				return <Switch />;
			case 'json':
				return <InputJson onValidate={handleValidate} />;
			default:
				return <Input />;
		}
	};

	const getType = (variable: { value: any }): VariableType => {
		if (typeof variable.value === 'number') {
			return 'number';
		}
		if (typeof variable.value === 'boolean') {
			return 'boolean';
		}
		if (typeof variable.value === 'string' && variable.value.startsWith('{') && variable.value.endsWith('}')) {
			return 'json';
		}
		return 'text';
	};

	const handleModalVisible = (nextVisible: boolean) => {
		setVisible(nextVisible);
		setErrors(null);
		if (!nextVisible) {
			setSelectedVar(initSelectedVar);
			form.resetFields();
			return;
		}
		form.setFieldsValue(selectedVar);
	};

	const handleAdd = () => {
		setIsEdit(false);
		setSelectedVar(initSelectedVar);
		setVisible(true);
		form.setFieldsValue(initSelectedVar);
	};

	const handleClear = () => {
		onChange?.(null, { workflow: { vars: {} } }, null);
		setVars({});
		setSelectedVar(initSelectedVar);
	};

	const handleDelete = (key: string) => {
		const nextVars = { ...vars };
		delete nextVars[key];
		onChange?.(null, { workflow: { vars: nextVars } }, null);
		setVars(nextVars);
	};

	const handleEdit = (variable: { key: string; value: any }) => {
		const nextSelectedVar: SelectedVar = {
			...variable,
			type: getType(variable),
		};
		setIsEdit(true);
		setSelectedVar(nextSelectedVar);
		setVisible(true);
		form.setFieldsValue(nextSelectedVar);
	};

	const handleOk = async () => {
		const values = await form.validateFields();
		const nextVars = { ...vars };
		if (isEdit) {
			delete nextVars[selectedVar.key];
		}
		nextVars[values.key] = values.value;
		setVars(nextVars);
		onChange?.(null, { workflow: { vars: nextVars } }, null);
		handleModalVisible(false);
	};

	const handleTypeChange = (value: VariableType) => {
		let newValue: any = '';
		if (value === 'number') {
			newValue = 0;
		} else if (value === 'boolean') {
			newValue = false;
		} else if (value === 'json') {
			newValue = '{}';
		}
		const nextSelectedVar: SelectedVar = {
			...selectedVar,
			type: value,
			value: newValue,
		};
		setSelectedVar(nextSelectedVar);
		form.setFieldsValue({ type: value, value: newValue });
	};

	const keyValidator = async (_rule: unknown, value: string) => {
		if (!isEdit && vars[value]) {
			throw new Error(i18n.t('common.enter-exist', { arg: value }));
		}
	};

	const valueValidator = async () => {
		if (errors) {
			throw new Error(errors);
		}
	};

	const dataSource = Object.keys(vars).map(key => ({ key, value: vars[key] }));
	const rules: Array<Record<string, any>> = [{ required: true, message: i18n.t('common.enter-property') }];
	if (selectedVar.type === 'json') {
		rules.push({ validator: valueValidator });
	}

	return (
		<WorkflowSiderContainer title={i18n.t('workflow.variables')} icon="globe">
			<Flex justifyContent="flex-end">
				<CommonButton className="rde-action-btn" shape="circle" icon="plus" onClick={handleAdd} />
				<CommonButton className="rde-action-btn" danger shape="circle" icon="times" onClick={handleClear} />
			</Flex>
			<Divider style={{ margin: '12px 0' }} />
			<List
				dataSource={dataSource}
				renderItem={variable => {
					const description =
						getType(variable) === 'json' ? (
							<pre>
								{JSON.stringify(
									typeof variable.value === 'string' ? JSON.parse(variable.value) : variable.value,
									null,
									2,
								)}
							</pre>
						) : (
							<pre>{String(variable.value)}</pre>
						);

					return (
						<List.Item
							actions={[
								<CommonButton
									key="edit"
									className="rde-action-btn"
									shape="circle"
									icon="edit"
									onClick={() => handleEdit(variable)}
								/>,
								<CommonButton
									key="delete"
									className="rde-action-btn"
									shape="circle"
									icon="trash"
									onClick={() => handleDelete(variable.key)}
								/>,
							]}
						>
							<List.Item.Meta title={variable.key} description={description} />
						</List.Item>
					);
				}}
			/>
			<Modal
				title={isEdit ? i18n.t('workflow.variables-modify') : i18n.t('workflow.variables-add')}
				onOk={handleOk}
				onCancel={() => handleModalVisible(false)}
				open={visible}
			>
				<Form form={form} initialValues={selectedVar} layout="vertical">
					<Form.Item
						label={i18n.t('common.key')}
						colon={false}
						name="key"
						rules={[
							{ required: true, message: i18n.t('common.enter-property') },
							{ validator: keyValidator },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item label={i18n.t('common.type')} colon={false} name="type">
						<Select onChange={handleTypeChange} style={{ width: '100%' }}>
							{types.map(type => (
								<Select.Option key={type} value={type}>
									{type}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label={i18n.t('common.value')}
						colon={false}
						name="value"
						rules={rules}
						valuePropName={selectedVar.type === 'boolean' ? 'checked' : 'value'}
					>
						{getComponentByType(selectedVar.type)}
					</Form.Item>
				</Form>
			</Modal>
		</WorkflowSiderContainer>
	);
};

export default WorkflowGlobalParameters;
