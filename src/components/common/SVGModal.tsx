import type { RadioChangeEvent } from 'antd';
import { Form, Modal, Radio } from 'antd';
import React from 'react';

import i18next from 'i18next';
import { InputHtml } from '.';
import FileUpload from './FileUpload';

interface SvgModalValues {
	loadType: 'file' | 'svg';
	svg: Blob | string;
}

interface SVGModalProps {
	onOk: (values: SvgModalValues) => void;
	onCancel?: () => void;
	visible: boolean;
}

const readBlobAsDataUrl = (blob: Blob) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});

const SVGModal = ({ onCancel, onOk, visible }: SVGModalProps) => {
	const [form] = Form.useForm<SvgModalValues>();
	const loadType = Form.useWatch('loadType', form) || 'file';

	React.useEffect(() => {
		if (visible) {
			form.setFieldsValue({
				loadType: 'file',
				svg: undefined as never,
			});
			return;
		}
		form.resetFields();
	}, [form, visible]);

	const handleChangeSvgType = (event: RadioChangeEvent) => {
		form.resetFields(['svg']);
		form.setFieldValue('loadType', event.target.value as 'file' | 'svg');
	};

	const handleOk = async () => {
		const values = await form.validateFields();
		if (values.svg instanceof Blob) {
			onOk({
				...values,
				svg: await readBlobAsDataUrl(values.svg),
			});
			return;
		}
		onOk(values);
	};

	const handleCancel = () => {
		onCancel?.();
	};

	return (
		<Modal
			title={i18next.t('imagemap.svg.add-svg')}
			closable
			onCancel={handleCancel}
			onOk={handleOk}
			open={visible}
		>
			<Form form={form} colon={false} initialValues={{ loadType: 'file' }}>
				<Form.Item label={i18next.t('common.type')} name="loadType">
					<Radio.Group onChange={handleChangeSvgType}>
						<Radio.Button value="file">{i18next.t('common.file')}</Radio.Button>
						<Radio.Button value="svg">{i18next.t('common.svg')}</Radio.Button>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					label={loadType === 'svg' ? i18next.t('common.svg') : i18next.t('common.file')}
					name="svg"
					rules={[
						{
							required: true,
							message: i18next.t('validation.enter-property', {
								arg: loadType === 'svg' ? i18next.t('common.svg') : i18next.t('common.file'),
							}),
						},
					]}
				>
					{loadType === 'svg' ? <InputHtml /> : <FileUpload accept=".svg" />}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default SVGModal;
