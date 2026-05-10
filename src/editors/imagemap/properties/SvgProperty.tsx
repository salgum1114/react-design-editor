import { Form, Radio } from 'antd';
import i18n from 'i18next';
import React from 'react';

import { InputHtml } from '../../../components/common';
import FileUpload from '../../../components/common/FileUpload';

type SvgData = {
	loadType?: 'file' | 'svg';
	src?: string | File;
};

export default {
	render(_canvasRef: unknown, form: any, data?: SvgData) {
		if (!data) {
			return null;
		}

		const loadType = Form.useWatch('loadType', form) || data.loadType || 'file';

		return (
			<React.Fragment>
				<Form.Item label={i18n.t('common.type')} name="loadType" initialValue={loadType}>
					<Radio.Group>
						<Radio.Button value="file">{i18n.t('common.file')}</Radio.Button>
						<Radio.Button value="svg">{i18n.t('common.svg')}</Radio.Button>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					label={loadType === 'svg' ? i18n.t('common.svg') : i18n.t('common.file')}
					name="src"
					initialValue={data.src}
					rules={[
						{
							required: true,
							message: i18n.t('validation.enter-property', {
								arg: loadType === 'svg' ? i18n.t('common.svg') : i18n.t('common.file'),
							}),
						},
					]}
				>
					{loadType === 'svg' ? <InputHtml /> : <FileUpload accept=".svg" />}
				</Form.Item>
			</React.Fragment>
		);
	},
};