import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, Input } from 'antd';
import Icon from 'polestar-icons';

class UrlModal extends Component {
    handlers = {
        onOk: () => {
            const { onChange } = this.props;
            const { tempUrl } = this.state;
            onChange(tempUrl);
            this.setState({
                visible: false,
                url: tempUrl,
            });
        },
        onCancel: () => {
            this.modalHandlers.onHide();
        },
        onClick: () => {
            this.modalHandlers.onShow();
        },
    }

    modalHandlers = {
        onShow: () => {
            this.setState({
                visible: true,
            });
        },
        onHide: () => {
            this.setState({
                visible: false,
            });
        },
    }

    state = {
        url: this.props.value || '',
        tempUrl: '',
        visible: false,
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            url: nextProps.value || '',
        });
    }

    render() {
        const { onOk, onCancel, onClick } = this.handlers;
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { url, visible } = this.state;
        const label = (
            <React.Fragment>
                <span style={{ marginRight: 8 }}>URL</span>
                <Button onClick={onClick} shape="circle">
                    <Icon name="edit" />
                </Button>
            </React.Fragment>
        );
        return (
            <React.Fragment>
                <Form.Item label={label} colon={false}>
                    {
                        getFieldDecorator('imageUrl', {
                            rules: [{
                                required: true,
                                message: 'Please input image url',
                            }],
                            initialValue: url || '',
                        })(
                            <span style={{ wordBreak: 'break-all' }}>
                                {url}
                            </span>,
                        )
                    }
                </Form.Item>
                <Modal
                    onCancel={onCancel}
                    onOk={onOk}
                    visible={visible}
                >
                    <Form.Item label="URL" colon={false}>
                        <Input onChange={(e) => { this.setState({ tempUrl: e.target.value }); }} />
                    </Form.Item>
                </Modal>
            </React.Fragment>
        );
    }
}

export default UrlModal;
