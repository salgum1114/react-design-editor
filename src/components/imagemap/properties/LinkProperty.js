import React from 'react';
import { Form, Select, Switch, Input } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Link Enabled" colon={false}>
                    {
                        getFieldDecorator('link.enabled', {
                            rules: [{
                                required: true,
                                message: 'Please select enabled',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.link.enabled,
                        })(
                            <Switch size="small" />,
                        )
                    }
                </Form.Item>
                {
                    data.link.enabled ? (
                        <React.Fragment>
                            <Form.Item label="State" colon={false}>
                                {
                                    getFieldDecorator('link.state', {
                                        initialValue: data.link.state || 'current',
                                    })(
                                        <Select>
                                            <Select.Option value="current">Current</Select.Option>
                                            <Select.Option value="new">New</Select.Option>
                                        </Select>,
                                    )
                                }
                            </Form.Item>
                            <Form.Item label="URL" colon={false}>
                                {
                                    getFieldDecorator('link.url', {
                                        rules: [{
                                            required: true,
                                            message: 'Please input url',
                                        }],
                                        initialValue: data.link.url || '',
                                    })(
                                        <Input />,
                                    )
                                }
                            </Form.Item>
                        </React.Fragment>
                    ) : null
                }
            </React.Fragment>
        );
    },
};
