import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, notification } from 'antd';
import uuid from 'uuid/v4';

import { FlexBox } from './flex';

import Icon from './Icon';

notification.config({
    top: 80,
    duration: 2,
});
const { Panel } = Collapse;

const MARKER = [
    {
        key: 'default',
        type: 'itext',
        icon: 'map-marker',
        title: 'Marker',
        option: {
            type: 'i-text',
            text: '\uf041', // map-marker
            fontFamily: 'FontAwesome',
            fontSize: 60,
            width: 30,
            height: 30,
            editable: false,
            name: 'New marker',
        },
    },
];

const TEXT = [
    {
        key: 'default',
        type: 'textbox',
        icon: 'font',
        title: 'Text',
        option: {
            type: 'textbox',
            text: 'Input text',
            name: 'New text',
        },
    },
];

const IMAGE = [
    {
        key: 'default',
        type: 'image',
        icon: 'picture-o',
        title: 'Image',
        option: {
            type: 'image',
            width: 80,
            height: 80,
            name: 'New image',
            src: '/images/sample/transparentBg.png',
            formatter: (opt) => {
                return <div>test</div>
            },
        },
    },
];

const SHAPE = [
    // {
    //     key: 'line',
    //     icon: 'picture-o',
    //     title: 'Line',
    // },
    // {
    //     key: 'polygon',
    //     icon: 'picture-o',
    //     title: 'Polygon',
    // },
    {
        key: 'default-triangle',
        type: 'triangle',
        icon: 'picture-o',
        title: 'Triangle',
        option: {
            type: 'triangle',
            width: 30,
            height: 30,
            name: 'New shape',
        },
    },
    {
        key: 'default-rect',
        type: 'rect',
        icon: 'picture-o',
        title: 'Rectangle',
        option: {
            type: 'rect',
            width: 40,
            height: 40,
            name: 'New shape',
        },
    },
    {
        key: 'default-circle',
        type: 'circle',
        icon: 'picture-o',
        title: 'Circle',
        option: {
            type: 'circle',
            radius: 30,
            name: 'New shape',
        },
    },
];

const DRWAING = [
    {
        key: 'polygon',
        type: 'polygon',
        icon: 'picture-o',
        title: 'Polygon',
        option: {
            type: 'polygon',
        },
    },
];

class Items extends Component {
    handlers = {
        onAddItem: (item, centered) => {
            const { canvasRef } = this.props;
            if (canvasRef.current.workarea.layout === 'responsive') {
                if (!canvasRef.current.workarea._element) {
                    notification.warn({
                        message: 'Please your select background image',
                    });
                    return;
                }
            }
            const id = uuid();
            const option = Object.assign({}, item.option, { id });
            canvasRef.current.handlers.add(option, centered);
        },
        onDrawingItem: (item) => {
            const { canvasRef } = this.props;
            if (canvasRef.current.workarea.layout === 'responsive') {
                if (!canvasRef.current.workarea._element) {
                    notification.warn({
                        message: 'Please your select background image',
                    });
                    return;
                }
            }
            canvasRef.current.drawingHandlers.initDraw();
        },
    }

    events = {
        onDragStart: (e, item) => {
            this.item = item;
            const { target } = e;
            target.classList.add('dragging');
        },
        onDragOver: (e) => {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'copy';
            return false;
        },
        onDragEnter: (e) => {
            const { target } = e;
            target.classList.add('over');
        },
        onDragLeave: (e) => {
            const { target } = e;
            target.classList.remove('over');
        },
        onDrop: (e) => {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            const { layerX, layerY } = e;
            const dt = e.dataTransfer;
            if (dt.types.length && dt.types[0] === 'Files') {
                const { files } = dt;
                Array.from(files).forEach((file) => {
                    file.uid = uuid();
                    const { type } = file;
                    if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
                        const item = {
                            option: {
                                type: 'image',
                                file,
                                left: layerX,
                                top: layerY,
                            },
                        };
                        this.handlers.onAddItem(item, false);
                    } else {
                        notification.warn({
                            message: 'Not supported file type',
                        });
                    }
                });
                return false;
            }
            const option = Object.assign({}, this.item.option, { left: layerX, top: layerY });
            const newItem = Object.assign({}, this.item, { option });
            this.handlers.onAddItem(newItem, false);
            return false;
        },
        onDragEnd: (e) => {
            this.item = null;
            e.target.classList.remove('dragging');
        },
    }

    static propTypes = {
        canvasRef: PropTypes.any,
    }

    componentDidMount() {
        const { canvasRef } = this.props;
        this.waitForCanvasRender(canvasRef);
    }

    componentWillUnmount() {
        const { canvasRef } = this.props;
        this.detachEventListener(canvasRef);
    }

    offset = (target) => {
        const rect = target.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft,
        };
    }

    waitForCanvasRender = (canvas) => {
        setTimeout(() => {
            if (canvas) {
                this.attachEventListener(canvas);
                return;
            }
            const { canvasRef } = this.props;
            this.waitForCanvasRender(canvasRef);
        }, 5);
    };

    attachEventListener = (canvas) => {
        canvas.current.canvas.wrapperEl.addEventListener('dragenter', this.events.onDragEnter, false);
        canvas.current.canvas.wrapperEl.addEventListener('dragover', this.events.onDragOver, false);
        canvas.current.canvas.wrapperEl.addEventListener('dragleave', this.events.onDragLeave, false);
        canvas.current.canvas.wrapperEl.addEventListener('drop', this.events.onDrop, false);
    }

    detachEventListener = (canvas) => {
        canvas.current.canvas.wrapperEl.removeEventListener('dragenter', this.events.onDragEnter);
        canvas.current.canvas.wrapperEl.removeEventListener('dragover', this.events.onDragOver);
        canvas.current.canvas.wrapperEl.removeEventListener('dragleave', this.events.onDragLeave);
        canvas.current.canvas.wrapperEl.removeEventListener('drop', this.events.onDrop);
    }

    renderItems = (type, items) => (
        <FlexBox flexWrap="wrap">
            {
                type === 'DRAWING' ? (
                    items.map(item => (
                        <div
                            key={item.key}
                            draggable
                            onClick={e => this.handlers.onDrawingItem(item)}
                            className="rde-item"
                            style={{ flex: '0 1 auto' }}
                        >
                            <Icon name={item.icon} size={3} />
                            <div className="rde-item-text">
                                {item.title}
                            </div>
                        </div>
                    ))
                ) : (
                    items.map(item => (
                        <div
                            key={item.key}
                            draggable
                            onClick={e => this.handlers.onAddItem(item)}
                            onDragStart={e => this.events.onDragStart(e, item)}
                            onDragEnd={e => this.events.onDragEnd(e, item)}
                            className="rde-item"
                            style={{ flex: '0 1 auto' }}
                        >
                            <Icon name={item.icon} size={3} />
                            <div className="rde-item-text">
                                {item.title}
                            </div>
                        </div>
                    ))
                )
            }
        </FlexBox>
    )

    render() {
        const showArrow = false;
        return (
            <div>
                <Collapse bordered={false}>
                    <Panel showArrow={showArrow} header="Marker">
                        {this.renderItems('MARKER', MARKER)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Text">
                        {this.renderItems('TEXT', TEXT)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Image">
                        {this.renderItems('IMAGE', IMAGE)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Shape">
                        {this.renderItems('SHAPE', SHAPE)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Drawing">
                        {this.renderItems('DRAWING', DRWAING)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Items;
