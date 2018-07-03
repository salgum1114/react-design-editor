import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { notification } from 'antd';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import debounce from 'lodash/debounce';

const FabricObject = {
    'i-text': {
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
    }

    static defaultProps = {
        width: 0,
        height: 0,
        zoom: true,
        responsive: false,
    }

    handlers = {
        centerObject: (obj, centered) => {
            if (centered) {
                this.canvas.centerObject(obj);
            } else {
                this.handlers.setByObject(obj, 'left', obj.left - (obj.width / 2));
                this.handlers.setByObject(obj, 'top', obj.top - (obj.height / 2));
            }
        },
        add: (obj, centered = true) => {
            if (obj.type === 'image') {
                const newImg = new Image();
                const { src, file, ...otherOption } = obj;
                if (src) {
                    newImg.onload = () => {
                        const imgObject = new fabric.Image(newImg, {
                            src,
                            ...otherOption,
                        });
                        this.handlers.centerObject(imgObject, centered);
                        this.canvas.add(imgObject);
                        const { onAdd } = this.props;
                        if (onAdd) {
                            onAdd(imgObject);
                        }
                    };
                    newImg.src = src;
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    newImg.onload = () => {
                        const imgObject = new fabric.Image(newImg, {
                            file,
                            ...otherOption,
                        });
                        this.handlers.centerObject(imgObject, centered);
                        this.canvas.add(imgObject);
                        const { onAdd } = this.props;
                        if (onAdd) {
                            onAdd(imgObject);
                        }
                    };
                    newImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
                return;
            }
            const newObject = FabricObject[obj.type].create({ id: uuid(), ...obj });
            this.handlers.centerObject(newObject, centered);
            this.canvas.add(newObject);
            const { onAdd } = this.props;
            if (onAdd) {
                onAdd(newObject);
            }
        },
        remove: () => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
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
            if (!activeObject) {
                return false;
            }
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
            if (!activeObject) {
                return false;
            }
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
        loadImage: (obj, src) => {
            if (obj.type === 'image') {
                const newImg = new Image();
                newImg.onload = () => {
                    obj.setElement(newImg);
                    this.canvas.requestRenderAll();
                };
                newImg.src = src;
                return;
            }
            fabric.util.loadImage(src, (source) => {
                obj.setPatternFill({
                    source,
                    repeat: 'repeat',
                });
                this.canvas.requestRenderAll();
            });
        },
        setImage: (obj, src) => {
            if (typeof src === 'string') {
                this.handlers.loadImage(obj, src);
                obj.set('file', null);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.handlers.loadImage(obj, e.target.result);
                    obj.set('src', null);
                };
                reader.readAsDataURL(src);
            }
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
        allSelect: () => {
            this.canvas.discardActiveObject();
            const activeSelection = new fabric.ActiveSelection(this.canvas.getObjects().filter((obj) => {
                if (obj.type === 'map') {
                    return false;
                }
                return true;
            }), {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(activeSelection);
            this.canvas.requestRenderAll();
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
            if (findObject) {
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(findObject);
                this.canvas.requestRenderAll();
            }
        },
        selectByName: (name) => {
            const findObject = this.handlers.findByName(name);
            if (findObject) {
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(findObject);
                this.canvas.requestRenderAll();
            }
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
        moving: (e) => {
            const activeObject = this.handlers.getActiveObject();
            if (!activeObject) {
                return false;
            }
            if (e.code === 'ArrowUp') {
                activeObject.set('top', activeObject.top - 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.code === 'ArrowDown') {
                activeObject.set('top', activeObject.top + 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.code === 'ArrowLeft') {
                activeObject.set('left', activeObject.left - 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.code === 'ArrowRight') {
                activeObject.set('left', activeObject.left + 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            }
            if (this.props.onModified) {
                this.props.onModified({ target: activeObject });
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
        paste: (e) => {
            if (this.canvas.wrapperEl !== document.activeElement) {
                return false;
            }
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            const clipboardData = e.clipboardData || window.clipboardData;
            if (clipboardData.types.length) {
                clipboardData.types.forEach((clipboardType) => {
                    if (clipboardType === 'text/plain') {
                        const textPlain = clipboardData.getData('text/plain');
                        const item = {
                            id: uuid(),
                            type: 'textbox',
                            text: textPlain,
                        };
                        this.handlers.add(item, true);
                    } else if (clipboardType === 'text/html') {
                        // Todo ...
                        // const textHtml = clipboardData.getData('text/html');
                        // console.log(textHtml);
                    } else if (clipboardType === 'Files') {
                        Array.from(clipboardData.files).forEach((file) => {
                            const { type } = file;
                            if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
                                const item = {
                                    id: uuid(),
                                    type: 'image',
                                    file,
                                };
                                this.handlers.add(item, true);
                            } else {
                                notification.warn({
                                    message: 'Not supported file type',
                                });
                            }
                        });
                    }
                });
            }
            return false;
        },
        keydown: (e) => {
            if (e.code === 'Delete') {
                this.handlers.remove();
            } else if (e.code.includes('Arrow')) {
                this.events.moving(e);
            } else if (e.ctrlKey && e.code === 'KeyA') {
                e.preventDefault();
                this.handlers.allSelect();
            }
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
        this.attachEventListener();
    }

    componentDidUpdate(prevProps, prevState) {
        const { width: currentWidth, height: currentHeight } = this.props;
        const { width: prevWidth, height: prevHeight } = prevProps;
        if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
            this.events.resize(prevWidth, prevHeight, currentWidth, currentHeight);
        }
    }

    componentWillUnmount() {
        this.detachEventListener();
    }

    attachEventListener = () => {
        // if add canvas wrapper element event, tabIndex = 1000;
        document.addEventListener('keydown', this.events.keydown, false);
        document.addEventListener('paste', this.events.paste, false);
    }

    detachEventListener = () => {
        document.removeEventListener('keydown', this.events.keydown);
        document.removeEventListener('paste', this.events.paste);
    }

    render() {
        return (
            <div
                ref={this.container}
                id="rde-canvas"
                className="rde-canvas"
            >
                <canvas id="c" />
            </div>
        );
    }
}

export default Canvas;
