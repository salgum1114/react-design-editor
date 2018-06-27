import React from 'react';
import { Form, Slider, Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';

export default {
    render(form) {
        const { getFieldDecorator } = form;
        return (
            <React.Fragment>
                <Form.Item label="Fill Color" colon={false}>
                    {
                        getFieldDecorator('fillColor', {
                            rules: [{
                                // required: true,
                                // message: 'Please select fill color',
                            }],
                        })(
                            <Popover
                                trigger="click"
                                placement="bottom"
                                content={<SketchPicker />}
                            >
                                <Button shape="circle" />
                            </Popover>,
                        )
                    }
                </Form.Item>
                <Form.Item label="Fill Opacity" colon={false}>
                    {
                        getFieldDecorator('fillOpacity', {
                            rules: [{
                                // required: true,
                                // message: 'Please input fill opacity',
                            }],
                        })(
                            <Slider />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
