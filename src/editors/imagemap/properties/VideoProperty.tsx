import React from 'react';
import { Col, Form, Radio, Row, Switch } from 'antd';

import FileUpload from '../../../components/common/FileUpload';
import UrlModal from '../../../components/common/UrlModal';

type VideoData = {
	autoplay?: boolean;
	muted?: boolean;
	loop?: boolean;
	videoLoadType?: 'file' | 'src';
	file?: File | null;
	src?: string;
};

export default {
	render(_canvasRef: unknown, form: any, data?: VideoData) {
		if (!data) {
			return null;
		}

		const videoLoadType = Form.useWatch('videoLoadType', form) || data.videoLoadType || 'file';

		return (
			<React.Fragment>
				<Row>
					<Col span={8}>
						<Form.Item
							label="Auto Play"
							colon={false}
							name="autoplay"
							initialValue={data.autoplay}
							rules={[{ type: 'boolean' }]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label="Muted"
							colon={false}
							name="muted"
							initialValue={data.muted}
							rules={[{ type: 'boolean' }]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label="Loop"
							colon={false}
							name="loop"
							initialValue={data.loop}
							rules={[{ type: 'boolean' }]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item label="Video Load Type" colon={false} name="videoLoadType" initialValue={videoLoadType}>
					<Radio.Group size="large">
						<Radio.Button value="file">File Upload</Radio.Button>
						<Radio.Button value="src">Video URL</Radio.Button>
					</Radio.Group>
				</Form.Item>
				{videoLoadType === 'file' ? (
					<Form.Item
						label="File"
						colon={false}
						name="file"
						initialValue={data.file}
						rules={[{ required: true, message: 'Please select video' }]}
					>
						<FileUpload accept="video/*" />
					</Form.Item>
				) : (
					<Form.Item name="src" initialValue={data.src} rules={[{ required: true, message: 'Please select image' }]}>
						<UrlModal />
					</Form.Item>
				)}
			</React.Fragment>
		);
	},
};