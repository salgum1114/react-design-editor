import React from 'react';
import { Button, Col, Form, InputNumber, Row, Select, Slider, Switch } from 'antd';
import i18n from 'i18next';

import ColorPicker from '../../../components/common/ColorPicker';
import Icon from '../../../components/icon/Icon';

type AnimationValue = {
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

type AnimationData = {
	id?: string;
	angle?: number;
	fill?: string;
	stroke?: string;
	animation: AnimationValue;
};

const renderAnimationFields = (type: string, data: AnimationData) => {
	if (type === 'fade') {
		return (
			<Form.Item
				label={i18n.t('common.opacity')}
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
					label={i18n.t('imagemap.animation.bounce-type')}
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
					label={i18n.t('common.offset')}
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
					label={i18n.t('imagemap.animation.shake-type')}
					colon={false}
					name={['animation', 'shake']}
					initialValue={data.animation.shake || 'hotizontal'}
				>
					<Select>
						<Select.Option value="hotizontal">{i18n.t('common.horizontal')}</Select.Option>
						<Select.Option value="vertical">{i18n.t('common.vertical')}</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					label={i18n.t('common.offset')}
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
				label={i18n.t('imagemap.animation.scaling')}
				colon={false}
				name={['animation', 'scale']}
				initialValue={data.animation.scale || 2}
				rules={[{ type: 'number', min: 1, max: 5 }]}
			>
				<Slider min={1} max={5} step={0.1} />
			</Form.Item>
		);
	}

	if (type === 'rotation') {
		return (
			<Form.Item
				label={i18n.t('common.angle')}
				colon={false}
				name={['animation', 'angle']}
				initialValue={data.animation.angle || 360}
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
						label={i18n.t('imagemap.style.fill-color')}
						colon={false}
						name={['animation', 'fill']}
						initialValue={data.animation.fill || data.fill}
					>
						<ColorPicker />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label={i18n.t('imagemap.style.stroke-color')}
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
					label={i18n.t('common.value')}
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
	render(canvasRef: any, form: any, data?: AnimationData) {
		if (!data) {
			return null;
		}

		const type = Form.useWatch(['animation', 'type'], form) || data.animation.type || 'none';

		return (
			<React.Fragment>
				<Form.Item
					label={i18n.t('imagemap.animation.animation-type')}
					colon={false}
					name={['animation', 'type']}
					initialValue={type}
				>
					<Select>
						<Select.Option value="none">{i18n.t('imagemap.animation.none')}</Select.Option>
						<Select.Option value="fade">{i18n.t('imagemap.animation.fade')}</Select.Option>
						<Select.Option value="bounce">{i18n.t('imagemap.animation.bounce')}</Select.Option>
						<Select.Option value="shake">{i18n.t('imagemap.animation.shake')}</Select.Option>
						<Select.Option value="scaling">{i18n.t('imagemap.animation.scaling')}</Select.Option>
						<Select.Option value="rotation">{i18n.t('imagemap.animation.rotation')}</Select.Option>
						<Select.Option value="flash">{i18n.t('imagemap.animation.flash')}</Select.Option>
					</Select>
				</Form.Item>
				{type === 'none' ? null : (
					<React.Fragment>
						<Row>
							<Col span={12}>
								<Form.Item
									label={i18n.t('imagemap.animation.auto-play')}
									colon={false}
									name={['animation', 'autoplay']}
									initialValue={data.animation.autoplay}
									valuePropName="checked"
									rules={[{ type: 'boolean' }]}
								>
									<Switch size="small" />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label={i18n.t('common.loop')}
									colon={false}
									name={['animation', 'loop']}
									initialValue={data.animation.loop}
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
										label={i18n.t('common.delay')}
										colon={false}
										name={['animation', 'delay']}
										initialValue={data.animation.delay || 0}
										rules={[{ type: 'number', min: 0, max: 5000 }]}
									>
										<Slider min={0} max={5000} step={100} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label={i18n.t('common.duration')}
										colon={false}
										name={['animation', 'duration']}
										initialValue={data.animation.duration}
										rules={[{ type: 'number', min: 100, max: 5000 }]}
									>
										<Slider min={100} max={5000} step={100} />
									</Form.Item>
								</Col>
							</Row>
						) : null}
						{renderAnimationFields(type, data)}
						<Form.Item label={i18n.t('imagemap.animation.playback')} colon={false}>
							<Row>
								<Col span={8}>
									<Button
										block
										size="small"
										onClick={() => canvasRef.handler.animationHandler.play(data.id)}
									>
										<Icon name="play" style={{ marginRight: 8 }} />
										{i18n.t('action.start')}
									</Button>
								</Col>
								<Col span={8}>
									<Button
										block
										size="small"
										onClick={() => canvasRef.handler.animationHandler.pause(data.id)}
									>
										<Icon name="pause" style={{ marginRight: 8 }} />
										{i18n.t('action.pause')}
									</Button>
								</Col>
								<Col span={8}>
									<Button
										block
										size="small"
										onClick={() => canvasRef.handler.animationHandler.stop(data.id)}
									>
										<Icon name="stop" style={{ marginRight: 8 }} />
										{i18n.t('action.stop')}
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
