import { Form, Input, Modal } from 'antd';
import React from 'react';

import i18next from 'i18next';
import Canvas, { type CanvasInstance } from '../../../canvas/Canvas';
import StyleProperty from '../properties/StyleProperty';

type ValidateTitle = {
	help?: string;
	validateStatus?: string;
};

type StyleValue = Record<string, any>;

interface StyleModalProps {
	visible?: boolean;
	style?: StyleValue;
	onOk?: () => void;
	onCancel?: () => void;
	onChange?: (props: StyleModalProps, changedValues: Record<string, any>, allValues: Record<string, any>) => void;
	validateTitle?: ValidateTitle;
}

export interface StyleModalHandle {
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
	id: 'styles',
};

const defaultStyle: StyleValue = {
	fill: 'rgba(0, 0, 0, 1)',
	opacity: 1,
	stroke: 'rgba(255, 255, 255, 0)',
	strokeWidth: 1,
};

const StyleModal = React.forwardRef<StyleModalHandle, StyleModalProps>((props, ref) => {
	const { onCancel, onChange, onOk, style, validateTitle = {}, visible } = props;
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
	const nextStyle = React.useMemo(() => {
		const mergedStyle = { ...defaultStyle, ...(style || {}) };
		delete mergedStyle.strokeDashArray;
		return mergedStyle;
	}, [style]);

	React.useImperativeHandle(
		ref,
		() => ({
			validateFields: callback => {
				const promise = form.validateFields();
				promise
					.then(values => callback?.(null, values))
					.catch(error => callback?.(error, form.getFieldsValue(true)));
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
			return undefined;
		}

		form.resetFields();
		form.setFieldsValue(nextStyle);

		const syncCanvas = () => {
			const canvas = canvasRef.current;
			if (canvas) {
				Object.entries(nextStyle).forEach(([key, value]) => {
					canvas.handler.setById('styles', key, value);
				});
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
	}, [form, nextStyle, visible]);

	return (
		<Modal onOk={onOk} onCancel={onCancel} open={visible}>
			<Form
				form={form}
				layout="vertical"
				onValuesChange={(changedValues, allValues) => {
					onChange?.(props, changedValues, allValues);
				}}
			>
				<Form.Item
					label={i18next.t('common.title')}
					required
					colon={false}
					hasFeedback
					help={validateTitle.help}
					validateStatus={validateTitle.validateStatus as any}
					name="title"
				>
					<Input />
				</Form.Item>
				{StyleProperty.render(canvasApi, form, nextStyle)}
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

StyleModal.displayName = 'StyleModal';

export default StyleModal;
