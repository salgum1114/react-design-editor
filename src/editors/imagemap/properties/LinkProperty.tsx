import { Form, Input, Select, Switch } from 'antd';
import React from 'react';
import i18n from 'i18next';

type LinkPropertyData = {
	link: {
		enabled?: boolean;
		state?: string;
		url?: string;
	};
};

export default {
	render(_canvasRef: unknown, form: any, data: LinkPropertyData) {
		const enabled = Form.useWatch(['link', 'enabled'], form) ?? data.link.enabled;

		return (
			<React.Fragment>
				<Form.Item
					label={i18n.t('imagemap.link.link-enabled')}
					colon={false}
					name={['link', 'enabled']}
					initialValue={data.link.enabled}
					rules={[
						{
							required: true,
							message: i18n.t('validation.enter-property', {
								arg: i18n.t('imagemap.marker.link-enabled'),
							}),
						},
					]}
					valuePropName="checked"
				>
					<Switch size="small" />
				</Form.Item>
				{enabled ? (
					<React.Fragment>
						<Form.Item
							label={i18n.t('common.state')}
							colon={false}
							name={['link', 'state']}
							initialValue={data.link.state || 'current'}
						>
							<Select>
								<Select.Option value="current">{i18n.t('common.current')}</Select.Option>
								<Select.Option value="new">{i18n.t('common.new')}</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							label={i18n.t('common.url')}
							colon={false}
							name={['link', 'url']}
							initialValue={data.link.url || ''}
							rules={[
								{
									required: true,
									message: i18n.t('validation.enter-property', { arg: i18n.t('common.url') }),
								},
							]}
						>
							<Input />
						</Form.Item>
					</React.Fragment>
				) : null}
			</React.Fragment>
		);
	},
};
