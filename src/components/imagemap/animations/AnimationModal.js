import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'antd';
import i18n from 'i18next';

import Canvas from '../../canvas/Canvas';
import AnimationProperty from '../properties/AnimationProperty';

class AnimationModal extends Component {
    static propTypes = {
        form: PropTypes.any,
        visible: PropTypes.bool,
        animation: PropTypes.object,
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
        if (!nextProps.visible) {
            if (this.canvasRef) {
                this.canvasRef.animationHandlers.stop('animations');
            }
            return;
        }
        if (JSON.stringify(nextProps.animation) !== JSON.stringify(this.props.animation)) {
            this.waitForCanvasRender(this.canvasRef, nextProps.animation);
        }
        nextProps.form.resetFields();
    }

    waitForCanvasRender = (canvas, animation) => {
        setTimeout(() => {
            if (canvas) {
                canvas.handlers.setById('animations', 'animation', animation);
                return;
            }
            this.waitForCanvasRender(this.canvasRef, animation);
        }, 5);
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
                        id: 'animations',
                        fill: 'rgba(0, 0, 0, 1)',
                        stroke: 'rgba(255, 255, 255, 0)',
                    };
                    this.canvasRef.handlers.add(option);
                });
                return;
            }
            this.waitForContainerRender(this.containerRef);
        }, 5);
    };

    render() {
        const { form, visible, animation, onOk, onCancel, validateTitle, onChange } = this.props;
        const { width, height } = this.state;
        return (
            <Modal
                onOk={onOk}
                onCancel={onCancel}
                visible={visible}
            >
                <Form.Item label={i18n.t('common.title')} required colon={false} hasFeedback help={validateTitle.help} validateStatus={validateTitle.validateStatus}>
                    <Input value={animation.title} onChange={(e) => { onChange(null, { animation: { title: e.target.value } }, { animation: { ...animation, title: e.target.value } }); }} />
                </Form.Item>
                {AnimationProperty.render(this.canvasRef, form, { animation, id: 'animations' })}
                <div ref={(c) => { this.containerRef = c; }}>
                    <Canvas
                        ref={(c) => { this.canvasRef = c; }}
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
})(AnimationModal);
