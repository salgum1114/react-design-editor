import { Collapse, Empty, Form } from 'antd';
import React from 'react';

import type { CanvasInstance } from '../../../canvas';
import Scrollbar from '../../../components/common/Scrollbar';
import { Flex } from '../../../components/flex';
import PropertyDefinition from './PropertyDefinition';

interface NodePropertiesProps {
	canvasRef?: CanvasInstance;
	selectedItem?: any;
	onChange?: (selectedItem: any, changedValues: Record<string, any>, allValues: Record<string, any>) => void;
}

const NodePropertiesForm = ({ canvasRef, selectedItem, onChange }: NodePropertiesProps) => {
	const [form] = Form.useForm();
	const showArrow = false;

	return (
		<Scrollbar>
			<Form
				form={form}
				layout="horizontal"
				colon={false}
				onValuesChange={(changedValues, allValues) => {
					onChange?.(selectedItem, changedValues, allValues);
				}}
			>
				{selectedItem && PropertyDefinition[selectedItem.type] ? (
					<Collapse
						bordered={false}
						items={Object.keys(PropertyDefinition[selectedItem.type]).map(key => ({
							key,
							label: PropertyDefinition[selectedItem.type][key].title,
							showArrow,
							children: PropertyDefinition[selectedItem.type][key].component.render(
								canvasRef,
								form,
								selectedItem,
							),
						}))}
					/>
				) : (
					<Flex
						justifyContent="center"
						alignItems="center"
						style={{
							width: '100%',
							height: '100%',
							color: 'rgba(0, 0, 0, 0.45)',
							fontSize: 16,
							padding: 16,
						}}
					>
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</Flex>
				)}
			</Form>
		</Scrollbar>
	);
};

export default function NodeProperties(props: NodePropertiesProps) {
	return <NodePropertiesForm key={props.selectedItem?.id || 'empty'} {...props} />;
}
