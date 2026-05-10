import { Collapse, Form } from 'antd';
import React from 'react';

import type { CanvasInstance } from '../../../canvas';
import Scrollbar from '../../../components/common/Scrollbar';
import PropertyDefinition from './PropertyDefinition';

interface MapPropertiesProps {
	canvasRef?: CanvasInstance;
	onChange?: (selectedItem: any, changedValues: Record<string, any>, allValues: Record<string, any>) => void;
	selectedItem?: any;
}

const { Panel } = Collapse;

const MapProperties = ({ canvasRef, onChange, selectedItem }: MapPropertiesProps) => {
	const [form] = Form.useForm();
	const showArrow = false;
	const workarea = canvasRef?.handler?.workarea;

	React.useEffect(() => {
		if (!workarea) {
			form.resetFields();
			return;
		}

		form.setFieldsValue({
			name: workarea.name || '',
			layout: workarea.layout || 'fixed',
			width: workarea.width * workarea.scaleX,
			height: workarea.height * workarea.scaleY,
			imageLoadType: workarea.imageLoadType || 'file',
			file: workarea.file,
			src: workarea.src,
		});
	}, [form, workarea]);

	if (!canvasRef) {
		return null;
	}

	return (
		<Scrollbar>
			<Form
				form={form}
				layout="horizontal"
				onValuesChange={(changedValues, allValues) => {
					onChange?.(selectedItem, changedValues, { workarea: allValues });
				}}
			>
				<Collapse bordered={false}>
					{Object.keys(PropertyDefinition.map).map(key => (
						<Panel key={key} header={PropertyDefinition.map[key].title} showArrow={showArrow}>
							{PropertyDefinition.map[key].component.render(canvasRef, form, workarea)}
						</Panel>
					))}
				</Collapse>
			</Form>
		</Scrollbar>
	);
};

export default MapProperties;
