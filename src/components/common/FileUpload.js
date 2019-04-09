import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon } from 'antd';

const { Dragger } = Upload;

class FileUpload extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        limit: PropTypes.number,
        accept: PropTypes.string,
    }

    static defaultProps = {
        limit: 5,
    }

    state = {
        fileList: this.props.value ? [this.props.value] : [],
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            fileList: nextProps.value ? [nextProps.value] : [],
        });
    }

    render() {
        const { accept, limit, fileList } = this.props;
        const props = {
            accept,
            name: 'file',
            multiple: false,
            onChange: (info) => {
                const isLimit = info.file.size / 1024 / 1024 < limit;
                if (!isLimit) {
                    message.error(`Limited to ${limit}MB or less`);
                    return false;
                }
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
                }, () => {
                    const { onChange } = this.props;
                    onChange(null);
                });
            },
            beforeUpload: (file) => {
                const isLimit = file.size / 1024 / 1024 < limit;
                if (!isLimit) {
                    return false;
                }
                this.setState({
                    fileList: [file],
                });
                return false;
            },
            fileList,
        };
        return (
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">{`Support for a single upload. Limited to ${limit}MB or less`}</p>
            </Dragger>
        );
    }
}

export default FileUpload;
