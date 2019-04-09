import React from 'react';
import { Form, Select, Switch, Input } from 'antd';
import i18n from 'i18next';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label={i18n.t('imagemap.link.link-enabled')} colon={false}>
                    {
                        getFieldDecorator('link.enabled', {
                            rules: [{
                                required: true,
                                message: i18n.t('validation.enter-property', { arg: i18n.t('imagemap.marker.link-enabled') }),
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
                            <Form.Item label={i18n.t('common.state')} colon={false}>
                                {
                                    getFieldDecorator('link.state', {
                                        initialValue: data.link.state || 'current',
                                    })(
                                        <Select>
                                            <Select.Option value="current">{i18n.t('common.current')}</Select.Option>
                                            <Select.Option value="new">{i18n.t('common.new')}</Select.Option>
                                        </Select>,
                                    )
                                }
                            </Form.Item>
                            <Form.Item label={i18n.t('common.url')} colon={false}>
                                {
                                    getFieldDecorator('link.url', {
                                        rules: [{
                                            required: true,
                                            message: i18n.t('validation.enter-property', { arg: i18n.t('common.url') }),
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
