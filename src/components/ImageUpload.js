import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon } from 'antd';

const { Dragger } = Upload;

class ImageUpload extends Component {
    static propTypes = {
        fileList: PropTypes.array,
    }

    static defaultProps = {
        fileList: [],
    }

    state = {
        fileList: this.props.fileList,
    }

    render() {
        const props = {
            name: 'file',
            multiple: false,
            onChange: (info) => {
                const { onChange } = this.props;
                onChange(info.file);
            },
            onRemove: (file) => {
                this.setState(({ fileList }) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                this.setState(() => ({
                    fileList: [file],
                }));
                return false;
            },
            fileList: this.state.fileList,
        };
        return (
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
            </Dragger>
        );
    }
}

export default ImageUpload;
