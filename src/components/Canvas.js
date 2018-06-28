import React, { Component } from 'react';
import PropTypes from 'prop-types';
import difference from 'lodash/difference';
import { fabric } from 'fabric';

const MARKER = {
    default: {
        create: (id) => new fabric.IText('\uf041', {
            id,
            fontSize: 60,
            fontFamily: 'FontAwesome',
            editable: false,
        }),
    },
};

const TEXT = {
    default: {
        create: (id) => new fabric.Textbox('Input Text', {
            id,
            charSpacing:1000,
        }),
    }
};

const IMAGE = {
    default: {
        create: (id) => new fabric.Image(null, {
            id,
        }),
    },
};

const DRAWING = {
    triangle: {
        create: (id) => new fabric.Triangle({
            id,
            width: 30,
            height: 30,
        }),
    },
    circle: {
        create: (id) => new fabric.Circle({
            id,
            radius: 40,
        }),
    },
    rect: {
        create: (id) => new fabric.Rect({
            id,
            width: 40,
            height: 40,
        }),
    },
};

const ITEM_TEMPLATE = {
    MARKER,
    TEXT,
    IMAGE,
    DRAWING,
};

const canvasSize = {
    width: 600,
    height: 400,
};

class Canvas extends Component {
    static propsTypes = {
        width: PropTypes.width,
        height: PropTypes.height,
        onAdd: PropTypes.func,
        onDelete: PropTypes.func,
        onDuplicate: PropTypes.func,
        onSelect: PropTypes.func,
    }

    handlers = {
        add: (key, item) => {
            const newItem = ITEM_TEMPLATE[item.type][item.key].create(key);
            this.canvas.add(newItem);
            this.canvas.centerObject(newItem);
        },
        delete: (key) => {

        },
        duplicate: (key) => {
            console.log(this.canvas.getActiveObject());
        },
        select: (item) => {
            console.log(item);
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(item);
            }
        },
        import: () => {

        },
        export: () => {

        },
        submit: () => {

        },
    }

    events = {
        mousewheel: () => {
            this.canvas.on('mouse:wheel', (opt) => {
                const delta = opt.e.deltaY;
                let zoom = this.canvas.getZoom();
                if (delta > 0) {
                    zoom -= 0.01;
                } else {
                    zoom += 0.01;
                }
                this.canvas.zoomToPoint({ x: this.canvas.getCenter().left, y: this.canvas.getCenter().top }, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
            });
        },
        mousedown: () => {
            const { select } = this.handlers;
            this.canvas.on('mouse:down', (opt) => {
                select(opt.target);
            });
        },
        resize: (currentWidth, currentHeight, nextWidth, nextHeight) => {
            this.canvas.setWidth(nextWidth).setHeight(nextHeight);
            this.canvas.centerObject(this.mainRect);
            const diffWidth = (nextWidth / 2) - (currentWidth / 2);
            const diffHeight = (nextHeight / 2) - (currentHeight / 2);
            this.canvas.getObjects().forEach((object, index) => {
                if (index !== 0) {
                    object.set('left', object.left + diffWidth);
                    object.set('top', object.top + diffHeight);
                    object.setCoords();
                }
            });
            this.canvas.renderAll();
        },
    }

    static defaultProps = {
        width: 0,
        height: 0,
    }

    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    componentDidMount() {
        const { width, height } = this.props;
        this.canvas = new fabric.Canvas('c', {
            preserveObjectStacking: true,
            width,
            height,
            backgroundColor: '#f3f3f3',
        });
        this.mainRect = new fabric.Rect({
            width: canvasSize.width,
            height: canvasSize.height,
            fill: '#fff',
            hasControls: false,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            top: 0,
            left: 0,
            hoverCursor: 'default',
        });
        this.canvas.add(this.mainRect);
        const { mousewheel, mousedown } = this.events;
        mousewheel();
        mousedown();
    }

    componentWillReceiveProps(nextProps) {
        const prevKeys = Object.keys(this.props.items);
        const nextKeys = Object.keys(nextProps.items);
        const differenceKeys = difference(nextKeys, prevKeys);
        if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
            this.events.resize(this.props.width, this.props.height, nextProps.width, nextProps.height);
        }
        if (differenceKeys.length) {
            const { add } = this.handlers;
            const key = differenceKeys[0];
            add(key, nextProps.items[key]);
        }
    }

    render() {
        return (
            <div
                ref={this.container}
                className="rde-canvas"
            >
                <canvas id="c" />
            </div>
        );
    }
}

export default Canvas;
