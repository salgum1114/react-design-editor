import React from 'react';
import { Form, Input, Slider, Col, InputNumber, Row } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Name" colon={false}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                // required: false,
                                // message: 'Please input name',
                            }],
                            initialValue: data.name,
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
                <Row>
                    <Col span={12}>
                        <Form.Item label="Left" colon={false}>
                            {
                                getFieldDecorator('left', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input x position',
                                    }],
                                    initialValue: data.left,
                                })(
                                    <InputNumber />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Top" colon={false}>
                            {
                                getFieldDecorator('top', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input y position',
                                    }],
                                    initialValue: data.top,
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
                                type: 'number',
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
