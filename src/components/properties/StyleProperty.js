import React from 'react';
import { Form, Slider, Select, Col, Row } from 'antd';
import ColorPicker from '../ColorPicker';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Fill Color" colon={false}>
                    {
                        getFieldDecorator('fill', {
                            initialValue: data.fill,
                        })(
                            <ColorPicker />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Opacity" colon={false}>
                    {
                        getFieldDecorator('opacity', {
                            rules: [{
                                type: 'number',
                                min: 0,
                                max: 1,
                            }],
                            initialValue: data.opacity,
                        })(
                            <Slider min={0} max={1} step={0.1} />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Stroke Color" colon={false}>
                    {
                        getFieldDecorator('stroke', {
                            initialValue: data.stroke,
                        })(
                            <ColorPicker />,
                        )
                    }
                </Form.Item>
                <Row>
                    <Col span={12}>
                        <Form.Item label="Stroke Width" colon={false}>
                            {
                                getFieldDecorator('strokeWidth', {
                                    initialValue: data.strokeWidth,
                                })(
                                    <Select showSearch>
                                        {
                                            Array.from({ length: 12 }, (v, k) => {
                                                const value = k + 1;
                                                return <Select.Option key={value} value={value}>{value}</Select.Option>
                                            })
                                        }
                                    </Select>,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Stroke Style" colon={false}>
                            {
                                getFieldDecorator('strokeDashArray', {
                                    rules: [{
                                        // required: true,
                                        // message: 'Please input fill opacity',
                                    }],
                                    initialValue: '-----',
                                })(
                                    <Select>
                                        <Select.Option value="-----">------</Select.Option>
                                    </Select>,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
            </React.Fragment>
        );
    },
};
