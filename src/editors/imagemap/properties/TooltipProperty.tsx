import { Form, Switch } from 'antd';
import i18next from 'i18next';
import React from 'react';

type TooltipPropertyData = {
	tooltip?: {
		enabled?: boolean;
	};
};

export default {
	render(_canvasRef: unknown, _form: unknown, data?: TooltipPropertyData) {
		if (!data) {
			return null;
		}

		return (
			<Form.Item
				label={i18next.t('imagemap.tooltip.tooltip-enabled')}
				colon={false}
				name={['tooltip', 'enabled']}
				initialValue={data.tooltip?.enabled}
				rules={[{ type: 'boolean' }]}
				valuePropName="checked"
			>
				<Switch size="small" />
			</Form.Item>
		);
	},
};
