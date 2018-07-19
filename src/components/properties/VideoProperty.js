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
        const videoLoadType = data.videoLoadType || 'file';
        return (
            <React.Fragment>
                <Form.Item label="Video Load Type" colon={false}>
                    {
                        getFieldDecorator('videoLoadType', {
                            rules: [{
                                // required: true,
                                // message: 'Please select icon',
                            }],
                            initialValue: videoLoadType,
                        })(
                            <Radio.Group size="large">
                                <Radio.Button value="file">File Upload</Radio.Button>
                                <Radio.Button value="src">Video URL</Radio.Button>
                            </Radio.Group>,
                        )
                    }
                </Form.Item>
                {
                    videoLoadType === 'file' ? (
                        <Form.Item label="File" colon={false}>
                            {
                                getFieldDecorator('file', {
                                    rules: [{
                                        required: true,
                                        message: 'Please select video',
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
