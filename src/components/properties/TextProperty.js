import React from 'react';
import { Form, Slider, Col, Button, Select } from 'antd';
import Icon from 'polestar-icons';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Col span={16}>
                    <Form.Item label="Font Family" colon={false}>
                        {
                            getFieldDecorator('fontFamily', {
                                rules: [{
                                    // required: true,
                                    // message: 'Please input rotation',
                                }],
                                initialValue: 'default',
                            })(
                                <Select>
                                    <Select.Option value="default">default</Select.Option>
                                </Select>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Font Size" colon={false}>
                        {
                            getFieldDecorator('fontSize', {
                                rules: [{
                                    // required: true,
                                    // message: 'Please input rotation',
                                }],
                                initialValue: '60',
                            })(
                                <Select>
                                    <Select.Option value="60">60</Select.Option>
                                </Select>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('fontWeight', {
                                rules: [{
                                    required: true,
                                    message: 'Please input height',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="bold" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('fontStyle', {
                                rules: [{
                                    required: true,
                                    message: 'Please input rotation',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="italic" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('linethrough', {
                                rules: [{
                                    required: true,
                                    message: 'Please input x position',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="strikethrough" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('underline', {
                                rules: [{
                                    required: true,
                                    message: 'Please input y position',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="underline" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('left', {
                                rules: [{
                                    required: true,
                                    message: 'Please input height',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="align-left" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('left', {
                                rules: [{
                                    required: true,
                                    message: 'Please input x position',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="align-center" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('top', {
                                rules: [{
                                    required: true,
                                    message: 'Please input y position',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="align-right" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('rotation', {
                                rules: [{
                                    required: true,
                                    message: 'Please input rotation',
                                }],
                            })(
                                <Button shape="circle">
                                    <Icon name="align-justify" />
                                </Button>,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Line Height" colon={false}>
                        {
                            getFieldDecorator('lineHeight', {
                                rules: [{
                                    type: 'number',
                                    // required: false,
                                    // message: 'Please input name',
                                }],
                                initialValue: data.lineHeight,
                            })(
                                <Slider min={0} max={100} />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Char Spacing" colon={false}>
                        {
                            getFieldDecorator('charSpacing', {
                                rules: [{
                                    type: 'number',
                                    // required: true,
                                    // message: 'Please input width',
                                }],
                                initialValue: data.charSpacing,
                            })(
                                <Slider min={0} max={100} />,
                            )
                        }
                    </Form.Item>
                </Col>
            </React.Fragment>
        );
    },
};
