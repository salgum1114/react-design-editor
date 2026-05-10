import React from 'react';
import { Form } from 'antd';

import ChartModal from '../../../components/common/ChartModal';

type ChartData = {
	chartOptionStr?: string;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data?: ChartData) {
		if (!data) {
			return null;
		}

		return (
			<Form.Item
				name="chartOption"
				initialValue={data.chartOptionStr}
				rules={[{ required: true, message: 'Please input code' }]}
			>
				<ChartModal />
			</Form.Item>
		);
	},
};
