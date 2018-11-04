import React from 'react';
import { Form, Switch, Select } from 'antd';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        return (
            <React.Fragment>
                <Form.Item label="Enable Tooltip" colon={false}>
                    {
                        getFieldDecorator('tooltip.enabled', {
                            rules: [{
                                type: 'boolean',
                                // required: true,
                                // message: 'Please input rotation',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.tooltip.enabled,
                        })(
                            <Switch />,
                        )
                    }
                </Form.Item>
                {/* <Form.Item label="Show Tooltips on" colon={false}>
                    {
                        getFieldDecorator('tooltip.showTooltipsOn', {
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
                </Form.Item> */}
            </React.Fragment>
        );
    },
};
