import React from 'react';
import { Form, Input, Radio, Row, Col, InputNumber } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const layout = data.layout || 'fixed';
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
                <Form.Item label="Layout" colon={false}>
                    {
                        getFieldDecorator('layout', {
                            initialValue: layout,
                        })(
                            <Radio.Group size="small">
                                <Radio.Button value="fixed">Fixed</Radio.Button>
                                <Radio.Button value="responsive">Responsive</Radio.Button>
                                <Radio.Button value="fullscreen">FullScreen</Radio.Button>
                            </Radio.Group>,
                        )
                    }
                </Form.Item>
                {
                    layout === 'fixed' ? (
                        <React.Fragment>
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
                        </React.Fragment>
                    ) : null
                }
            </React.Fragment>
        );
    },
};
