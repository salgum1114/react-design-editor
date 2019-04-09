import React from 'react';
import { Form, Slider, Select } from 'antd';
import i18n from 'i18next';

import ColorPicker from '../../common/ColorPicker';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label={i18n.t('imagemap.style.fill-color')} colon={false}>
                    {
                        getFieldDecorator('fill', {
                            initialValue: data.fill || 'rgba(0, 0, 0, 1)',
                        })(
                            <ColorPicker />,
                        )
                    }
                </Form.Item>
                <Form.Item label={i18n.t('common.opacity')} colon={false}>
                    {
                        getFieldDecorator('opacity', {
                            rules: [{
                                type: 'number',
                                min: 0,
                                max: 1,
                            }],
                            initialValue: data.opacity || 1,
                        })(
                            <Slider min={0} max={1} step={0.1} />,
                        )
                    }
                </Form.Item>
                <Form.Item label={i18n.t('imagemap.style.stroke-color')} colon={false}>
                    {
                        getFieldDecorator('stroke', {
                            initialValue: data.stroke || 'rgba(255, 255, 255, 0)',
                        })(
                            <ColorPicker />,
                        )
                    }
                </Form.Item>
                <Form.Item label={i18n.t('imagemap.style.stroke-width')} colon={false}>
                    {
                        getFieldDecorator('strokeWidth', {
                            initialValue: data.strokeWidth || 1,
                        })(
                            <Select showSearch style={{ width: '100%' }}>
                                {
                                    Array.from({ length: 12 }, (v, k) => {
                                        const value = k + 1;
                                        return <Select.Option key={value} value={value}>{value}</Select.Option>;
                                    })
                                }
                            </Select>,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
