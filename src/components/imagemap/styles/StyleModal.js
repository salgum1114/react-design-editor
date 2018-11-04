import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'antd';

import Canvas from '../../canvas/Canvas';
import StyleProperty from '../properties/StyleProperty';

class StyleModal extends Component {
    static propTypes = {
        form: PropTypes.any,
        visible: PropTypes.bool,
        style: PropTypes.object,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    }

    state = {
        width: 150,
        height: 150,
    }

    componentDidMount() {
        this.waitForContainerRender(this.containerRef);
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.style) !== JSON.stringify(this.props.style)) {
            delete nextProps.style.strokeDashArray;
            Object.keys(nextProps.style).forEach((key) => {
                this.canvasRef.handlers.setById('styles', key, nextProps.style[key]);
            });
        }
        nextProps.form.resetFields();
    }

    waitForContainerRender = (container) => {
        setTimeout(() => {
            if (container) {
                this.setState({
                    width: container.clientWidth,
                    height: container.clientHeight,
                }, () => {
                    const option = {
                        type: 'i-text',
                        text: '\uf3c5',
                        fontFamily: 'Font Awesome 5 Free',
                        fontWeight: 900,
                        fontSize: 60,
                        width: 30,
                        height: 30,
                        editable: false,
                        name: 'New marker',
                        tooltip: {
                            enabled: false,
                        },
                        left: 200,
                        top: 50,
                        id: 'styles',
                    };
                    this.canvasRef.handlers.add(option);
                });
                return;
            }
            this.waitForContainerRender(this.containerRef);
        }, 5);
    };

    render() {
        const { form, visible, style, onOk, onCancel, validateTitle, onChange } = this.props;
        const { width, height } = this.state;
        return (
            <Modal
                onOk={onOk}
                onCancel={onCancel}
                visible={visible}
            >
                <Form.Item label="Title" required colon={false} hasFeedback help={validateTitle.help} validateStatus={validateTitle.validateStatus}>
                    <Input value={style.title} onChange={(e) => { onChange(null, { title: e.target.value }, { ...style, title: e.target.value }); }} />
                </Form.Item>
                {StyleProperty.render(this.canvasRef, form, style)}
                <div ref={(c) => { this.containerRef = c; }}>
                    <Canvas
                        ref={(c) => { this.canvasRef = c;}}
                        editable={false}
                        canvasOption={{ width, height, backgroundColor: '#f3f3f3' }}
                        workareaOption={{ backgroundColor: 'transparent' }}
                    />
                </div>
            </Modal>
        );
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {
        const { onChange } = props;
        onChange(props, changedValues, allValues);
    },
})(StyleModal);
