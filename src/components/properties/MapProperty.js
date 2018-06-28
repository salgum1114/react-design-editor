import React from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber } from 'antd';

export default {
    render(form) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Responsive" colon={false}>
                    {
                        getFieldDecorator('responsive', {
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
                <Form.Item label="Name" colon={false}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: false,
                                message: 'Please input name',
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
                <Form.Item label="Rotation" colon={false}>
                    {
                        getFieldDecorator('rotation', {
                            rules: [{
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
