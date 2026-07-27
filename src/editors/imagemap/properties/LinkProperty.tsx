import { Form, Input, Select, Switch } from 'antd';
import i18next from 'i18next';
import React from 'react';

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
					label={i18next.t('imagemap.link.link-enabled')}
					colon={false}
					name={['link', 'enabled']}
					initialValue={data.link.enabled}
					rules={[
						{
							required: true,
							message: i18next.t('validation.enter-property', {
								arg: i18next.t('imagemap.marker.link-enabled'),
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
							label={i18next.t('common.state')}
							colon={false}
							name={['link', 'state']}
							initialValue={data.link.state || 'current'}
						>
							<Select>
								<Select.Option value="current">{i18next.t('common.current')}</Select.Option>
								<Select.Option value="new">{i18next.t('common.new')}</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							label={i18next.t('common.url')}
							colon={false}
							name={['link', 'url']}
							initialValue={data.link.url || ''}
							rules={[
								{
									required: true,
									message: i18next.t('validation.enter-property', { arg: i18next.t('common.url') }),
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
