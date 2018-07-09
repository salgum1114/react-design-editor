import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { ResizeSensor } from 'css-element-queries';

import Icon from './Icon';
import Canvas from './Canvas';

class Preview extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        preview: PropTypes.bool,
        onChangePreview: PropTypes.func,
    }

    state = {
        canvasRect: {
            width: 0,
            height: 0,
        },
    }

    componentDidMount() {
        new ResizeSensor(this.container, (e) => {
            const canvasRect = Object.assign({}, this.state.canvasRect, {
                width: this.container.clientWidth,
                height: this.container.clientHeight,
            });
            this.setState({
                canvasRect,
            });
        });
        if (this.canvasPreviewRef) {
            const json = JSON.stringify(this.props.canvasRef.current.handlers.exportJSON().objects.filter(obj => obj.id !== 'workarea'));
            this.canvasPreviewRef.handlers.importJSON(json);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.preview) {
            const { workarea } = nextProps.canvasRef.current;
            const leftRatio = this.state.canvasRect.width / (workarea.width * workarea.scaleX);
            const topRatio = this.state.canvasRect.height / (workarea.height * workarea.scaleY);
            if (workarea.file || workarea.src) {
                const option = {
                    width: this.state.canvasRect.width,
                    height: this.state.canvasRect.height,
                    file: workarea.file,
                    src: workarea.src,
                    type: 'image',
                }
                this.canvasPreviewRef.handlers.setCanvasBackgroundImage(option);
            }
            const data = nextProps.canvasRef.current.handlers.exportJSON().objects.map((obj) => {
                const scaleX = obj.scaleX * leftRatio;
                const scaleY = obj.scaleY * topRatio;
                const left = (obj.left - workarea.left) * leftRatio;
                const top = (obj.top - workarea.top) * topRatio;
                return {
                    ...obj,
                    left,
                    top,
                    scaleX,
                    scaleY,
                };
            });
            const json = JSON.stringify(data.filter(obj => obj.id !== 'workarea'));
            this.canvasPreviewRef.handlers.importJSON(json);
            return;
        }
        this.canvasPreviewRef.canvas.clear();
    }

    render() {
        const { canvasRect } = this.state;
        const { onChangePreview } = this.props;
        return (
            <div ref={(c) => { this.container = c; }} style={{ display: 'flex', flex: '1', height: '100%' }}>
                <Canvas editable={false} width={canvasRect.width} height={canvasRect.height} ref={(c) => { this.canvasPreviewRef = c; }} />
                <Button className="rde-canvas-preview-close-btn" onClick={onChangePreview}>
                    <Icon name="times" size={1.5} />
                </Button>
            </div>
        );
    }
}

export default Preview;
