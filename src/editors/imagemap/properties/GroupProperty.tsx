import React from 'react';
import { Col, Form, Input, InputNumber, Row, Slider } from 'antd';

type GroupData = {
	name?: string;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	left?: number;
	top?: number;
	angle?: number;
};

export default {
	render(_canvasRef: unknown, _form: unknown, data: GroupData) {
		return (
			<React.Fragment>
				<Form.Item label="Name" colon={false} name="name" initialValue={data.name}>
					<Input />
				</Form.Item>
				<Row>
					<Col span={12}>
						<Form.Item
							label="Width"
							colon={false}
							name="width"
							initialValue={data.width * data.scaleX}
							rules={[{ required: true, message: 'Please input width' }]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Height"
							colon={false}
							name="height"
							initialValue={data.height * data.scaleY}
							rules={[{ required: true, message: 'Please input height' }]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item
							label="Left"
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
							label="Top"
							colon={false}
							name="top"
							initialValue={data.top}
							rules={[{ required: true, message: 'Please input y position' }]}
						>
							<InputNumber />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label="Rotation"
					colon={false}
					name="angle"
					initialValue={data.angle}
					rules={[{ type: 'number', required: true, message: 'Please input rotation' }]}
				>
					<Slider min={0} max={360} />
				</Form.Item>
			</React.Fragment>
		);
	},
};
