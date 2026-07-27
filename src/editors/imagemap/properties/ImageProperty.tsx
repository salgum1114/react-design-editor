import { Form, Radio } from 'antd';
import React from 'react';

import i18next from 'i18next';
import FileUpload from '../../../components/common/FileUpload';
import UrlModal from '../../../components/common/UrlModal';

const ImagePropertyFields = ({ form, data }: { form: any; data: any }) => {
	const imageLoadType = Form.useWatch('imageLoadType', form) || data?.imageLoadType || 'file';

	if (!data) {
		return null;
	}

	return (
		<React.Fragment>
			<Form.Item label={i18next.t('imagemap.image.image-load-type')} colon={false} name="imageLoadType">
				<Radio.Group size="small">
					<Radio.Button value="file">{i18next.t('imagemap.image.file-upload')}</Radio.Button>
					<Radio.Button value="src">{i18next.t('imagemap.image.image-url')}</Radio.Button>
				</Radio.Group>
			</Form.Item>
			{imageLoadType === 'file' ? (
				<Form.Item
					label={i18next.t('common.file')}
					colon={false}
					name="file"
					rules={[
						{
							required: true,
							message: i18next.t('validation.enter-property', { arg: i18next.t('common.file') }),
						},
					]}
				>
					<FileUpload accept="image/*" limit={100} />
				</Form.Item>
			) : (
				<Form.Item name="src">
					<UrlModal />
				</Form.Item>
			)}
		</React.Fragment>
	);
};

export default {
	render(_canvasRef: unknown, form: any, data: any) {
		return <ImagePropertyFields form={form} data={data} />;
	},
};
