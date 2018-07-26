import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Form, Col, Row } from 'antd';

import Icon from '../Icon';
import icons from './icons.json';

class IconChooser extends Component {
    static propTypes = {
        icon: PropTypes.any,
    }

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
        icon: this.props.icon || { 'map-marker-alt': icons['map-marker-alt'] },
        visible: false,
    }

    render() {
        const { onOk, onCancel, onClick } = this.handlers;
        const { icon, visible } = this.state;
        const label = (
            <React.Fragment>
                <span style={{ marginRight: 8 }}>Icon</span>
                <Icon name={Object.keys(icon)[0]} />
            </React.Fragment>
        );
        return (
            <React.Fragment>
                <Form.Item label={label} colon={false}>
                    <Button onClick={onClick}>
                        Choose Icon from Library
                    </Button>
                </Form.Item>
                <Modal
                    style={{ background: '#f8f9fa' }}
                    onOk={onOk}
                    onCancel={onCancel}
                    width="80%"
                    visible={visible}
                >
                    <Row>
                        {
                            Object.keys(icons).map((i) => {
                                let prefix = 'fas';
                                if (icons[i].styles[0] === 'brands') {
                                    prefix = 'fab';
                                } else if (icons[i].styles[0] === 'regular') {
                                    prefix = 'far';
                                }
                                return (
                                    <Col key={i} span={4} className="rde-icon-container">
                                        <div className="rde-icon-top">
                                            <Icon name={i} size={3} prefix={prefix} />
                                        </div>
                                        <div className="rde-icon-bottom">
                                            {i}
                                        </div>
                                    </Col>
                                );
                            })
                        }
                    </Row>
                </Modal>
            </React.Fragment>
        );
    }
}

export default IconChooser;
