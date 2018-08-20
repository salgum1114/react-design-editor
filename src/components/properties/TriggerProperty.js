import React from 'react';
import { Form, Switch } from 'antd';
import CodeModal from '../common/CodeModal';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Enabled" colon={false}>
                    {
                        getFieldDecorator('trigger.enabled', {
                            rules: [{
                                type: 'boolean',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.trigger.enabled,
                        })(
                            <Switch />,
                        )
                    }
                </Form.Item>
                <Form.Item style={{ display: data.trigger.enabled ? 'block' : 'none' }}>
                    {
                        getFieldDecorator('trigger.code', {
                            initialValue: data.trigger.code || 'return null;',
                        })(
                            <CodeModal form={form} />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
