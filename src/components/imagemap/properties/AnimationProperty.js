import React from 'react';
import { Row, Col, Form, Button, Select, Switch, Slider, InputNumber } from 'antd';
import ColorPicker from '../../common/ColorPicker';
import Icon from '../../icon/Icon';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const type = data.animation.type || 'none';
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
                                                initialValue: data.animation.autoplay,
                                            })(
                                                <Switch size="small" />,
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
                                                initialValue: data.animation.loop,
                                            })(
                                                <Switch size="small" />,
                                            )
                                        }
                                    </Form.Item>
                                </Col>
                            </Row>
                            {
                                type !== 'shake' ? (
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
                                                        initialValue: data.animation.delay,
                                                    })(
                                                        <Slider min={100} max={5000} step={100} />,
                                                    )
                                                }
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Duration" colon={false}>
                                                {
                                                    getFieldDecorator('animation.duration', {
                                                        rules: [{
                                                            type: 'number',
                                                            min: 100,
                                                            max: 5000,
                                                        }],
                                                        initialValue: data.animation.duration,
                                                    })(
                                                        <Slider min={100} max={5000} step={100} />,
                                                    )
                                                }
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ) : null
                            }
                            {this.getComponentType(type, data, getFieldDecorator)}
                            <Form.Item label="Playback" colon={false}>
                                <Row>
                                    <Col span={8}>
                                        <Button size="small" onClick={() => { canvasRef.animationHandlers.play(data.id); }}>
                                            <Icon name="play" style={{ marginRight: 8 }} />
                                            {'Start'}
                                        </Button>
                                    </Col>
                                    <Col span={8}>
                                        <Button size="small" onClick={() => { canvasRef.animationHandlers.pause(data.id); }}>
                                            <Icon name="pause" style={{ marginRight: 8 }} />
                                            {'Pause'}
                                        </Button>
                                    </Col>
                                    <Col span={8}>
                                        <Button size="small" onClick={() => { canvasRef.animationHandlers.stop(data.id); }}>
                                            <Icon name="stop" style={{ marginRight: 8 }} />
                                            {'Stop'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </React.Fragment>
                    )
                }
            </React.Fragment>
        );
    },
    getComponentType(type, data, getFieldDecorator) {
        let component;
        if (type === 'fade') {
            component = (
                <Form.Item label="Opacity" colon={false}>
                    {
                        getFieldDecorator('animation.opacity', {
                            rules: [{
                                type: 'number',
                                min: 0,
                                max: 1,
                            }],
                            initialValue: data.animation.opacity || 0,
                        })(
                            <Slider min={0} max={1} step={0.1} />,
                        )
                    }
                </Form.Item>
            );
        } else if (type === 'bounce') {
            component = (
                <React.Fragment>
                    <Form.Item label="Bounce Type" colon={false}>
                        {
                            getFieldDecorator('animation.bounce', {
                                initialValue: data.animation.bounce || 'hotizontal',
                            })(
                                <Select>
                                    <Select.Option value="hotizontal">Horizontal</Select.Option>
                                    <Select.Option value="vertical">Vertical</Select.Option>
                                </Select>,
                            )
                        }
                    </Form.Item>
                    <Form.Item label="Offset" colon={false}>
                        {
                            getFieldDecorator('animation.offset', {
                                rules: [{
                                    type: 'number',
                                    min: 1,
                                    max: 10,
                                }],
                                initialValue: data.animation.offset || 1,
                            })(
                                <Slider min={1} max={10} step={1} />,
                            )
                        }
                    </Form.Item>
                </React.Fragment>
            );
        } else if (type === 'shake') {
            component = (
                <React.Fragment>
                    <Form.Item label="Shake Type" colon={false}>
                        {
                            getFieldDecorator('animation.shake', {
                                initialValue: data.animation.shake || 'hotizontal',
                            })(
                                <Select>
                                    <Select.Option value="hotizontal">Horizontal</Select.Option>
                                    <Select.Option value="vertical">Vertical</Select.Option>
                                </Select>,
                            )
                        }
                    </Form.Item>
                    <Form.Item label="Offset" colon={false}>
                        {
                            getFieldDecorator('animation.offset', {
                                rules: [{
                                    type: 'number',
                                    min: 1,
                                    max: 10,
                                }],
                                initialValue: data.animation.offset || 1,
                            })(
                                <Slider min={1} max={10} step={1} />,
                            )
                        }
                    </Form.Item>
                </React.Fragment>
            );
        } else if (type === 'scaling') {
            component = (
                <Form.Item label="Scaling" colon={false}>
                    {
                        getFieldDecorator('animation.scale', {
                            rules: [{
                                type: 'number',
                                min: 1,
                                max: 5,
                            }],
                            initialValue: data.animation.scale || 1,
                        })(
                            <Slider min={1} max={5} step={0.1} />,
                        )
                    }
                </Form.Item>
            );
        } else if (type === 'rotation') {
            component = (
                <Form.Item label="Angle" colon={false}>
                    {
                        getFieldDecorator('animation.angle', {
                            rules: [{
                                type: 'number',
                                min: 0,
                                max: 360,
                            }],
                            initialValue: data.animation.angle || data.angle,
                        })(
                            <Slider min={0} max={360} />,
                        )
                    }
                </Form.Item>
            );
        } else if (type === 'flash') {
            component = (
                <Row>
                    <Col span={12}>
                        <Form.Item label="Fill Color" colon={false}>
                            {
                                getFieldDecorator('animation.fill', {
                                    initialValue: data.animation.fill || data.fill,
                                })(
                                    <ColorPicker />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Stroke Color" colon={false}>
                            {
                                getFieldDecorator('animation.stroke', {
                                    initialValue: data.animation.stroke || data.stroke,
                                })(
                                    <ColorPicker />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
            );
        } else {
            component = (
                <Row>
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
            );
        }
        return component;
    },
};
