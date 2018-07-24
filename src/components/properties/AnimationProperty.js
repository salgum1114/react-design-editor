import React from 'react';
import { Row, Col, Form, Button, Select, Switch, Radio, InputNumber } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const type = data.animation.type || 'none';
        console.log(type, data);
        return (
            <React.Fragment>
                <Form.Item label="Animation Type" colon={false}>
                    {
                        getFieldDecorator('animation.type', {
                            initialValue: type,
                        })(
                            <Select>
                                <Select.Option value="none">None</Select.Option>
                                <Select.Option value="fade">Fade</Select.Option>
                                <Select.Option value="bounce">Bounce</Select.Option>
                                <Select.Option value="shake">Shake</Select.Option>
                                <Select.Option value="scaling">Scaling</Select.Option>
                                <Select.Option value="rotation">Rotation</Select.Option>
                                <Select.Option value="flash">Flash</Select.Option>
                            </Select>,
                        )
                    }
                </Form.Item>
                {
                    type === 'none' ? null : (
                        <React.Fragment>
                            <Row>
                                <Col span={12}>
                                    <Form.Item label="Auto Play" colon={false}>
                                        {
                                            getFieldDecorator('animation.autoplay', {
                                                rules: [{
                                                    type: 'boolean',
                                                }],
                                                valuePropName: 'checked',
                                                initialValue: data.animation.autoplay || false,
                                            })(
                                                <Switch />,
                                            )
                                        }
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Loop" colon={false}>
                                        {
                                            getFieldDecorator('animation.loop', {
                                                rules: [{
                                                    type: 'boolean',
                                                }],
                                                valuePropName: 'checked',
                                                initialValue: data.animation.loop || false,
                                            })(
                                                <Switch />,
                                            )
                                        }
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item label="Delay" colon={false}>
                                        {
                                            getFieldDecorator('animation.delay', {
                                                rules: [{
                                                    type: 'number',
                                                    min: 100,
                                                    max: 5000,
                                                }],
                                                initialValue: data.animation.delay || 100,
                                            })(
                                                <InputNumber min={100} max={5000} />,
                                            )
                                        }
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Value" colon={false}>
                                        {
                                            getFieldDecorator('animation.value', {
                                                rules: [{
                                                    type: 'number',
                                                    min: 1,
                                                    max: 10,
                                                }],
                                                initialValue: data.animation.value || 1,
                                            })(
                                                <InputNumber min={1} max={10} />,
                                            )
                                        }
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Playback" colon={false}>
                                <Row>
                                    <Col span={8}>
                                        <Button onClick={() => { canvasRef.current.animationHandlers.play(data.id); }}>Start</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Button onClick={() => { canvasRef.current.animationHandlers.pause(data.id); }}>Pause</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Button onClick={() => { canvasRef.current.animationHandlers.stop(data.id); }}>Stop</Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </React.Fragment>
                    )
                }
            </React.Fragment>
        );
    },
};
