import { Col, Form, InputNumber, Row, Select, Slider } from 'antd';
import React from 'react';

import i18next from 'i18next';
import ColorPicker from '../../../components/common/ColorPicker';

type StyleData = {
	type?: string;
	fill?: string;
	opacity?: number;
	stroke?: string;
	strokeWidth?: number;
	rx?: number;
	ry?: number;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: StyleData) {
		return (
			<React.Fragment>
				<Form.Item
					label={i18next.t('imagemap.style.fill-color')}
					colon={false}
					name="fill"
					initialValue={data.fill || 'rgba(0, 0, 0, 1)'}
				>
					<ColorPicker />
				</Form.Item>
				<Form.Item
					label={i18next.t('common.opacity')}
					colon={false}
					name="opacity"
					initialValue={data.opacity || 1}
					rules={[{ type: 'number', min: 0, max: 1 }]}
				>
					<Slider min={0} max={1} step={0.1} />
				</Form.Item>
				<Form.Item
					label={i18next.t('imagemap.style.stroke-color')}
					colon={false}
					name="stroke"
					initialValue={data.stroke || 'rgba(255, 255, 255, 0)'}
				>
					<ColorPicker />
				</Form.Item>
				<Form.Item
					label={i18next.t('imagemap.style.stroke-width')}
					colon={false}
					name="strokeWidth"
					initialValue={data.strokeWidth || 1}
				>
					<Select showSearch style={{ width: '100%' }}>
						{Array.from({ length: 12 }, (_value, index) => {
							const value = index + 1;
							return (
								<Select.Option key={value} value={value}>
									{value}
								</Select.Option>
							);
						})}
					</Select>
				</Form.Item>
				{data.type === 'rect' ? (
					<Row gutter={8}>
						<Col md={24} lg={12}>
							<Form.Item
								label={i18next.t('imagemap.style.rx')}
								colon={false}
								name="rx"
								initialValue={data.rx || 0}
							>
								<InputNumber min={0} />
							</Form.Item>
						</Col>
						<Col md={24} lg={12}>
							<Form.Item
								label={i18next.t('imagemap.style.ry')}
								colon={false}
								name="ry"
								initialValue={data.ry || 0}
							>
								<InputNumber min={0} />
							</Form.Item>
						</Col>
					</Row>
				) : null}
			</React.Fragment>
		);
	},
};
