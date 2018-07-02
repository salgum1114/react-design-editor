import React from 'react';
import { Form, Button, Radio, Input } from 'antd';

export default {
    render(form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const imageLoadType = data.imageLoadType || 'fileUpload';
        return (
            <React.Fragment>
                <Form.Item label="Image Load Type" colon={false}>
                    {
                        getFieldDecorator('imageLoadType', {
                            rules: [{
                                // required: true,
                                // message: 'Please select icon',
                            }],
                            initialValue: imageLoadType,
                        })(
                            <Radio.Group size="large">
                                <Radio.Button value="fileUpload">File Upload</Radio.Button>
                                <Radio.Button value="imageUrl">Image URL</Radio.Button>
                            </Radio.Group>,
                        )
                    }
                </Form.Item>
                {
                    imageLoadType === 'fileUpload' ? (
                        <Form.Item label="Image" colon={false}>
                            {
                                getFieldDecorator('image', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select image',
                                    }],
                                    initialValue: data.image || '',
                                })(
                                    <Button>Choose Local Image</Button>,
                                )
                            }
                        </Form.Item>
                    ) : (
                        <Form.Item label="Image" colon={false}>
                            {
                                getFieldDecorator('image', {
                                    rules: [{
                                        required: true,
                                        message: 'Please input image url',
                                    }],
                                    initialValue: data.image || '',
                                })(
                                    <Input />,
                                )
                            }
                        </Form.Item>
                    )
                }
            </React.Fragment>
        );
    },
};
