import React from 'react';
import { Form } from 'antd';
import UrlModal from '../common/UrlModal';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item>
                    {
                        getFieldDecorator('code', {
                            rules: [{
                                required: true,
                                message: 'Please select image',
                            }],
                            initialValue: data.code,
                        })(
                            <UrlModal form={form} />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
