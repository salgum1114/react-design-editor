import React from 'react';
import { Form } from 'antd';

import ChartModal from '../../../components/common/ChartModal';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		if (!data) {
			return null;
		}
		return (
			<Form.Item>
				{getFieldDecorator('chartOption', {
					rules: [
						{
							required: true,
							message: 'Please input code',
						},
					],
					initialValue: data.chartOptionStr,
				})(<ChartModal form={form} />)}
			</Form.Item>
		);
	},
};
