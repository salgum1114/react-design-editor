import React from 'react';
import { Form, Slider, Col, Select, Tag } from 'antd';
import sortBy from 'lodash/sortBy';

import Icon from '../../../components/icon/Icon';
import Fonts from '../../../components/font/fonts';

const fonts = Fonts.getFonts();

export default {
	render(canvasRef, form, data) {
		const { getFieldDecorator } = form;
		return (
			<React.Fragment>
				<Col span={16}>
					<Form.Item label="Font Family" colon={false}>
						{getFieldDecorator('fontFamily', {
							initialValue: data.fontFamily,
						})(
							<Select>
								{Object.keys(fonts).map(font => {
									return (
										<Select.OptGroup key={font} label={font.toUpperCase()}>
											{sortBy(fonts[font], ['name']).map(f => (
												<Select.Option key={f.name} value={f.name}>
													{f.name}
												</Select.Option>
											))}
										</Select.OptGroup>
									);
								})}
							</Select>,
						)}
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item label="Font Size" colon={false}>
						{getFieldDecorator('fontSize', {
							initialValue: data.fontSize || '32',
						})(
							<Select>
								{Array.from({ length: 60 }, (v, k) => (
									<Select.Option key={k} value={`${k + 1}`}>
										{k + 1}
									</Select.Option>
								))}
							</Select>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('fontWeight', {
							valuePropName: 'checked',
							initialValue: data.fontWeight === 'bold',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="bold" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('fontStyle', {
							valuePropName: 'checked',
							initialValue: data.fontStyle === 'italic',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="italic" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('linethrough', {
							valuePropName: 'checked',
							initialValue: data.linethrough,
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="strikethrough" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('underline', {
							valuePropName: 'checked',
							initialValue: data.underline,
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="underline" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('textAlign.left', {
							valuePropName: 'checked',
							initialValue: data.textAlign === 'left',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="align-left" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('textAlign.center', {
							valuePropName: 'checked',
							initialValue: data.textAlign === 'center',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="align-center" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('textAlign.right', {
							valuePropName: 'checked',
							initialValue: data.textAlign === 'right',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="align-right" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item>
						{getFieldDecorator('textAlign.justify', {
							valuePropName: 'checked',
							initialValue: data.textAlign === 'justify',
						})(
							<Tag.CheckableTag className="rde-action-tag">
								<Icon name="align-justify" />
							</Tag.CheckableTag>,
						)}
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Line Height" colon={false}>
						{getFieldDecorator('lineHeight', {
							rules: [
								{
									type: 'number',
								},
							],
							initialValue: data.lineHeight,
						})(<Slider min={0} max={100} />)}
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Char Spacing" colon={false}>
						{getFieldDecorator('charSpacing', {
							rules: [
								{
									type: 'number',
								},
							],
							initialValue: data.charSpacing,
						})(<Slider min={0} max={100} />)}
					</Form.Item>
				</Col>
			</React.Fragment>
		);
	},
};
