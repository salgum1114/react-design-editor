import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { ResizeSensor } from 'css-element-queries';
import classnames from 'classnames';

import Icon from './Icon';
import Canvas from './Canvas';

class Preview extends Component {
    static propTypes = {
        preview: PropTypes.bool,
        onChangePreview: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
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

    render() {
        const { canvasRect } = this.state;
        const { onChangePreview, preview } = this.props;
        const previewClassName = classnames('rde-canvas-preview', { preview });
        return (
            <div className={previewClassName}>
                <div ref={(c) => { this.container = c; }} style={{ overvlow: 'hidden', display: 'flex', flex: '1', height: '100%' }}>
                    <Canvas editable={false} width={canvasRect.width} height={canvasRect.height} ref={this.canvasRef} />
                    <Button className="rde-action-btn rde-canvas-preview-close-btn" onClick={onChangePreview}>
                        <Icon name="times" size={1.5} />
                    </Button>
                </div>
            </div>
        );
    }
}

export default Preview;
