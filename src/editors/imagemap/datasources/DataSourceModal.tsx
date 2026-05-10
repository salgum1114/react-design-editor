import { Form, Input, Modal } from 'antd';
import React from 'react';

import Canvas, { type CanvasInstance } from '../../../canvas/Canvas';
import DataSourceProperty from '../properties/DataSourceProperty';

type ValidateTitle = {
	help?: string;
	validateStatus?: string;
};

type DataSource = Record<string, any>;

interface DataSourceModalProps {
	visible?: boolean;
	dataSource?: DataSource;
	onOk?: () => void;
	onCancel?: () => void;
	onChange?: (
		props: DataSourceModalProps,
		changedValues: Record<string, any>,
		allValues: Record<string, any>,
	) => void;
	validateTitle?: ValidateTitle;
}

export interface DataSourceModalHandle {
	validateFields: (callback?: (errors: any, values?: Record<string, any>) => void) => Promise<Record<string, any>>;
	resetFields: () => void;
}

const previewOption = {
	type: 'i-text',
	text: '\uf3c5',
	fontFamily: 'Font Awesome 5 Free',
	fontWeight: 900,
	fontSize: 60,
	width: 30,
	height: 30,
	editable: false,
	name: 'New marker',
	tooltip: {
		enabled: false,
	},
	left: 200,
	top: 50,
	id: 'datasources',
	fill: 'rgba(0, 0, 0, 1)',
	stroke: 'rgba(255, 255, 255, 0)',
};

const DataSourceModal = React.forwardRef<DataSourceModalHandle, DataSourceModalProps>((props, ref) => {
	const { dataSource = {}, onCancel, onChange, onOk, validateTitle = {}, visible } = props;
	const [form] = Form.useForm();
	const [size, setSize] = React.useState({ width: 150, height: 150 });
	const canvasRef = React.useRef<CanvasInstance | null>(null);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const initializedRef = React.useRef(false);
	const canvasApi = React.useMemo(
		() => ({
			get handler() {
				return canvasRef.current?.handler;
			},
		}),
		[],
	);

	React.useImperativeHandle(
		ref,
		() => ({
			validateFields: callback => {
				const promise = form.validateFields().then(values => values.animation || {});
				promise
					.then(values => callback?.(null, values))
					.catch(error => callback?.(error, form.getFieldValue('animation') || {}));
				return promise;
			},
			resetFields: () => form.resetFields(),
		}),
		[form],
	);

	React.useEffect(() => {
		let timeoutId: number | undefined;
		const syncPreview = () => {
			const container = containerRef.current;
			const canvas = canvasRef.current;
			if (container && canvas) {
				setSize({
					width: container.clientWidth,
					height: container.clientHeight,
				});
				if (!initializedRef.current) {
					canvas.handler.add(previewOption as any);
					initializedRef.current = true;
				}
				return;
			}
			timeoutId = window.setTimeout(syncPreview, 5);
		};
		syncPreview();
		return () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	React.useEffect(() => {
		let timeoutId: number | undefined;
		if (!visible) {
			canvasRef.current?.handler.animationHandler.stop('datasources');
			return undefined;
		}

		form.resetFields();
		form.setFieldsValue({ animation: dataSource });

		const syncCanvas = () => {
			const canvas = canvasRef.current;
			if (canvas) {
				canvas.handler.setById('datasources', 'animation', dataSource);
				return;
			}
			timeoutId = window.setTimeout(syncCanvas, 5);
		};

		syncCanvas();
		return () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
		};
	}, [dataSource, form, visible]);

	return (
		<Modal onOk={onOk} onCancel={onCancel} open={visible}>
			<Form
				form={form}
				layout="vertical"
				onValuesChange={(changedValues, allValues) => {
					const nextChangedValues = changedValues.animation || {};
					const nextAllValues = allValues.animation || {};
					onChange?.(props, nextChangedValues, nextAllValues);
				}}
			>
				<Form.Item
					label="Title"
					required
					colon={false}
					hasFeedback
					help={validateTitle.help}
					validateStatus={validateTitle.validateStatus as any}
					name={['animation', 'title']}
				>
					<Input />
				</Form.Item>
				{DataSourceProperty.render(canvasApi, form, { animation: dataSource, id: 'datasources' })}
			</Form>
			<div ref={containerRef}>
				<Canvas
					ref={canvasRef}
					editable={false}
					canvasOption={{ width: size.width, height: size.height, backgroundColor: '#f3f3f3' }}
					workareaOption={{ backgroundColor: 'transparent' }}
				/>
			</div>
		</Modal>
	);
});

DataSourceModal.displayName = 'DataSourceModal';

export default DataSourceModal;
