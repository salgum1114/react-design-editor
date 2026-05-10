import React from 'react';
import { Form, Slider, Switch } from 'antd';
import i18n from 'i18next';

import ColorPicker from '../../../components/common/ColorPicker';

type ShadowData = {
	shadow?: {
		enabled?: boolean;
		color?: string;
		blur?: number;
		offsetX?: number;
		offsetY?: number;
	};
};

export default {
	render(_canvasRef: unknown, form: any, data: ShadowData) {
		const enabled = Form.useWatch(['shadow', 'enabled'], form) ?? data.shadow?.enabled ?? false;

		return (
			<React.Fragment>
				<Form.Item
					label={i18n.t('imagemap.shadow.shadow-enabled')}
					colon={false}
					name={['shadow', 'enabled']}
					initialValue={data.shadow?.enabled ?? false}
					valuePropName="checked"
				>
					<Switch size="small" />
				</Form.Item>
				{enabled ? (
					<React.Fragment>
						<Form.Item
							label={i18n.t('common.color')}
							colon={false}
							name={['shadow', 'color']}
							initialValue={data.shadow?.color || 'rgba(0, 0, 0, 0)'}
						>
							<ColorPicker />
						</Form.Item>
						<Form.Item
							label={i18n.t('common.blur')}
							colon={false}
							name={['shadow', 'blur']}
							initialValue={data.shadow?.blur || 15}
							rules={[{ type: 'number', min: 0, max: 100 }]}
						>
							<Slider min={0} max={100} />
						</Form.Item>
						<Form.Item
							label={i18n.t('imagemap.shadow.offset-x')}
							colon={false}
							name={['shadow', 'offsetX']}
							initialValue={data.shadow?.offsetX || 10}
							rules={[{ type: 'number', min: 0, max: 100 }]}
						>
							<Slider min={0} max={100} />
						</Form.Item>
						<Form.Item
							label={i18n.t('imagemap.shadow.offset-y')}
							colon={false}
							name={['shadow', 'offsetY']}
							initialValue={data.shadow?.offsetY || 10}
							rules={[{ type: 'number', min: 0, max: 100 }]}
						>
							<Slider min={0} max={100} />
						</Form.Item>
					</React.Fragment>
				) : null}
			</React.Fragment>
		);
	},
};
