import React from 'react';
import { Form, Input, Radio, Row, Col, InputNumber } from 'antd';
import i18n from 'i18next';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		if (!data) {
			return null;
		}
		const layout = data.layout || 'fixed';
		return (
			<React.Fragment>
				<Form.Item label={i18n.t('common.name')} colon={false}>
					{getFieldDecorator('name', {
						rules: [
							{
								required: false,
								message: i18n.t('validation.enter-arg', { arg: i18n.t('common.name') }),
							},
						],
						initialValue: data.name || '',
					})(<Input />)}
				</Form.Item>
				<Form.Item label={i18n.t('common.layout')} colon={false}>
					{getFieldDecorator('layout', {
						initialValue: layout,
					})(
						<Radio.Group size="small">
							<Radio.Button value="fixed">{i18n.t('common.fixed')}</Radio.Button>
							<Radio.Button value="responsive">{i18n.t('common.responsive')}</Radio.Button>
							<Radio.Button value="fullscreen">{i18n.t('common.fullscreen')}</Radio.Button>
						</Radio.Group>,
					)}
				</Form.Item>
				{layout === 'fixed' ? (
					<React.Fragment>
						<Row>
							<Col span={12}>
								<Form.Item label={i18n.t('common.width')} colon={false}>
									{getFieldDecorator('width', {
										rules: [
											{
												required: true,
												message: i18n.t('validation.enter-arg', {
													arg: i18n.t('common.width'),
												}),
											},
										],
										initialValue: data.width * data.scaleX,
									})(<InputNumber />)}
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item label={i18n.t('common.height')} colon={false}>
									{getFieldDecorator('height', {
										rules: [
											{
												required: true,
												message: i18n.t('validation.enter-arg', {
													arg: i18n.t('common.height'),
												}),
											},
										],
										initialValue: data.height * data.scaleY,
									})(<InputNumber />)}
								</Form.Item>
							</Col>
						</Row>
					</React.Fragment>
				) : null}
			</React.Fragment>
		);
	},
};
