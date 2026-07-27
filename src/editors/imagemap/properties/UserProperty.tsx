import { Form } from 'antd';
import React from 'react';

import EditTable from '../../../components/common/EditTable';

type UserPropertyData = {
	userProperty?: Record<string, string>;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: UserPropertyData) {
		return (
			<React.Fragment>
				<Form.Item name="userProperty" initialValue={data.userProperty || {}}>
					<EditTable />
				</Form.Item>
			</React.Fragment>
		);
	},
};
