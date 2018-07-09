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
            const json = JSON.stringify(this.props.canvasRef.current.handlers.exportJSON().objects.filter(obj => obj.type !== 'map'));
            this.canvasPreviewRef.handlers.importJSON(json);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.preview) {
            const main = nextProps.canvasRef.current.workarea;
            const leftRatio = this.state.canvasRect.width / main.width;
            const topRatio = this.state.canvasRect.height / main.height;
            console.log(leftRatio, topRatio);
            const data = nextProps.canvasRef.current.handlers.exportJSON().objects.map((obj) => {
                const scaleX = obj.scaleX * leftRatio;
                const scaleY = obj.scaleY * topRatio;
                return {
                    ...obj,
                    scaleX,
                    scaleY,
                };
            });
            // const option = {
            //     left: 0,
            //     top: 0,
            //     width: main.width * leftRatio,
            //     height: main.height * topRatio,
            //     scaleX: main.scaleX * leftRatio,
            //     scaleY: main.scaleY * topRatio,
            //     type: 'image',
            //     file: main.file,
            // };
            // this.canvasPreviewRef.handlers.load(option);
            const json = JSON.stringify(data.filter(obj => obj.type !== 'map'));
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
                <Canvas width={canvasRect.width} height={canvasRect.height} ref={(c) => { this.canvasPreviewRef = c; }} />
                <Button className="rde-canvas-preview-close-btn" onClick={onChangePreview}>
                    <Icon name="times" size={1.5} />
                </Button>
            </div>
        );
    }
}

export default Preview;
