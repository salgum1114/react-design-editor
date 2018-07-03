import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import uuid from 'uuid/v4';

import { FlexBox, FlexItem } from './flex';

import Icon from './Icon';

const { Panel } = Collapse;

const MARKER = [
    {
        key: 'default',
        type: 'itext',
        icon: 'map-marker',
        title: 'Marker',
        option: {
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
            name: 'New image',
            src: '/images/sample/transparentBg.png',
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
            radius: 30,
            name: 'New shape',
        },
    },
];

class Items extends Component {
    handlers = {
        onAddItem: (item, centered) => {
            const { canvasRef } = this.props;
            const id = uuid();
            const option = Object.assign({}, item.option, { id });
            const newItem = Object.assign({}, item, { option });
            canvasRef.current.handlers.add(newItem, centered);
        },
    }

    events = {
        onDragStart: (e, item) => {
            this.item = item;
            const { target, clientX, clientY } = e;
            const { left, top } = this.offset(target);
            target.classList.add('dragging');
            this.offsetX = clientX - left;
            this.offsetY = clientY - top;
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
            const { target, clientX, clientY } = e;
            const { left, top } = this.offset(target);
            const x = clientX - (left + this.offsetX);
            const y = clientY - (top + this.offsetY);
            const option = Object.assign({}, this.item.option, { left: x, top: y });
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
        console.log(canvas.current.container.current);
        canvas.current.container.current.addEventListener('dragenter', this.events.onDragEnter, false);
        canvas.current.container.current.addEventListener('dragover', this.events.onDragOver, false);
        canvas.current.container.current.addEventListener('dragleave', this.events.onDragLeave, false);
        canvas.current.container.current.addEventListener('drop', this.events.onDrop, false);
    }

    detachEventListener = () => {

    }

    renderItems = items => (
        <FlexBox flexWrap="wrap">
            {
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
            }
        </FlexBox>
    )

    render() {
        const showArrow = false;
        return (
            <div>
                <Collapse bordered={false}>
                    <Panel showArrow={showArrow} header="Marker">
                        {this.renderItems(MARKER)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Text">
                        {this.renderItems(TEXT)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Image">
                        {this.renderItems(IMAGE)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Shape">
                        {this.renderItems(SHAPE)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Items;
