import React from 'react';
import { Form, Slider, Popover, Button, Select, Col, Row } from 'antd';
import { SketchPicker } from 'react-color';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Fill Color" colon={false}>
                    {
                        getFieldDecorator('fillColor', {
                            rules: [{
                                // required: true,
                                // message: 'Please select fill color',
                            }],
                        })(
                            <Popover
                                trigger="click"
                                placement="bottom"
                                content={<SketchPicker />}
                            >
                                <Button shape="circle" />
                            </Popover>,
                        )
                    }
                </Form.Item>
                <Form.Item label="Fill Opacity" colon={false}>
                    {
                        getFieldDecorator('fillOpacity', {
                            rules: [{
                                type: 'number',
                                // required: true,
                                // message: 'Please input fill opacity',
                            }],
                            initialValue: 0,
                        })(
                            <Slider />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Stroke Color" colon={false}>
                    {
                        getFieldDecorator('storke', {
                            rules: [{
                                // required: true,
                                // message: 'Please select fill color',
                            }],
                        })(
                            <Popover
                                trigger="click"
                                placement="bottom"
                                content={<SketchPicker />}
                            >
                                <Button shape="circle" />
                            </Popover>,
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
