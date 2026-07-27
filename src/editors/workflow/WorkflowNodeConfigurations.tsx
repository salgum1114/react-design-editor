import { Divider, Form, FormInstance, Input, Row } from 'antd';
import i18next from 'i18next';
import React from 'react';
import type { CanvasInstance } from '../../canvas';
import { Scrollbar } from '../../components/common';
import { INSPECTOR_FORM_PROPS } from '../../components/editor';
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
}

const WorkflowNodeConfigurations = React.forwardRef<FormInstance, IProps>((props, ref) => {
	const { canvasRef, workflow, selectedItem, onChange } = props;
	const [form] = Form.useForm();

	React.useEffect(() => {
		if (!selectedItem) {
			return;
		}

		form.setFieldsValue({
			name: selectedItem.name,
			description: selectedItem.description,
			configuration: selectedItem.configuration,
		});
	}, [form, selectedItem]);

	React.useImperativeHandle(ref, () => form);

	return (
		<div className="rde-workflow-node-configurations">
			<Scrollbar>
				<Form
					form={form}
					{...INSPECTOR_FORM_PROPS}
					onValuesChange={(changedValues, allValues) => {
						onChange?.(selectedItem, changedValues, allValues);
					}}
				>
					{selectedItem ? (
						<React.Fragment>
							<NodeDescriptor workflow={workflow} selectedItem={selectedItem} />
							<Flex className="rde-inspector-form-section" flexDirection="column">
							<Form.Item
								label={i18next.t('common.name')}
								colon={false}
								name="name"
								rules={[
									{
										required: true,
										message: i18next.t('validation.enter-property', {
											arg: i18next.t('common.name'),
										}),
									},
								]}
							>
								<Input placeholder={i18next.t('workflow.node-name-required')} />
							</Form.Item>
							<Form.Item label={i18next.t('common.description')} colon={false} name="description">
								<Input.TextArea
									style={{ maxHeight: 200 }}
									placeholder={i18next.t('workflow.node-description-required')}
								/>
							</Form.Item>
						</Flex>
						<Divider className="rde-inspector-divider">
							{i18next.t('workflow.node-configuration')}
						</Divider>
						<Row className="rde-inspector-form-section rde-inspector-field-grid" gutter={8}>
							<NodeConfiguration
								canvasRef={canvasRef}
								form={form}
								selectedItem={selectedItem}
								workflow={workflow}
							/>
						</Row>
						<NodeAction workflow={workflow} selectedItem={selectedItem} canvasRef={canvasRef} />
						</React.Fragment>
					) : null}
				</Form>
			</Scrollbar>
		</div>
	);
});

export default WorkflowNodeConfigurations;
