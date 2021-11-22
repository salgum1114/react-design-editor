import React from 'react';
import { Form, Radio } from 'antd';
import i18n from 'i18next';

import UrlModal from '../../../components/common/UrlModal';
import FileUpload from '../../../components/common/FileUpload';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		if (!data) {
			return null;
		}
		const imageLoadType = data.imageLoadType || 'file';
		return (
			<React.Fragment>
				<Form.Item label={i18n.t('imagemap.image.image-load-type')} colon={false}>
					{getFieldDecorator('imageLoadType', {
						initialValue: imageLoadType,
					})(
						<Radio.Group size="small">
							<Radio.Button value="file">{i18n.t('imagemap.image.file-upload')}</Radio.Button>
							<Radio.Button value="src">{i18n.t('imagemap.image.image-url')}</Radio.Button>
						</Radio.Group>,
					)}
				</Form.Item>
				{imageLoadType === 'file' ? (
					<Form.Item label={i18n.t('common.file')} colon={false}>
						{getFieldDecorator('file', {
							rules: [
								{
									required: true,
									message: i18n.t('validation.enter-property', { arg: i18n.t('common.file') }),
								},
							],
							initialValue: data.file,
						})(<FileUpload accept="image/*" />)}
					</Form.Item>
				) : (
					<Form.Item>
						{getFieldDecorator('src', {
							initialValue: data.src,
						})(<UrlModal form={form} />)}
					</Form.Item>
				)}
			</React.Fragment>
		);
	},
};
