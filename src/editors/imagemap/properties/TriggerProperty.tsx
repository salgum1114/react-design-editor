import React from 'react';
import { Form, Switch } from 'antd';
import i18n from 'i18next';

import CodeModal from '../../../components/common/CodeModal';

type TriggerData = {
	trigger: {
		enabled?: boolean;
		code?: string;
	};
};

export default {
	render(_canvasRef: unknown, form: any, data: TriggerData) {
		const enabled = Form.useWatch(['trigger', 'enabled'], form) ?? data.trigger.enabled;

		return (
			<React.Fragment>
				<Form.Item
					label={i18n.t('imagemap.trigger.trigger-enabled')}
					colon={false}
					name={['trigger', 'enabled']}
					initialValue={data.trigger.enabled}
					rules={[{ type: 'boolean' }]}
					valuePropName="checked"
				>
					<Switch size="small" />
				</Form.Item>
				<Form.Item
					style={{ display: enabled ? 'block' : 'none' }}
					name={['trigger', 'code']}
					initialValue={data.trigger.code || 'return null;'}
				>
					<CodeModal />
				</Form.Item>
			</React.Fragment>
		);
	},
};
