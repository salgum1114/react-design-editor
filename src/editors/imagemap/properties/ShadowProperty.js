import React from 'react';
import { Form, Slider, Switch } from 'antd';
import i18n from 'i18next';

import ColorPicker from '../../../components/common/ColorPicker';

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		const enabeld = data.shadow ? data.shadow.enabled || false : false;
		return (
			<React.Fragment>
				<Form.Item label={i18n.t('imagemap.shadow.shadow-enabled')} colon={false}>
					{getFieldDecorator('shadow.enabled', {
						valuePropName: 'checked',
						initialValue: enabeld,
					})(<Switch size="small" />)}
				</Form.Item>
				{enabeld ? (
					<React.Fragment>
						<Form.Item label={i18n.t('common.color')} colon={false}>
							{getFieldDecorator('shadow.color', {
								initialValue: data.shadow.color || 'rgba(0, 0, 0, 0)',
							})(<ColorPicker />)}
						</Form.Item>
						<Form.Item label={i18n.t('common.blur')} colon={false}>
							{getFieldDecorator('shadow.blur', {
								rules: [
									{
										type: 'number',
										min: 0,
										max: 100,
									},
								],
								initialValue: data.shadow.blur || 15,
							})(<Slider min={0} max={100} />)}
						</Form.Item>
						<Form.Item label={i18n.t('imagemap.shadow.offset-x')} colon={false}>
							{getFieldDecorator('shadow.offsetX', {
								rules: [
									{
										type: 'number',
										min: 0,
										max: 100,
									},
								],
								initialValue: data.shadow.offsetX || 10,
							})(<Slider min={0} max={100} />)}
						</Form.Item>
						<Form.Item label={i18n.t('imagemap.shadow.offset-y')} colon={false}>
							{getFieldDecorator('shadow.offsetY', {
								rules: [
									{
										type: 'number',
										min: 0,
										max: 100,
									},
								],
								initialValue: data.shadow.offsetY || 10,
							})(<Slider min={0} max={100} />)}
						</Form.Item>
					</React.Fragment>
				) : null}
			</React.Fragment>
		);
	},
};
