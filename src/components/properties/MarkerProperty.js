import React from 'react';
import { Form, Button, Switch } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Icon" colon={false}>
                    {
                        getFieldDecorator('icon', {
                            rules: [{
                                required: true,
                                message: 'Please select icon',
                            }],
                        })(
                            <Button>Choose Icon from Library</Button>,
                        )
                    }
                </Form.Item>
                <Form.Item label="Icon Shadow" colon={false}>
                    {
                        getFieldDecorator('iconShadow', {
                            rules: [{
                                type: 'boolean',
                                required: true,
                                message: 'Please select icon',
                            }],
                        })(
                            <Switch />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
