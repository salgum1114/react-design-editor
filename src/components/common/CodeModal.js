import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'antd';
import ReactAce from 'react-ace';
import 'brace/mode/javascript';
import i18n from 'i18next';

import Icon from '../icon/Icon';

class CodeModal extends Component {
    handlers = {
        onOk: () => {
            const { onChange } = this.props;
            const { tempCode } = this.state;
            onChange(tempCode);
            this.setState({
                visible: false,
                code: tempCode,
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

    static propTypes = {
        value: PropTypes.any,
        onChange: PropTypes.func,
        form: PropTypes.any,
    }

    state = {
        code: this.props.value,
        tempCode: this.props.value,
        visible: false,
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            code: nextProps.value,
        });
    }

    render() {
        const { onOk, onCancel, onClick } = this.handlers;
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { code, visible, tempCode } = this.state;
        const label = (
            <React.Fragment>
                <span style={{ marginRight: 8 }}>{i18n.t('common.code')}</span>
                <Button onClick={onClick} shape="circle" className="rde-action-btn">
                    <Icon name="edit" />
                </Button>
            </React.Fragment>
        );
        const codeLabel = (
            <span>Code (value, styles, animations, userProperty)</span>
        );
        return (
            <React.Fragment>
                <Form.Item label={label} colon={false}>
                    {
                        getFieldDecorator('trigger.code', {
                            initialValue: code || this.props.value,
                        })(
                            <pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>
                                {code}
                            </pre>,
                        )
                    }
                </Form.Item>
                <Modal
                    onCancel={onCancel}
                    onOk={onOk}
                    visible={visible}
                >
                    <Form.Item label={codeLabel} colon={false}>
                        <ReactAce
                            ref={(c) => { this.jsRef = c; }}
                            mode="javascript"
                            theme="chrome"
                            width="100%"
                            height="200px"
                            defaultValue={code}
                            value={tempCode}
                            editorProps={{
                                $blockScrolling: true,
                            }}
                            onChange={(value) => { this.setState({ tempCode: value }); }}
                        />
                    </Form.Item>
                </Modal>
            </React.Fragment>
        );
    }
}

export default CodeModal;
