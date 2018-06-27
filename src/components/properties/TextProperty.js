import React from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber, Button, Select } from 'antd';

export default {
    render(form) {
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
                            getFieldDecorator('height', {
                                rules: [{
                                    required: true,
                                    message: 'Please input height',
                                }],
                            })(
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {
                            getFieldDecorator('height', {
                                rules: [{
                                    required: true,
                                    message: 'Please input height',
                                }],
                            })(
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
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
                                <Button shape="circle" />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Line Height" colon={false}>
                        {
                            getFieldDecorator('lineHeight', {
                                rules: [{
                                    // required: false,
                                    // message: 'Please input name',
                                }],
                            })(
                                <Slider />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Char Spacing" colon={false}>
                        {
                            getFieldDecorator('charSpacing', {
                                rules: [{
                                    // required: true,
                                    // message: 'Please input width',
                                }],
                            })(
                                <Slider />,
                            )
                        }
                    </Form.Item>
                </Col>
            </React.Fragment>
        );
    },
};
