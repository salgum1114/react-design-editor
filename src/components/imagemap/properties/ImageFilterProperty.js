import React from 'react';
import { Row, Col, Form, Tag, Slider } from 'antd';
import i18n from 'i18next';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        const { filters } = data;
        console.log(filters);
        return (
            <Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.grayscale')}>
                            {
                                getFieldDecorator('filters.grayscale', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[0],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'G'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.invert')}>
                            {
                                getFieldDecorator('filters.invert', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[1],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'I'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.sepia')}>
                            {
                                getFieldDecorator('filters.sepia', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[3],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'S'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.brownie')}>
                            {
                                getFieldDecorator('filters.brownie', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[4],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'B'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.vintage')}>
                            {
                                getFieldDecorator('filters.vintage', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[9],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'V'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.blackwhite')}>
                            {
                                getFieldDecorator('filters.blackwhite', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[19],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'B'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.technicolor')}>
                            {
                                getFieldDecorator('filters.technicolor', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[14],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'T'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.polaroid')}>
                            {
                                getFieldDecorator('filters.polaroid', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[15],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'P'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.gamma')}>
                            {
                                getFieldDecorator('filters.gamma.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[17],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'G'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('color.red')}>
                            {
                                getFieldDecorator('filters.gamma.r', {
                                    initialValue: filters[17] ? filters[17].gamma[0] : 1,
                                })(
                                    <Slider step={0.01} min={0.01} max={2.2} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('color.green')}>
                            {
                                getFieldDecorator('filters.gamma.g', {
                                    initialValue: filters[17] ? filters[17].gamma[1] : 1,
                                })(
                                    <Slider step={0.01} min={0.01} max={2.2} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('color.blue')}>
                            {
                                getFieldDecorator('filters.gamma.b', {
                                    initialValue: filters[17] ? filters[17].gamma[2] : 1,
                                })(
                                    <Slider step={0.01} min={0.01} max={2.2} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.sharpen')}>
                            {
                                getFieldDecorator('filters.sharpen', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[12],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'S'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.emboss')}>
                            {
                                getFieldDecorator('filters.emboss', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[13],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'E'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.brightness')}>
                            {
                                getFieldDecorator('filters.brightness.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[5],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'B'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.brightness')}>
                            {
                                getFieldDecorator('filters.brightness.brightness', {
                                    initialValue: filters[5] ? filters[5].brightness : 0.1,
                                })(
                                    <Slider step={0.01} min={-1} max={1} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.contrast')}>
                            {
                                getFieldDecorator('filters.contrast.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[6],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'C'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.contrast')}>
                            {
                                getFieldDecorator('filters.contrast.contrast', {
                                    initialValue: filters[6] ? filters[6].contrast : 0,
                                })(
                                    <Slider step={0.01} min={-1} max={1} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.saturation')}>
                            {
                                getFieldDecorator('filters.saturation.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[7],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'S'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.saturation')}>
                            {
                                getFieldDecorator('filters.saturation.saturation', {
                                    initialValue: filters[7] ? filters[7].saturation : 0,
                                })(
                                    <Slider step={0.01} min={-1} max={1} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.hue')}>
                            {
                                getFieldDecorator('filters.hue.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[21],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'H'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.hue')}>
                            {
                                getFieldDecorator('filters.hue.rotation', {
                                    initialValue: filters[21] ? filters[21].rotation : 0,
                                })(
                                    <Slider step={0.002} min={-2} max={2} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.noise')}>
                            {
                                getFieldDecorator('filters.noise.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[8],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'N'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.noise')}>
                            {
                                getFieldDecorator('filters.noise.noise', {
                                    initialValue: filters[8] ? filters[8].noise : 100,
                                })(
                                    <Slider step={1} min={0} max={1000} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.pixelate')}>
                            {
                                getFieldDecorator('filters.pixelate.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[10],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'P'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.pixelate')}>
                            {
                                getFieldDecorator('filters.pixelate.blocksize', {
                                    initialValue: filters[10] ? filters[10].blocksize : 4,
                                })(
                                    <Slider step={1} min={2} max={20} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col md={24} lg={6}>
                        <Form.Item label={i18n.t('imagemap.filter.blur')}>
                            {
                                getFieldDecorator('filters.blur.enabled', {
                                    valuePropName: 'checked',
                                    initialValue: !!filters[11],
                                })(
                                    <Tag.CheckableTag className="rde-action-tag">
                                        {'B'}
                                    </Tag.CheckableTag>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col md={24} lg={18}>
                        <Form.Item label={i18n.t('imagemap.filter.blur')}>
                            {
                                getFieldDecorator('filters.blur.value', {
                                    initialValue: filters[11] ? filters[11].value : 0.1,
                                })(
                                    <Slider step={0.01} min={0} max={1} />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
            </Row>
        );
    },
};
