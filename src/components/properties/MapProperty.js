import React from 'react';
import { Form, Input, Slider, Switch, Row, Col, InputNumber } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        return (
            <React.Fragment>
                <Form.Item label="Name" colon={false}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: false,
                                message: 'Please input name',
                            }],
                            initialValue: data.name || '',
                        })(
                            <Input />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Responsive" colon={false}>
                    {
                        getFieldDecorator('responsive', {
                            rules: [{
                                type: 'boolean',
                                // required: true,
                                // message: 'Please input rotation',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.responsive,
                        })(
                            <Switch />,
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
                                    initialValue: data.width * data.scaleX,
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
                                    initialValue: data.height * data.scaleY,
                                })(
                                    <InputNumber />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Rotation" colon={false}>
                    {
                        getFieldDecorator('angle', {
                            rules: [{
                                required: true,
                                message: 'Please input rotation',
                            }],
                            initialValue: data.angle,
                        })(
                            <Slider min={0} max={360} />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
