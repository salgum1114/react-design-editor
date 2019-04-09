import React from 'react';
import { Form } from 'antd';

import IconChooser from '../../icon/IconChooser';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item>
                    {
                        getFieldDecorator('icon', {
                            initialValue: data.icon,
                        })(
                            <IconChooser icon={data.icon} />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
