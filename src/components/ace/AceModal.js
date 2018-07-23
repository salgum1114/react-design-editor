import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button } from 'antd';
import Icon from 'polestar-icons';
import AceEditor from './AceEditor';

class AceModal extends Component {
    static propTypes = {
        value: PropTypes.any,
        onChange: PropTypes.func,
        form: PropTypes.any,
    }

    handlers = {
        onOk: () => {
            const { onChange } = this.props;
            const { html, css } = this.aceRef.handlers.getCodeValue();
            const code = {
                html,
                css,
            };
            onChange(code);
            this.setState({
                visible: false,
                code,
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
        code: this.props.value || { html: '', css: '' },
        tempHtml: '',
        tempCss: '',
        visible: false,
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            code: nextProps.value || { html: '', css: '' },
        });
    }

    render() {
        const { onOk, onCancel, onClick } = this.handlers;
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { code: { html, css }, visible } = this.state;
        const label = (
            <React.Fragment>
                <span style={{ marginRight: 8 }}>Code Editor</span>
                <Button onClick={onClick} shape="circle">
                    <Icon name="edit" />
                </Button>
            </React.Fragment>
        );
        return (
            <React.Fragment>
                <Form.Item label={label} colon={false}>
                    {
                        getFieldDecorator('code', {
                            rules: [{
                                required: true,
                                message: 'Please input code',
                            }],
                            initialValue: '',
                        })(
                            <span />,
                        )
                    }
                </Form.Item>
                <Form.Item label="HTML" colon={false}>
                    {
                        getFieldDecorator('html', {
                            initialValue: html || '',
                        })(
                            <span style={{ wordBreak: 'break-all' }}>
                                {html}
                            </span>,
                        )
                    }
                </Form.Item>
                <Form.Item label="CSS" colon={false}>
                    {
                        getFieldDecorator('css', {
                            initialValue: css || '',
                        })(
                            <span style={{ wordBreak: 'break-all' }}>
                                {css}
                            </span>,
                        )
                    }
                </Form.Item>
                <Modal
                    onCancel={onCancel}
                    onOk={onOk}
                    visible={visible}
                    width="80%"
                >
                    <AceEditor ref={(c) => { this.aceRef = c; }} html={html} css={css} isJS={false} />
                    {/* <Row>
                        <Col span={12} style={editorStyle}>
                            <Form.Item label="HTML" colon={false}>
                                <AceEditor
                                    ref={(c) => { this.htmlRef = c; }}
                                    mode="html"
                                    theme="chrome"
                                    width="100%"
                                    height="200px"
                                    defaultValue={tempHtml}
                                    value={tempHtml}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeHTML}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} style={editorStyle}>
                            <Form.Item label="CSS" colon={false}>
                                <AceEditor
                                    ref={(c) => { this.cssRef = c; }}
                                    mode="css"
                                    theme="chrome"
                                    width="100%"
                                    height="200px"
                                    defaultValue={tempCss}
                                    value={tempCss}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeCSS}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <AcePreview html={tempHtml} css={tempCss} /> */}
                </Modal>
            </React.Fragment>
        );
    }
}

export default AceModal;
