import React from 'react';
import { Form, Switch } from 'antd';
import i18n from 'i18next';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        return (
            <Form.Item label={i18n.t('imagemap.tooltip.tooltip-enabled')} colon={false}>
                {
                    getFieldDecorator('tooltip.enabled', {
                        rules: [
                            { type: 'boolean' },
                        ],
                        valuePropName: 'checked',
                        initialValue: data.tooltip.enabled,
                    })(
                        <Switch size="small" />,
                    )
                }
            </Form.Item>
        );
    },
};
