import React from 'react';
import { Divider, Form, Input, Switch } from 'antd';
import i18n from 'i18next';
import { CommonButton } from '../../components/common';
import WorkflowSiderContainer from './WorkflowSiderContainer';

interface IProps {
	workflow?: any;
	onChange?: any;
}

const WorkflowInfo = ({ workflow, onChange }: IProps) => {
	const [form] = Form.useForm();
	const [isEdit, setIsEdit] = React.useState(false);

	React.useEffect(() => {
		if (!workflow) {
			return;
		}
		form.setFieldsValue({
			name: workflow.name,
			description: workflow.description,
			enabled: workflow.enabled,
		});
	}, [form, workflow]);

	const handleClick = async () => {
		if (!isEdit) {
			setIsEdit(true);
			return;
		}

		const values = await form.validateFields();
		onChange?.(null, { workflow: values }, null);
		setIsEdit(false);
	};

	const component = isEdit ? (
		<Form form={form} layout="horizontal">
			<Form.Item
				label={i18n.t('common.name')}
				colon={false}
				name="name"
				rules={[
					{
						required: true,
						message: i18n.t('validation.enter-property', { arg: i18n.t('common.name') }),
					},
				]}
			>
				<Input />
			</Form.Item>
			<Form.Item label={i18n.t('common.description')} colon={false} name="description">
				<Input.TextArea />
			</Form.Item>
			<Form.Item label={i18n.t('common.enabled')} colon={false} name="enabled" valuePropName="checked">
				<Switch />
			</Form.Item>
		</Form>
	) : (
		<React.Fragment>
			<h2 style={{ color: workflow?.enabled ? '#49a9ee' : 'rgba(0, 0, 0, 0.65)' }}>{workflow?.name}</h2>
			<Divider style={{ margin: '12px 0' }} />
			<div>{workflow?.description}</div>
		</React.Fragment>
	);

	return (
		<WorkflowSiderContainer
			title={i18n.t('workflow.workflow-info')}
			icon="cog"
			extra={
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon={isEdit ? 'save' : 'edit'}
					onClick={handleClick}
					tooltipTitle={isEdit ? i18n.t('action.save') : i18n.t('action.modify')}
				/>
			}
		>
			{component}
		</WorkflowSiderContainer>
	);
};

export default WorkflowInfo;
