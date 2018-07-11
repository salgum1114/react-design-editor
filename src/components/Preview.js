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
        this.resizeSensor = new ResizeSensor(this.container, (e) => {
            const { canvasRect: currentCanvasRect } = this.state;
            const canvasRect = Object.assign({}, currentCanvasRect, {
                width: this.container.clientWidth,
                height: this.container.clientHeight,
            });
            this.setState({
                canvasRect,
            });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const { preview, canvasRef } = this.props;
        const { canvasRect } = this.state;
        if (preview) {
            this.canvasPreviewRef.canvas.clear();
            const json = JSON.stringify(canvasRef.current.handlers.exportJSON().objects);
            this.canvasPreviewRef.handlers.importJSON(json);
        }
    }

    render() {
        const { canvasRect } = this.state;
        const { onChangePreview } = this.props;
        return (
            <div ref={(c) => { this.container = c; }} style={{ overvlow: 'hidden', display: 'flex', flex: '1', height: '100%' }}>
                <Canvas editable={false} width={canvasRect.width} height={canvasRect.height} ref={(c) => { this.canvasPreviewRef = c; }} />
                <Button className="rde-action-btn rde-canvas-preview-close-btn" onClick={onChangePreview}>
                    <Icon name="times" size={1.5} />
                </Button>
            </div>
        );
    }
}

export default Preview;
