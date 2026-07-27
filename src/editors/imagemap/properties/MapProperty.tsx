import { Col, Form, Input, InputNumber, Radio, Row } from 'antd';
import i18next from 'i18next';
import React from 'react';

const MapPropertyFields = ({ form, data }: { form: any; data: any }) => {
	const layout = Form.useWatch('layout', form) || data?.layout || 'fixed';

	if (!data) {
		return null;
	}

	return (
		<React.Fragment>
			<Form.Item label={i18next.t('common.name')} colon={false} name="name">
				<Input />
			</Form.Item>
			<Form.Item label={i18next.t('common.layout')} colon={false} name="layout">
				<Radio.Group size="small">
					<Radio.Button value="fixed">{i18next.t('common.fixed')}</Radio.Button>
					<Radio.Button value="responsive">{i18next.t('common.responsive')}</Radio.Button>
					<Radio.Button value="fullscreen">{i18next.t('common.fullscreen')}</Radio.Button>
				</Radio.Group>
			</Form.Item>
			{layout === 'fixed' ? (
				<Row>
					<Col span={12}>
						<Form.Item
							label={i18next.t('common.width')}
							colon={false}
							name="width"
							rules={[
								{
									required: true,
									message: i18next.t('validation.enter-arg', { arg: i18next.t('common.width') }),
								},
							]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={i18next.t('common.height')}
							colon={false}
							name="height"
							rules={[
								{
									required: true,
									message: i18next.t('validation.enter-arg', { arg: i18next.t('common.height') }),
								},
							]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
				</Row>
			) : null}
		</React.Fragment>
	);
};

export default {
	render(_canvasRef: unknown, form: any, data: any) {
		return <MapPropertyFields form={form} data={data} />;
	},
};
