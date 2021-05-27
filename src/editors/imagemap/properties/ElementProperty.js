import React from 'react';
import { Form } from 'antd';
import AceModal from '../../../components/ace/AceModal';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		if (!data) {
			return null;
		}
		return (
			<Form.Item>
				{getFieldDecorator('code', {
					rules: [
						{
							required: true,
							message: 'Please input code',
						},
					],
					initialValue: data.code,
				})(<AceModal form={form} code={data.code} />)}
			</Form.Item>
		);
	},
};
