import React from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber, Row } from 'antd';

export default {
    render(form) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Row>
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
                                    <Switch defaultChecked />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
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
                <Row>
                    <Col span={12}>
                        <Form.Item label="Width" colon={false}>
                            {
                                getFieldDecorator('width', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input width',
                                    }],
                                    initialValue: 0,
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
                                    initialValue: 0,
                                })(
                                    <InputNumber />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item label="X" colon={false}>
                            {
                                getFieldDecorator('left', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input x position',
                                    }],
                                    initialValue: 0,
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
                                    initialValue: 0,
                                })(
                                    <InputNumber />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Rotation" colon={false}>
                    {
                        getFieldDecorator('rotation', {
                            rules: [{
                                type: 'number',
                                required: true,
                                message: 'Please input rotation',
                            }],
                            initialValue: 0,
                        })(
                            <Slider />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
