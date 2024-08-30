import { Form, Radio } from 'antd';
import i18n from 'i18next';
import React from 'react';

import FileUpload from '../../../components/common/FileUpload';

export default {
	render(canvasRef, form, data) {
		if (!data) {
			return null;
		}
		const loadType = data.loadType || 'file';
		return (
			<React.Fragment>
				<Form.Item label={i18n.t('common.type')}>
					{form.getFieldDecorator('loadType', {
						initialValue: loadType,
					})(
						<Radio.Group onChange={this.handleChangeSvgType}>
							<Radio.Button value="file">{i18n.t('common.file')}</Radio.Button>
							<Radio.Button value="svg">{i18n.t('common.svg')}</Radio.Button>
						</Radio.Group>,
					)}
				</Form.Item>
				<Form.Item label={loadType === 'svg' ? i18n.t('common.svg') : i18n.t('common.file')}>
					{form.getFieldDecorator('src', {
						rules: [
							{
								required: true,
								message: i18n.t('validation.enter-property', {
									arg: loadType === 'svg' ? i18n.t('common.svg') : i18n.t('common.file'),
								}),
							},
						],
					})(loadType === 'svg' ? <InputHtml /> : <FileUpload accept=".svg" />)}
				</Form.Item>
			</React.Fragment>
		);
	},
};
