import React from 'react';
import { Form, Switch } from 'antd';
import i18n from 'i18next';

import CodeModal from '../../common/CodeModal';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label={i18n.t('imagemap.trigger.trigger-enabled')} colon={false}>
                    {
                        getFieldDecorator('trigger.enabled', {
                            rules: [{
                                type: 'boolean',
                            }],
                            valuePropName: 'checked',
                            initialValue: data.trigger.enabled,
                        })(
                            <Switch size="small" />,
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
