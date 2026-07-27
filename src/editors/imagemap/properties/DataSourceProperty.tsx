import React from 'react';
import { Button, Col, Form, InputNumber, Row, Select, Slider, Switch } from 'antd';

import ColorPicker from '../../../components/common/ColorPicker';

type DataSourceAnimationValue = {
	type?: string;
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
	duration?: number;
	opacity?: number;
	bounce?: string;
	offset?: number;
	shake?: string;
	scale?: number;
	angle?: number;
	fill?: string;
	stroke?: string;
	value?: number;
};

type DataSourceData = {
	id?: string;
	angle?: number;
	fill?: string;
	stroke?: string;
	animation: DataSourceAnimationValue;
};

const renderDataSourceFields = (type: string, data: DataSourceData) => {
	if (type === 'fade') {
		return (
			<Form.Item
				label="Opacity"
				colon={false}
				name={['animation', 'opacity']}
				initialValue={data.animation.opacity || 0}
				rules={[{ type: 'number', min: 0, max: 1 }]}
			>
				<Slider min={0} max={1} step={0.1} />
			</Form.Item>
		);
	}
	if (type === 'bounce') {
		return (
			<React.Fragment>
				<Form.Item
					label="Bounce Type"
					colon={false}
					name={['animation', 'bounce']}
					initialValue={data.animation.bounce || 'hotizontal'}
				>
					<Select>
						<Select.Option value="hotizontal">Horizontal</Select.Option>
						<Select.Option value="vertical">Vertical</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					label="Offset"
					colon={false}
					name={['animation', 'offset']}
					initialValue={data.animation.offset || 1}
					rules={[{ type: 'number', min: 1, max: 10 }]}
				>
					<Slider min={1} max={10} step={1} />
				</Form.Item>
			</React.Fragment>
		);
	}
	if (type === 'shake') {
		return (
			<React.Fragment>
				<Form.Item
					label="Shake Type"
					colon={false}
					name={['animation', 'shake']}
					initialValue={data.animation.shake || 'hotizontal'}
				>
					<Select>
						<Select.Option value="hotizontal">Horizontal</Select.Option>
						<Select.Option value="vertical">Vertical</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					label="Offset"
					colon={false}
					name={['animation', 'offset']}
					initialValue={data.animation.offset || 1}
					rules={[{ type: 'number', min: 1, max: 10 }]}
				>
					<Slider min={1} max={10} step={1} />
				</Form.Item>
			</React.Fragment>
		);
	}
	if (type === 'scaling') {
		return (
			<Form.Item
				label="Scaling"
				colon={false}
				name={['animation', 'scale']}
				initialValue={data.animation.scale || 1}
				rules={[{ type: 'number', min: 1, max: 5 }]}
			>
				<Slider min={1} max={5} step={0.1} />
			</Form.Item>
		);
	}
	if (type === 'rotation') {
		return (
			<Form.Item
				label="Angle"
				colon={false}
				name={['animation', 'angle']}
				initialValue={data.animation.angle || data.angle}
				rules={[{ type: 'number', min: 0, max: 360 }]}
			>
				<Slider min={0} max={360} />
			</Form.Item>
		);
	}
	if (type === 'flash') {
		return (
			<Row>
				<Col span={12}>
					<Form.Item
						label="Fill Color"
						colon={false}
						name={['animation', 'fill']}
						initialValue={data.animation.fill || data.fill}
					>
						<ColorPicker />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Stroke Color"
						colon={false}
						name={['animation', 'stroke']}
						initialValue={data.animation.stroke || data.stroke}
					>
						<ColorPicker />
					</Form.Item>
				</Col>
			</Row>
		);
	}
	return (
		<Row>
			<Col span={12}>
				<Form.Item
					label="Value"
					colon={false}
					name={['animation', 'value']}
					initialValue={data.animation.value || 1}
					rules={[{ type: 'number', min: 1, max: 10 }]}
				>
					<InputNumber min={1} max={10} />
				</Form.Item>
			</Col>
		</Row>
	);
};

export default {
	render(canvasRef: any, form: any, data?: DataSourceData) {
		if (!data) {
			return null;
		}
		const type = Form.useWatch(['animation', 'type'], form) || data.animation.type || 'none';
		return (
			<React.Fragment>
				<Form.Item label="Animation Type" colon={false} name={['animation', 'type']} initialValue={type}>
					<Select>
						<Select.Option value="none">None</Select.Option>
						<Select.Option value="fade">Fade</Select.Option>
						<Select.Option value="bounce">Bounce</Select.Option>
						<Select.Option value="shake">Shake</Select.Option>
						<Select.Option value="scaling">Scaling</Select.Option>
						<Select.Option value="rotation">Rotation</Select.Option>
						<Select.Option value="flash">Flash</Select.Option>
					</Select>
				</Form.Item>
				{type === 'none' ? null : (
					<React.Fragment>
						<Row>
							<Col span={12}>
								<Form.Item
									label="Auto Play"
									colon={false}
									name={['animation', 'autoplay']}
									initialValue={data.animation.autoplay || false}
									valuePropName="checked"
									rules={[{ type: 'boolean' }]}
								>
									<Switch size="small" />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="Loop"
									colon={false}
									name={['animation', 'loop']}
									initialValue={data.animation.loop || false}
									valuePropName="checked"
									rules={[{ type: 'boolean' }]}
								>
									<Switch size="small" />
								</Form.Item>
							</Col>
						</Row>
						{type !== 'shake' ? (
							<Row>
								<Col span={12}>
									<Form.Item
										label="Delay"
										colon={false}
										name={['animation', 'delay']}
										initialValue={data.animation.delay || 100}
										rules={[{ type: 'number', min: 100, max: 5000 }]}
									>
										<Slider min={100} max={5000} step={100} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Duration"
										colon={false}
										name={['animation', 'duration']}
										initialValue={data.animation.duration || 1000}
										rules={[{ type: 'number', min: 100, max: 5000 }]}
									>
										<Slider min={100} max={5000} step={100} />
									</Form.Item>
								</Col>
							</Row>
						) : null}
						{renderDataSourceFields(type, data)}
						<Form.Item label="Playback" colon={false}>
							<Row>
								<Col span={8}>
									<Button onClick={() => canvasRef.handler.animationHandler.play(data.id)}>
										Start
									</Button>
								</Col>
								<Col span={8}>
									<Button onClick={() => canvasRef.handler.animationHandler.pause(data.id)}>
										Pause
									</Button>
								</Col>
								<Col span={8}>
									<Button onClick={() => canvasRef.handler.animationHandler.stop(data.id)}>
										Stop
									</Button>
								</Col>
							</Row>
						</Form.Item>
					</React.Fragment>
				)}
			</React.Fragment>
		);
	},
};
