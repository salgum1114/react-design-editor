import { Col, Form, Input, InputNumber, Row, Slider, Switch } from 'antd';
import React from 'react';
import i18n from 'i18next';

type GeneralPropertyData = {
	locked?: boolean;
	visible?: boolean;
	name?: string;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	left?: number;
	top?: number;
	angle?: number;
	superType?: string;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: GeneralPropertyData) {
		return (
			<React.Fragment>
				<Row>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.locked')}
							colon={false}
							name="locked"
							initialValue={data.locked}
							rules={[{ type: 'boolean' }]}
							valuePropName="checked"
						>
							<Switch size="small" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.visible')}
							colon={false}
							name="visible"
							initialValue={data.visible}
							rules={[{ type: 'boolean' }]}
							valuePropName="checked"
						>
							<Switch size="small" />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item label={i18n.t('common.name')} colon={false} name="name" initialValue={data.name}>
					<Input />
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.width')}
							colon={false}
							name="width"
							initialValue={parseInt(String(data.width * data.scaleX), 10)}
							rules={[{ type: 'number', required: true, message: 'Please input width', min: 1 }]}
						>
							<InputNumber min={1} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.height')}
							colon={false}
							name="height"
							initialValue={parseInt(String(data.height * data.scaleY), 10)}
							rules={[{ type: 'number', required: true, message: 'Please input height', min: 1 }]}
						>
							<InputNumber min={1} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.left')}
							colon={false}
							name="left"
							initialValue={data.left}
							rules={[{ required: true, message: 'Please input x position' }]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={i18n.t('common.top')}
							colon={false}
							name="top"
							initialValue={data.top}
							rules={[{ required: true, message: 'Please input y position' }]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
				</Row>
				{data.superType === 'element' ? null : (
					<Form.Item
						label={i18n.t('common.angle')}
						colon={false}
						name="angle"
						initialValue={data.angle}
						rules={[{ type: 'number', required: true, message: 'Please input rotation' }]}
					>
						<Slider min={0} max={360} />
					</Form.Item>
				)}
			</React.Fragment>
		);
	},
};
