import { Col, Form, Row, Slider, Tag } from 'antd';
import i18next from 'i18next';
import React from 'react';

type ImageFilterData = {
	filters: any[];
};

const simpleFilters = [
	{ key: 'grayscale', label: 'imagemap.filter.grayscale', index: 0, text: 'G' },
	{ key: 'invert', label: 'imagemap.filter.invert', index: 1, text: 'I' },
	{ key: 'sepia', label: 'imagemap.filter.sepia', index: 3, text: 'S' },
	{ key: 'brownie', label: 'imagemap.filter.brownie', index: 4, text: 'B' },
	{ key: 'vintage', label: 'imagemap.filter.vintage', index: 9, text: 'V' },
	{ key: 'blackwhite', label: 'imagemap.filter.blackwhite', index: 19, text: 'B' },
	{ key: 'technicolor', label: 'imagemap.filter.technicolor', index: 14, text: 'T' },
	{ key: 'polaroid', label: 'imagemap.filter.polaroid', index: 15, text: 'P' },
	{ key: 'sharpen', label: 'imagemap.filter.sharpen', index: 12, text: 'S' },
	{ key: 'emboss', label: 'imagemap.filter.emboss', index: 13, text: 'E' },
];

const toggleRows = [simpleFilters.slice(0, 4), simpleFilters.slice(4, 8), simpleFilters.slice(8, 10)];

export default {
	render(_canvasRef: unknown, form: any, data: ImageFilterData) {
		const { filters = [] } = data;
		const gammaEnabled = Form.useWatch(['filters', 'gamma', 'enabled'], form) ?? !!filters[17];
		const brightnessEnabled = Form.useWatch(['filters', 'brightness', 'enabled'], form) ?? !!filters[5];
		const contrastEnabled = Form.useWatch(['filters', 'contrast', 'enabled'], form) ?? !!filters[6];
		const saturationEnabled = Form.useWatch(['filters', 'saturation', 'enabled'], form) ?? !!filters[7];
		const hueEnabled = Form.useWatch(['filters', 'hue', 'enabled'], form) ?? !!filters[21];
		const noiseEnabled = Form.useWatch(['filters', 'noise', 'enabled'], form) ?? !!filters[8];
		const pixelateEnabled = Form.useWatch(['filters', 'pixelate', 'enabled'], form) ?? !!filters[10];
		const blurEnabled = Form.useWatch(['filters', 'blur', 'enabled'], form) ?? !!filters[11];

		return (
			<Row>
				{toggleRows.map((row, rowIndex) => (
					<Row key={`row-${rowIndex}`}>
						{row.map(filter => (
							<Col md={24} lg={6} key={filter.key}>
								<Form.Item label={i18next.t(filter.label)}>
									<Form.Item
										noStyle
										name={['filters', filter.key]}
										initialValue={!!filters[filter.index]}
										valuePropName="checked"
									>
										<Tag.CheckableTag checked={false} className="rde-action-tag">
											{filter.text}
										</Tag.CheckableTag>
									</Form.Item>
								</Form.Item>
							</Col>
						))}
					</Row>
				))}
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.gamma')}>
							<Form.Item
								noStyle
								name={['filters', 'gamma', 'enabled']}
								initialValue={!!filters[17]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									G
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={6}>
						<Form.Item
							label={i18next.t('color.red')}
							name={['filters', 'gamma', 'r']}
							initialValue={filters[17] ? filters[17].gamma[0] : 1}
						>
							<Slider disabled={!gammaEnabled} step={0.01} min={0.01} max={2.2} />
						</Form.Item>
					</Col>
					<Col md={24} lg={6}>
						<Form.Item
							label={i18next.t('color.green')}
							name={['filters', 'gamma', 'g']}
							initialValue={filters[17] ? filters[17].gamma[1] : 1}
						>
							<Slider disabled={!gammaEnabled} step={0.01} min={0.01} max={2.2} />
						</Form.Item>
					</Col>
					<Col md={24} lg={6}>
						<Form.Item
							label={i18next.t('color.blue')}
							name={['filters', 'gamma', 'b']}
							initialValue={filters[17] ? filters[17].gamma[2] : 1}
						>
							<Slider disabled={!gammaEnabled} step={0.01} min={0.01} max={2.2} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.brightness')}>
							<Form.Item
								noStyle
								name={['filters', 'brightness', 'enabled']}
								initialValue={!!filters[5]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									B
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.brightness')}
							name={['filters', 'brightness', 'brightness']}
							initialValue={filters[5] ? filters[5].brightness : 0.1}
						>
							<Slider disabled={!brightnessEnabled} step={0.01} min={-1} max={1} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.contrast')}>
							<Form.Item
								noStyle
								name={['filters', 'contrast', 'enabled']}
								initialValue={!!filters[6]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									C
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.contrast')}
							name={['filters', 'contrast', 'contrast']}
							initialValue={filters[6] ? filters[6].contrast : 0}
						>
							<Slider disabled={!contrastEnabled} step={0.01} min={-1} max={1} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.saturation')}>
							<Form.Item
								noStyle
								name={['filters', 'saturation', 'enabled']}
								initialValue={!!filters[7]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									S
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.saturation')}
							name={['filters', 'saturation', 'saturation']}
							initialValue={filters[7] ? filters[7].saturation : 0}
						>
							<Slider disabled={!saturationEnabled} step={0.01} min={-1} max={1} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.hue')}>
							<Form.Item
								noStyle
								name={['filters', 'hue', 'enabled']}
								initialValue={!!filters[21]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									H
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.hue')}
							name={['filters', 'hue', 'rotation']}
							initialValue={filters[21] ? filters[21].rotation : 0}
						>
							<Slider disabled={!hueEnabled} step={0.002} min={-2} max={2} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.noise')}>
							<Form.Item
								noStyle
								name={['filters', 'noise', 'enabled']}
								initialValue={!!filters[8]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									N
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.noise')}
							name={['filters', 'noise', 'noise']}
							initialValue={filters[8] ? filters[8].noise : 100}
						>
							<Slider disabled={!noiseEnabled} step={1} min={0} max={1000} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.pixelate')}>
							<Form.Item
								noStyle
								name={['filters', 'pixelate', 'enabled']}
								initialValue={!!filters[10]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									P
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.pixelate')}
							name={['filters', 'pixelate', 'blocksize']}
							initialValue={filters[10] ? filters[10].blocksize : 4}
						>
							<Slider disabled={!pixelateEnabled} step={1} min={2} max={20} />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={24} lg={6}>
						<Form.Item label={i18next.t('imagemap.filter.blur')}>
							<Form.Item
								noStyle
								name={['filters', 'blur', 'enabled']}
								initialValue={!!filters[11]}
								valuePropName="checked"
							>
								<Tag.CheckableTag checked={false} className="rde-action-tag">
									B
								</Tag.CheckableTag>
							</Form.Item>
						</Form.Item>
					</Col>
					<Col md={24} lg={18}>
						<Form.Item
							label={i18next.t('imagemap.filter.blur')}
							name={['filters', 'blur', 'value']}
							initialValue={filters[11] ? filters[11].value : 0.1}
						>
							<Slider disabled={!blurEnabled} step={0.01} min={0} max={1} />
						</Form.Item>
					</Col>
				</Row>
			</Row>
		);
	},
};
