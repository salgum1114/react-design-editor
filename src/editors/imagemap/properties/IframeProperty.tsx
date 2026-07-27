import React from 'react';
import { Form } from 'antd';

import UrlModal from '../../../components/common/UrlModal';

type IframeData = {
	src?: string;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data?: IframeData) {
		if (!data) {
			return null;
		}

		return (
			<Form.Item name="src" initialValue={data.src} rules={[{ required: true, message: 'Please select image' }]}>
				<UrlModal />
			</Form.Item>
		);
	},
};
