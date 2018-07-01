import React from 'react';
import { Form, Switch, Select } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Enable Tooltip" colon={false}>
                    {
                        getFieldDecorator('enabled', {
                            rules: [{
                                type: 'boolean',
                                // required: true,
                                // message: 'Please input rotation',
                            }],
                        })(
                            <Switch defaultChecked />,
                        )
                    }
                </Form.Item>
                <Form.Item label="Show Tooltips on" colon={false}>
                    {
                        getFieldDecorator('showTooltipsOn', {
                            rules: [{
                                // required: true,
                                // message: 'Please input rotation',
                            }],
                            initialValue: 'mouseover',
                        })(
                            <Select>
                                <Select.Option value="mouseover">Mouseover</Select.Option>
                                <Select.Option value="click">Click</Select.Option>
                            </Select>,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
