import React from 'react';
import { Form, Radio, Row, Col, Switch } from 'antd';
import UrlModal from '../common/UrlModal';
import FileUpload from '../common/FileUpload';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        const videoLoadType = data.videoLoadType || 'file';
        return (
            <React.Fragment>
                <Row>
                    <Col span={8}>
                        <Form.Item label="Auto Play" colon={false}>
                            {
                                getFieldDecorator('autoplay', {
                                    rules: [{
                                        type: 'boolean',
                                        // required: true,
                                        // message: 'Please input rotation',
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: data.autoplay,
                                })(
                                    <Switch />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Muted" colon={false}>
                            {
                                getFieldDecorator('muted', {
                                    rules: [{
                                        type: 'boolean',
                                        // required: true,
                                        // message: 'Please input rotation',
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: data.muted,
                                })(
                                    <Switch />,
                                )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Loop" colon={false}>
                            {
                                getFieldDecorator('loop', {
                                    rules: [{
                                        type: 'boolean',
                                        // required: true,
                                        // message: 'Please input rotation',
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: data.loop,
                                })(
                                    <Switch />,
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
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
