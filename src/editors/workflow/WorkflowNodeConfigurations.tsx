import { Divider, Form, Input } from 'antd';
import i18n from 'i18next';
import React from 'react';
import type { CanvasInstance } from '../../canvas';
import { Scrollbar } from '../../components/common';
import { Flex } from '../../components/flex';
import NodeAction from './configuration/NodeAction';
import NodeConfiguration from './configuration/NodeConfiguration';
import NodeDescriptor from './configuration/NodeDescriptor';

interface IProps {
	canvasRef?: CanvasInstance;
	selectedItem?: any;
	workflow?: any;
	onChange?: any;
	descriptors?: any;
	wrappedComponentRef?: (instance: { props: { form: any } }) => void;
}

const WorkflowNodeConfigurations = ({ canvasRef, workflow, selectedItem, onChange, wrappedComponentRef }: IProps) => {
	const [form] = Form.useForm();

	React.useEffect(() => {
		wrappedComponentRef?.({ props: { form } });
	}, [form, wrappedComponentRef]);

	React.useEffect(() => {
		if (!selectedItem) {
			form.resetFields();
			return;
		}

		form.setFieldsValue({
			name: selectedItem.name,
			description: selectedItem.description,
			configuration: selectedItem.configuration,
		});
	}, [form, selectedItem]);

	return (
		<Scrollbar>
			<Form
				form={form}
				layout="horizontal"
				onValuesChange={(changedValues, allValues) => {
					onChange?.(selectedItem, changedValues, allValues);
				}}
			>
				{selectedItem ? (
					<React.Fragment>
						<NodeDescriptor workflow={workflow} selectedItem={selectedItem} />
						<Flex flexDirection="column" style={{ margin: '8px 16px' }}>
							<Form.Item
								label={i18n.t('common.name')}
								colon={false}
								name="name"
								rules={[
									{
										required: true,
										message: i18n.t('validation.enter-property', {
											arg: i18n.t('common.name'),
										}),
									},
								]}
							>
								<Input placeholder={i18n.t('workflow.node-name-required')} />
							</Form.Item>
							<Form.Item label={i18n.t('common.description')} colon={false} name="description">
								<Input.TextArea
									style={{ maxHeight: 200 }}
									placeholder={i18n.t('workflow.node-description-required')}
								/>
							</Form.Item>
						</Flex>
						<Divider>{i18n.t('workflow.node-configuration')}</Divider>
						<Flex
							flexDirection="column"
							style={{ height: '100%', overflowY: 'hidden', margin: '8px 16px' }}
						>
							<NodeConfiguration
								canvasRef={canvasRef}
								form={form}
								selectedItem={selectedItem}
								workflow={workflow}
							/>
						</Flex>
						<NodeAction workflow={workflow} selectedItem={selectedItem} canvasRef={canvasRef} />
					</React.Fragment>
				) : null}
			</Form>
		</Scrollbar>
	);
};

export default WorkflowNodeConfigurations;
