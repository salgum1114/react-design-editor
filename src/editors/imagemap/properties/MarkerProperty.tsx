import { Form } from 'antd';
import React from 'react';

import IconChooser from '../../../components/icon/IconChooser';

type MarkerPropertyData = {
	icon?: Record<string, any>;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: MarkerPropertyData) {
		return (
			<React.Fragment>
				<Form.Item name="icon" initialValue={data.icon}>
					<IconChooser />
				</Form.Item>
			</React.Fragment>
		);
	},
};
