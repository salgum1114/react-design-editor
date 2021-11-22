import React from 'react';
import { Form } from 'antd';
import EditTable from '../../../components/common/EditTable';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		return (
			<React.Fragment>
				<Form.Item>
					{getFieldDecorator('userProperty', {})(<EditTable userProperty={data.userProperty} form={form} />)}
				</Form.Item>
			</React.Fragment>
		);
	},
};
