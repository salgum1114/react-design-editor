import React from 'react';
import { Form } from 'antd';

import AceModal from '../../../components/ace/AceModal';

type ElementData = {
	code?: {
		html?: string;
		css?: string;
		js?: string;
	};
};

export default {
	render(_canvasRef: unknown, _form: unknown, data?: ElementData) {
		if (!data) {
			return null;
		}

		return (
			<Form.Item name="code" initialValue={data.code} rules={[{ required: true, message: 'Please input code' }]}>
				<AceModal />
			</Form.Item>
		);
	},
};
