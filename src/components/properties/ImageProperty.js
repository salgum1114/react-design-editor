import React from 'react';
import { Form, Radio } from 'antd';
import UrlModal from '../UrlModal';
import ImageUpload from '../ImageUpload';

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
                        <Form.Item label="File" colon={false}>
                            {
                                getFieldDecorator('file', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select image',
                                    }],
                                    initialValue: data.file || '',
                                })(
                                    <ImageUpload fileList={data.file ? [data.file] : []} />,
                                )
                            }
                        </Form.Item>
                    ) : (
                        <Form.Item>
                            {
                                getFieldDecorator('imageUrl', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select image',
                                    }],
                                    initialValue: data.imageUrl || '',
                                })(
                                    <UrlModal form={form} url={data.imageUrl} />,
                                )
                            }
                        </Form.Item>
                    )
                }
            </React.Fragment>
        );
    },
};
