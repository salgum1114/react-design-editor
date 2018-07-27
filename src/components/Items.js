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
        icon: {
            prefix: 'fas',
            name: 'map-marker-alt',
        },
        title: 'Marker',
        option: {
            type: 'i-text',
            text: '\uf3c5', // map-marker
            fontFamily: 'Font Awesome 5 Free',
            fontWeight: 900,
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
        icon: {
            prefix: 'fas',
            name: 'font',
        },
        title: 'Text',
        option: {
            type: 'textbox',
            text: 'Input text',
            name: 'New text',
            fontSize: 32,
        },
    },
];

const IMAGE = [
    {
        key: 'image',
        type: 'image',
        icon: {
            prefix: 'fas',
            name: 'image',
        },
        title: 'Image',
        option: {
            type: 'image',
            width: 80,
            height: 80,
            name: 'New image',
            src: '/images/sample/transparentBg.png',
        },
    },
];

const DOM_ELEMENT = [
    {
        key: 'custom',
        type: 'dom_element',
        icon: {
            prefix: 'fab',
            name: 'html5',
        },
        title: 'Element',
        option: {
            type: 'element',
            width: 480,
            height: 270,
            name: 'New Element',
            autoplay: true,
            muted: true,
            loop: true,
        },
    },
    {
        key: 'iframe',
        type: 'dom_element',
        icon: {
            prefix: 'fas',
            name: 'window-maximize',
        },
        title: 'IFrame',
        option: {
            type: 'iframe',
            width: 480,
            height: 270,
            name: 'New IFrame',
            autoplay: true,
            muted: true,
            loop: true,
        },
    },
    {
        key: 'video',
        type: 'dom_element',
        icon: {
            prefix: 'fas',
            name: 'video',
        },
        title: 'Video',
        option: {
            type: 'video',
            width: 480,
            height: 270,
            name: 'New video',
            autoplay: true,
            muted: true,
            loop: true,
        },
    },
];

const SHAPE = [
    {
        key: 'default-triangle',
        type: 'triangle',
        icon: {
            prefix: 'fas',
            name: 'image',
        },
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
        icon: {
            prefix: 'fas',
            name: 'image',
        },
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
        icon: {
            prefix: 'fas',
            name: 'circle',
        },
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
        icon: {
            prefix: 'fas',
            name: 'draw-polygon',
        },
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
                            <Icon name={item.icon.name} prefix={item.icon.prefix} size={3} />
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
                            <Icon name={item.icon.name} prefix={item.icon.prefix} size={3} />
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
                    <Panel showArrow={showArrow} header="Dom Element">
                        {this.renderItems('DOM_ELEMENT', DOM_ELEMENT)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Items;
