import React from 'react';
import { Form, Radio } from 'antd';
import UrlModal from '../UrlModal';
import FileUpload from '../FileUpload';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const imageLoadType = data.imageLoadType || 'file';
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
                                <Radio.Button value="file">File Upload</Radio.Button>
                                <Radio.Button value="src">Image URL</Radio.Button>
                            </Radio.Group>,
                        )
                    }
                </Form.Item>
                {
                    imageLoadType === 'file' ? (
                        <Form.Item label="File" colon={false}>
                            {
                                getFieldDecorator('file', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select image',
                                    }],
                                    initialValue: data.file,
                                })(
                                    // <FileUpload fileList={data.file ? [data.file] : []} />,
                                    <FileUpload />,
                                )
                            }
                        </Form.Item>
                    ) : (
                        <Form.Item>
                            {
                                getFieldDecorator('src', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select image',
                                    }],
                                    initialValue: data.src,
                                })(
                                    <UrlModal form={form} />,
                                )
                            }
                        </Form.Item>
                    )
                }
            </React.Fragment>
        );
    },
};
