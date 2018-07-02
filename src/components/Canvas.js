import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';

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
        zoom: PropTypes.bool,
        responsive: PropTypes.bool,
        onModified: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onSelect: PropTypes.func,
        onMoved: PropTypes.func,
    }

    static defaultProps = {
        width: 0,
        height: 0,
        zoom: true,
        responsive: false,
    }

    handlers = {
        add: (obj) => {
            if (obj.type === 'image') {
                const newImg = new Image();
                const { src, ...otherOption } = obj.option;
                newImg.onload = (e) => {
                    const imgObject = new fabric.Image(newImg, {
                        ...otherOption,
                    });
                    this.canvas.add(imgObject)
                    this.canvas.centerObject(imgObject);
                    const { onAdd } = this.props;
                    if (onAdd) {
                        onAdd(imgObject);
                    }
                }
                newImg.src = src;
                return;
            }
            const newObject = FabricObject[obj.type].create(obj.option);
            this.canvas.add(newObject);
            this.canvas.centerObject(newObject);
            const { onAdd } = this.props;
            if (onAdd) {
                onAdd(newObject);
            }
        },
        remove: () => {
            const activeObject = this.canvas.getActiveObject();
            const { onRemove } = this.props;
            if (activeObject.type !== 'activeSelection') {
                this.canvas.discardActiveObject();
                if (onRemove) {
                    onRemove(activeObject);
                }
                this.canvas.remove(activeObject);
            } else {
                const activeObjects = activeObject._objects;
                this.canvas.discardActiveObject();
                activeObjects.forEach((object) => {
                    if (onRemove) {
                        onRemove(object);
                    }
                    this.canvas.remove(object);
                });
            }
        },
        removeById: (id) => {
            const findObject = this.handlers.findById(id);
            if (findObject) {
                this.canvas.discardActiveObject();
                const { onRemove } = this.props;
                if (onRemove) {
                    onRemove(findObject);
                }
                this.canvas.remove(findObject);
            }
        },
        duplicate: () => {
            const { onAdd } = this.props;
            const activeObject = this.canvas.getActiveObject();
            activeObject.clone((clonedObj) => {
                this.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = this.canvas;
                    clonedObj.forEachObject((obj) => {
                        obj.set('id', uuid());
                        this.canvas.add(obj);
                    });
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                    clonedObj.setCoords();
                } else {
                    clonedObj.set('id', uuid());
                    this.canvas.add(clonedObj);
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                }
                this.canvas.setActiveObject(clonedObj);
                this.canvas.requestRenderAll();
            });
        },
        duplicateById: (id) => {
            const { onAdd } = this.props;
            const findObject = this.handlers.findById(id);
            if (findObject) {
                findObject.clone((cloned) => {
                    cloned.set({
                        left: cloned.left + 10,
                        top: cloned.top + 10,
                        id: uuid(),
                        evented: true,
                    });
                    this.canvas.add(cloned);
                    if (onAdd) {
                        onAdd(cloned);
                    }
                    this.canvas.setActiveObject(cloned);
                    this.canvas.requestRenderAll();
                });
            }
        },
        copy: () => {
            this.canvas.getActiveObject().clone((cloned) => {
                this.setState({
                    clipboard: cloned,
                });
            });
        },
        paste: () => {
            const { onAdd } = this.props;
            this.state.clipboard.clone((clonedObj) => {
                this.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = this.canvas;
                    clonedObj.forEachObject((obj) => {
                        obj.set('id', uuid());
                        this.canvas.add(obj);
                        if (onAdd) {
                            onAdd(obj);
                        }
                    });
                    clonedObj.setCoords();
                } else {
                    clonedObj.set('id', uuid());
                    this.canvas.add(clonedObj);
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                }
                const newClipboard = Object.assign({}, this.state.clipboard, {
                    top: top + 10,
                    left: left + 10,
                });
                this.setState({
                    clipboard: newClipboard,
                });
                this.canvas.setActiveObject(clonedObj);
                this.canvas.requestRenderAll();
            });
        },
        getActiveObject: () => this.canvas.getActiveObject(),
        getActiveObjects: () => this.canvas.getActiveObjects(),
        set: (key, value) => {
            const activeObject = this.canvas.getActiveObject();
            activeObject.set(key, value);
            activeObject.setCoords();
            this.canvas.requestRenderAll();
            const { onModified } = this.props;
            if (onModified) {
                onModified(activeObject);
            }
        },
        setObject: (obj) => {
            const activeObject = this.canvas.getActiveObject();
            if (obj.id === activeObject.id) {
                Object.keys(obj).forEach((key) => {
                    if (obj[key] !== activeObject[key]) {
                        activeObject.set(key, obj[key]);
                        activeObject.setCoords();
                    }
                });
                this.canvas.requestRenderAll();
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            } else {
                console.warn('Object id not equal active object id.');
            }
        },
        setByObject: (obj, key, value) => {
            obj.set(key, value);
            obj.setCoords();
            this.canvas.requestRenderAll();
            const { onModified } = this.props;
            if (onModified) {
                onModified(obj);
            }
        },
        setById: (id, key, value) => {
            const findObject = this.handlers.findObjectById(id);
            this.handlers.setByObject(findObject, key, value);
        },
        setByName: (name, key, value) => {
            const findObject = this.handlers.findObjectByName(name);
            this.handlers.setByObject(findObject, key, value);
        },
        setImage: (obj, source) => {
            if (obj.type === 'image') {
                const newImg = new Image();
                newImg.onload = () => {
                    obj.setElement(newImg);
                    this.canvas.requestRenderAll();
                }
                newImg.src = source;
                return;
            }
            fabric.util.loadImage(source, (source) => {
                obj.setPatternFill({
                    source,
                    repeat: 'repeat'
                });
                this.canvas.requestRenderAll();
            });
        },
        setImageById: (id, source) => {
            const findObject = this.handlers.findById(id);
            this.handlers.setImage(findObject, source);
        },
        setImageByObject: (obj, source) => {
            this.handlers.setImage(obj, source);
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
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(findObject);
                this.canvas.requestRenderAll();
            }
        },
        selectById: (id) => {
            const findObject = this.handlers.findById(id);
            this.handlers.select(findObject);
        },
        selectByName: (name) => {
            const findObject = this.handlers.findByName(name);
            this.handlers.select(findObject);
        },
        scaleToResize: (width, height) => {
            const activeObject = this.handlers.getActiveObject();
            const obj = {
                id: activeObject.id,
                scaleX: width / activeObject.width,
                scaleY: height / activeObject.height,
            };
            this.handlers.setObject(obj);
            activeObject.setCoords();
            this.canvas.requestRenderAll();
        },
        import: () => {

        },
        export: () => {

        },
        submit: () => {

        },
    }

    events = {
        modified: (opt) => {
            const { onModified } = this.props;
            if (onModified) {
                const { target } = opt;
                if (!target) {
                    return;
                }
                onModified(opt);
            }
        },
        mousewheel: (opt) => {
            const { zoom } = this.props;
            if (zoom) {
                const delta = opt.e.deltaY;
                let zoomRatio = this.canvas.getZoom();
                if (delta > 0) {
                    zoomRatio -= 0.01;
                } else {
                    zoomRatio += 0.01;
                }
                this.canvas.zoomToPoint({ x: this.canvas.getCenter().left, y: this.canvas.getCenter().top }, zoomRatio);
                opt.e.preventDefault();
                opt.e.stopPropagation();
            }
        },
        selection: (opt) => {
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(opt);
            }
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

    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    state = {
        clipboard: null,
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
            name: '',
            type: 'map',
        });
        this.canvas.add(this.mainRect);
        const { modified, mousewheel, selection } = this.events;
        this.canvas.on({
            'object:modified': modified,
            'mouse:wheel': mousewheel,
            'selection:cleared': selection,
            'selection:created': selection,
            'selection:updated': selection,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const { width: currentWidth, height: currentHeight } = this.props;
        const { width: prevWidth, height: prevHeight } = prevProps;
        if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
            this.events.resize(prevWidth, prevHeight, currentWidth, currentHeight);
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
