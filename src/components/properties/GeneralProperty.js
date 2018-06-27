import React from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber } from 'antd';

export default {
    render(form) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Col span={12}>
                    <Form.Item label="Lock" colon={false}>
                        {
                            getFieldDecorator('lock', {
                                rules: [{
                                    type: 'boolean',
                                    // required: true,
                                    // message: 'Please input rotation',
                                }],
                            })(
                                <Switch />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Visible" colon={false}>
                        {
                            getFieldDecorator('visible', {
                                rules: [{
                                    type: 'boolean',
                                    // required: true,
                                    // message: 'Please input rotation',
                                }],
                            })(
                                <Switch />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Form.Item label="Name" colon={false}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                // required: false,
                                // message: 'Please input name',
                            }],
                        })(
                            <Input />,
                        )
                    }
                </Form.Item>
                <Col span={12}>
                    <Form.Item label="Width" colon={false}>
                        {
                            getFieldDecorator('width', {
                                rules: [{
                                    required: true,
                                    message: 'Please input width',
                                }],
                            })(
                                <InputNumber />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Height" colon={false}>
                        {
                            getFieldDecorator('height', {
                                rules: [{
                                    required: true,
                                    message: 'Please input height',
                                }],
                            })(
                                <InputNumber />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="X" colon={false}>
                        {
                            getFieldDecorator('left', {
                                rules: [{
                                    required: true,
                                    message: 'Please input x position',
                                }],
                            })(
                                <InputNumber />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Y" colon={false}>
                        {
                            getFieldDecorator('top', {
                                rules: [{
                                    required: true,
                                    message: 'Please input y position',
                                }],
                            })(
                                <InputNumber />,
                            )
                        }
                    </Form.Item>
                </Col>
                <Form.Item label="Rotation" colon={false}>
                    {
                        getFieldDecorator('rotation', {
                            rules: [{
                                required: true,
                                message: 'Please input rotation',
                            }],
                        })(
                            <Slider />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
