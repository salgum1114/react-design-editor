import React from 'react';
import { Form, Select, Switch, Input } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Action Enabled" colon={false}>
                    {
                        getFieldDecorator('action.enabled', {
                            rules: [{
                                required: true,
                                message: 'Please select enabled',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.action.enabled,
                        })(
                            <Switch />,
                        )
                    }
                </Form.Item>
                {
                    data.action.enabled ? (
                        <React.Fragment>
                            <Form.Item label="State" colon={false}>
                                {
                                    getFieldDecorator('action.state', {
                                        initialValue: data.action.state || 'current',
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
                                    getFieldDecorator('action.url', {
                                        rules: [{
                                            required: true,
                                            message: 'Please input url',
                                        }],
                                        initialValue: data.action.url || '',
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
