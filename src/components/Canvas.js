import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';

const FabricObject = {
    itext: {
        create: ({ text, ...option }) => new fabric.IText(text, {
            ...option,
        }),
    },
    textbox: {
        create: ({ text, ...option }) => new fabric.Textbox(text, {
            ...option,
        }),
    },
    image: {
        create: ({ element, ...option }) => new fabric.Image(null, {
            ...option,
        }),
    },
    triangle: {
        create: option => new fabric.Triangle({
            ...option,
        }),
    },
    circle: {
        create: option => new fabric.Circle({
            ...option,
        }),
    },
    rect: {
        create: option => new fabric.Rect({
            ...option,
        }),
    },
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
        add: (obj) => {
            const newObject = FabricObject[obj.type].create(obj.option);
            this.canvas.add(newObject);
            this.canvas.centerObject(newObject);
            const { onAdd } = this.props;
            if (onAdd) {
                onAdd(newObject);
            }
        },
        delete: (id) => {
            const { onDelete } = this.props;
            if (onDelete) {
                onDelete();
            }
        },
        duplicate: (id) => {
            const { onDuplicate } = this.props;
            if (onDuplicate) {
                onDuplicate();
            }
        },
        getActiveObject: () => this.canvas.getActiveObject(),
        getActiveObjects: () => this.canvas.getActiveObjects(),
        set: (key, value) => {
            const activeObject = this.canvas.getActiveObject();
            activeObject.set(key, value);
        },
        setObject: (obj) => {
            const activeObject = this.canvas.getActiveObject();
            if (obj.id === activeObject.id) {
                Object.keys(obj).forEach((key) => {
                    if (obj[key] !== activeObject[key]) {
                        activeObject.set(key, obj[key]);
                    }
                });
            } else {
                console.warn('Object id not equal active object id.');
            }
        },
        setById: (id, key, value) => {
            const findObject = this.handlers.findObjectById(id);
            if (findObject) {
                findObject.set(key, value);
            }
        },
        setByName: (name, key, value) => {
            const findObject = this.handlers.findObjectByName(name);
            if (findObject) {
                findObject.set(key, value);
            }
        },
        find: obj => this.handlers.findById(obj.id),
        findById: (id) => {
            let findObject;
            const exist = this.canvas.getObjects().some((obj) => {
                if (obj.id === id) {
                    findObject = obj;
                    return true;
                }
                return false;
            });
            if (!exist) {
                console.warn('Not found object by id.');
                return exist;
            }
            return findObject;
        },
        findByName: (name) => {
            let findObject;
            const exist = this.canvas.getObjects().some((obj) => {
                if (obj.name === name) {
                    findObject = obj;
                    return true;
                }
                return false;
            });
            if (!exist) {
                console.warn('Not found object by name.');
                return exist;
            }
            return findObject;
        },
        select: (obj) => {
            const findObject = this.handlers.find(obj);
            if (findObject) {
                this.canvas.setActiveObject(findObject);
            }
        },
        selectById: (id) => {
            const findObject = this.handlers.findById(id);
            if (findObject) {
                this.canvas.setActiveObject(findObject);
            }
        },
        selectByName: (name) => {
            const findObject = this.handlers.findByName(name);
            if (findObject) {
                this.canvas.setActiveObject(findObject);
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
        const { width: currentWidth, height: currentHeight } = this.props;
        const { width: nextWidth, height: nextHeight } = nextProps;
        if (currentWidth !== nextWidth || currentHeight !== nextHeight) {
            this.events.resize(currentWidth, currentHeight, nextWidth, nextProps.height);
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
