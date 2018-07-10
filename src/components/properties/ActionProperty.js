import React from 'react';
import { Form, Radio, Select, Switch, Input } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        const actionEnabled = data.action.enabled || false;
        const actionType = data.action.type || 'dashboard';
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
                            initialValue: data.action.enabled || false,
                        })(
                            <Switch />,
                        )
                    }
                </Form.Item>
                {
                    actionEnabled ? (
                        <React.Fragment>
                            <Form.Item label="Action Type" colon={false}>
                                {
                                    getFieldDecorator('action.type', {
                                        rules: [{
                                            // required: true,
                                            // message: 'Please select icon',
                                        }],
                                        initialValue: actionType,
                                    })(
                                        <Radio.Group size="large">
                                            <Radio.Button value="dashboard">Dashboard</Radio.Button>
                                            <Radio.Button value="url">URL</Radio.Button>
                                        </Radio.Group>,
                                    )
                                }
                            </Form.Item>
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
                            {
                                actionType === 'dashboard' ? (
                                    <Form.Item label="Dashboard Select" colon={false}>
                                        {
                                            getFieldDecorator('action.dashboard', {
                                                rules: [{
                                                    required: true,
                                                    message: 'Please select dashboard',
                                                }],
                                                initialValue: data.action.dashboard || '1',
                                            })(
                                                <Select>
                                                    <Select.Option value="1">Dashboard#1</Select.Option>
                                                    <Select.Option value="2">Dashboard#2</Select.Option>
                                                </Select>,
                                            )
                                        }
                                    </Form.Item>
                                ) : (
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
                                )
                            }
                        </React.Fragment>
                    ) : null
                }
            </React.Fragment>
        );
    },
};
