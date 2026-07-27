import { Col, Form, Select, Slider, Tag } from 'antd';
import React from 'react';

import { sortBy } from 'lodash-es';
import Fonts from '../../../components/font/fonts';
import Icon from '../../../components/icon/Icon';

const fonts = Fonts.getFonts() as Record<string, Array<{ name: string }>>;

type TextData = {
	fontFamily?: string;
	fontSize?: string | number;
	fontWeight?: string;
	fontStyle?: string;
	linethrough?: boolean;
	underline?: boolean;
	textAlign?: string;
	lineHeight?: number;
	charSpacing?: number;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: TextData) {
		return (
			<React.Fragment>
				<Col span={16}>
					<Form.Item label="Font Family" colon={false} name="fontFamily" initialValue={data.fontFamily}>
						<Select>
							{Object.keys(fonts).map(font => (
								<Select.OptGroup key={font} label={font.toUpperCase()}>
									{sortBy(fonts[font], ['name']).map(item => (
										<Select.Option key={item.name} value={item.name}>
											{item.name}
										</Select.Option>
									))}
								</Select.OptGroup>
							))}
						</Select>
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item
						label="Font Size"
						colon={false}
						name="fontSize"
						initialValue={String(data.fontSize || '32')}
					>
						<Select>
							{Array.from({ length: 60 }, (_value, index) => (
								<Select.Option key={index} value={`${index + 1}`}>
									{index + 1}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="fontWeight" initialValue={data.fontWeight === 'bold'} valuePropName="checked">
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="bold" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="fontStyle" initialValue={data.fontStyle === 'italic'} valuePropName="checked">
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="italic" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="linethrough" initialValue={data.linethrough} valuePropName="checked">
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="strikethrough" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="underline" initialValue={data.underline} valuePropName="checked">
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="underline" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						name={['textAlign', 'left']}
						initialValue={data.textAlign === 'left'}
						valuePropName="checked"
					>
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="align-left" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						name={['textAlign', 'center']}
						initialValue={data.textAlign === 'center'}
						valuePropName="checked"
					>
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="align-center" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						name={['textAlign', 'right']}
						initialValue={data.textAlign === 'right'}
						valuePropName="checked"
					>
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="align-right" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						name={['textAlign', 'justify']}
						initialValue={data.textAlign === 'justify'}
						valuePropName="checked"
					>
						<Tag.CheckableTag checked={false} className="rde-action-tag">
							<Icon name="align-justify" />
						</Tag.CheckableTag>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Line Height"
						colon={false}
						name="lineHeight"
						initialValue={data.lineHeight}
						rules={[{ type: 'number' }]}
					>
						<Slider min={0} max={100} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Char Spacing"
						colon={false}
						name="charSpacing"
						initialValue={data.charSpacing}
						rules={[{ type: 'number' }]}
					>
						<Slider min={0} max={100} />
					</Form.Item>
				</Col>
			</React.Fragment>
		);
	},
};
