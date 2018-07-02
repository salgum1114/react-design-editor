import React from 'react';
import { Form, Slider, Select, Col, Row } from 'antd';
import ColorPicker from '../ColorPicker';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Fill Color" colon={false}>
                    {
                        getFieldDecorator('fill', {
                            rules: [{
                                type: 'hex',
                                // required: true,
                                // message: 'Please select fill color',
                            }],
                            initialValue: data.fill,
                        })(
                            <ColorPicker />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Fill Opacity" colon={false}>
                    {
                        getFieldDecorator('opacity', {
                            rules: [{
                                type: 'number',
                                // required: true,
                                // message: 'Please input fill opacity',
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
                        getFieldDecorator('storke', {
                            rules: [{
                                type: 'hex',
                                // required: true,
                                // message: 'Please select fill color',
                            }],
                            initialValue: data.fill,
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
                                    rules: [{
                                        // required: true,
                                        // message: 'Please input fill opacity',
                                    }],
                                    initialValue: '12',
                                })(
                                    <Select>
                                        <Select.Option value="12">12</Select.Option>
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
