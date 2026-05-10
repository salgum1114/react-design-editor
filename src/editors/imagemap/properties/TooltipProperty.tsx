import { Form, Switch } from 'antd';
import React from 'react';
import i18n from 'i18next';

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
				label={i18n.t('imagemap.tooltip.tooltip-enabled')}
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
