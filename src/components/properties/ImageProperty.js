import React from 'react';
import { Form, Button, Radio, Input } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        const imageLoadType = 'fileUpload';
        return (
            <React.Fragment>
                <Form.Item label="Image Load Type" colon={false}>
                    {
                        getFieldDecorator('imageLoadType', {
                            rules: [{
                                // required: true,
                                // message: 'Please select icon',
                            }],
                            initialValue: 'fileUpload',
                        })(
                            <Radio.Group size="large">
                                <Radio.Button value="fileUpload">File Upload</Radio.Button>
                                <Radio.Button value="imageUrl">Image URL</Radio.Button>
                            </Radio.Group>,
                        )
                    }
                </Form.Item>
                <Form.Item label="Image" colon={false}>
                    {
                        imageLoadType === 'fileUpload' ? getFieldDecorator('image', {
                            rules: [{
                                required: true,
                                message: 'Please select image',
                            }],
                        })(
                            <Button>Choose Local Image</Button>,
                        ) : getFieldDecorator('image', {
                            rules: [{
                                required: true,
                                message: 'Please input image url',
                            }],
                        })(
                            <Input />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
