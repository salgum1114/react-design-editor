import React, { Component } from 'react';
import { Upload, Icon } from 'antd';

const { Dragger } = Upload;

class FileUpload extends Component {
    state = {
        fileList: this.props.value ? [this.props.value] : [],
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            fileList: nextProps.value ? [nextProps.value] : [],
        });
    }

    render() {
        const props = {
            accept: this.props.accept,
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
                <p className="ant-upload-hint">Support for a single upload. Strictly prohibit from uploading company data or other band files</p>
            </Dragger>
        );
    }
}

export default FileUpload;
