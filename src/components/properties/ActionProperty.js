import React from 'react';
import { Form, Radio, Select, Switch, Input } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        const actionType = data.actionType || 'dashboard';
        return (
            <React.Fragment>
                <Form.Item label="Action Enabled" colon={false}>
                    {
                        getFieldDecorator('enabled', {
                            rules: [{
                                required: true,
                                message: 'Please select enabled',
                            }],
                        })(
                            <Switch defaultChecked />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Action Type" colon={false}>
                    {
                        getFieldDecorator('actionType', {
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
                {
                    actionType === 'dashboard' ? (
                        <Form.Item label="Dashboard Select" colon={false}>
                            {
                                getFieldDecorator('dashboard', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select dashboard',
                                    }],
                                    initialValue: data.map || '1',
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
                                getFieldDecorator('url', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input url',
                                    }],
                                    initialValue: data.url || '',
                                })(
                                    <Input />,
                                )
                            }
                        </Form.Item>
                    )
                }
            </React.Fragment>
        );
    },
};
