import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { notification } from 'antd';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';

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
    polygon: {
        create: ({ points, ...option }) => new fabric.Polygon(points, {
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
        editable: PropTypes.bool,
        width: PropTypes.width,
        height: PropTypes.height,
        zoom: PropTypes.bool,
        propertiesToInclude: PropTypes.array,
        responsive: PropTypes.bool,
        onModified: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onSelect: PropTypes.func,
        onZoom: PropTypes.func,
    }

    static defaultProps = {
        editable: true,
        width: 0,
        height: 0,
        zoom: true,
        propertiesToInclude: [],
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
        add: (obj, centered = true, loaded = false) => {
            const { editable } = this.props;
            if (obj.type === 'i-text') {
                obj.editable = false;
            } else {
                obj.editable = editable;
            }
            obj.hasControls = editable;
            obj.hasBorders = editable;
            obj.selection = editable;
            obj.lockMovementX = !editable;
            obj.lockMovementY = !editable;
            obj.hoverCursor = !editable ? 'pointer' : 'move';
            if (obj.type === 'image') {
                const newImg = new Image();
                const { src, file, ...otherOption } = obj;
                if (src) {
                    newImg.onload = () => {
                        const imgObject = new fabric.Image(newImg, {
                            src,
                            ...otherOption,
                        });
                        if (!loaded) {
                            this.handlers.centerObject(imgObject, centered);
                        }
                        this.canvas.add(imgObject);
                        if (!editable) {
                            imgObject.on('mousedown', this.events.object.mousedown);
                            imgObject.on('mouseover', this.events.object.mouseover);
                            imgObject.on('mouseout', this.events.object.mouseout);
                        }
                        const { onAdd } = this.props;
                        if (onAdd && !loaded) {
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
                        if (!loaded) {
                            this.handlers.centerObject(imgObject, centered);
                        }
                        this.canvas.add(imgObject);
                        if (!editable) {
                            imgObject.on('mousedown', this.events.object.mousedown);
                            imgObject.on('mouseover', this.events.object.mouseover);
                            imgObject.on('mouseout', this.events.object.mouseout);
                        }
                        const { onAdd } = this.props;
                        if (onAdd && !loaded) {
                            onAdd(imgObject);
                        }
                    };
                    newImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
                return;
            }
            const newObject = FabricObject[obj.type].create({ ...obj });
            if (obj.type !== 'polygon' && !loaded) {
                this.handlers.centerObject(newObject, centered);
            }
            this.canvas.add(newObject);
            if (!editable) {
                newObject.on('mousedown', this.events.object.mousedown);
                newObject.on('mouseover', this.events.object.mouseover);
                newObject.on('mouseout', this.events.object.mouseout);
            }
            const { onAdd } = this.props;
            if (onAdd && !loaded) {
                onAdd(newObject);
            }
        },
        remove: () => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            if (activeObject.type !== 'activeSelection') {
                this.canvas.discardActiveObject();
                this.canvas.remove(activeObject);
            } else {
                const activeObjects = activeObject._objects;
                this.canvas.discardActiveObject();
                activeObjects.forEach((object) => {
                    this.canvas.remove(object);
                });
            }
            const { onRemove } = this.props;
            if (onRemove) {
                onRemove(activeObject);
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
            const { onAdd, propertiesToInclude } = this.props;
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
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
            }, propertiesToInclude);
        },
        duplicateById: (id) => {
            const { onAdd, propertiesToInclude } = this.props;
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
                }, propertiesToInclude);
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
        setCanvasBackgroundImage: (obj) => {
            const canvas = this.canvas;
            if (obj.type === 'image') {
                const { src, file, ...otherOption } = obj;
                if (src) {
                    fabric.Image.fromURL(src, function (img) {
                        img.set({
                            originX: 'left',
                            originY: 'top'
                        });
                        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                            scaleX: canvas.width / img.width,
                            scaleY: canvas.height / img.height,
                        });
                    });
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const src = e.target.result;
                    fabric.Image.fromURL(src, function (img) {
                        img.set({
                            originX: 'left',
                            originY: 'top'
                        });
                        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                            scaleX: canvas.width / img.width,
                            scaleY: canvas.height / img.height,
                        });
                    });
                };
                reader.readAsDataURL(file);
                return;
            }
            console.warn('Object type not image');
        },
        setWorkareaImage: (obj, source) => {
            const canvas = this.canvas;
            if (typeof source === 'string') {
                fabric.Image.fromURL(src, function (img) {
                    img.set({
                        originX: 'left',
                        originY: 'top',
                        scaleX: obj.width / img.width,
                        scaleY: obj.height / img.height,
                    });
                    obj.set({
                        ...img,
                        selectable: false,
                    });
                    canvas.renderAll();
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target.result;
                fabric.Image.fromURL(src, function (img) {
                    img.set({
                        originX: 'left',
                        originY: 'top',
                        scaleX: obj.width / img.width,
                        scaleY: obj.height / img.height,
                    });
                    obj.set({
                        ...img,
                        selectable: false,
                    });
                    canvas.renderAll();
                });
            };
            reader.readAsDataURL(source);
        },
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
                if (obj.id === 'workarea') {
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
        importJSON: (json, callback) => {
            if (typeof json === 'string') {
                json = JSON.parse(json);
            }
            json.forEach((obj) => {
                this.handlers.add(obj, false, true);
            });
            if (callback) {
                callback(this.canvas);
            }
        },
        exportJSON: () => this.canvas.toDatalessJSON(this.props.propertiesToInclude),
        exportPNG: () => this.canvas.toDataURL({
            format: 'png',
            quality: 0.8,
        }),
        bringForward: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                this.canvas.bringForward(activeObject);
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            }
        },
        sendBackwards: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                this.canvas.sendBackwards(activeObject);
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            }
        },
        zoomIn: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio += 0.01;
            this.canvas.zoomToPoint({ x: this.canvas.getCenter().left, y: this.canvas.getCenter().top }, zoomRatio);
            if (this.props.onZoom) {
                this.props.onZoom(zoomRatio);
            }
        },
        zoomOut: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio -= 0.01;
            this.canvas.zoomToPoint({ x: this.canvas.getCenter().left, y: this.canvas.getCenter().top }, zoomRatio);
            if (this.props.onZoom) {
                this.props.onZoom(zoomRatio);
            }
        },
    }

    drawingHandlers = {
        initDraw: () => {
            this.polygonMode = true;
            this.pointArray = [];
            this.lineArray = [];
            this.activeLine = null;
            this.activeShape = null;
        },
        finishDraw: () => {
            this.polygonMode = false;
            this.pointArray = [];
            this.lineArray = [];
            this.activeLine = null;
            this.activeShape = null;
        },
        addPoint: (obj) => {
            obj.points.forEach((point, index) => {
                const circle = new fabric.Circle({
                    id: uuid(),
                    radius: 5,
                    fill: '#ffffff',
                    stroke: '#333333',
                    strokeWidth: 0.5,
                    selectable: true,
                    hasBorders: false,
                    hasControls: false,
                    originX: 'center',
                    originY: 'center',
                    hoverCursor: 'pointer',
                    polygon: obj.id,
                    name: index,
                });
                circle.setPositionByOrigin(new fabric.Point(point.x, point.y), 'left', 'top');
                this.canvas.add(circle);
            });
        },
        polygon: {
            addPoint: (opt) => {
                const id = uuid();
                const { e } = opt;
                const { layerX, layerY } = e;
                const zoom = this.canvas.getZoom();
                const circle = new fabric.Circle({
                    id,
                    radius: 5,
                    fill: '#ffffff',
                    stroke: '#333333',
                    strokeWidth: 0.5,
                    left: layerX / zoom,
                    top: layerY / zoom,
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    originX: 'center',
                    originY: 'center',
                    hoverCursor: 'pointer',
                });
                if (!this.pointArray.length) {
                    circle.set({
                        fill: 'red',
                    });
                }
                const x = layerX / zoom;
                const y = layerY / zoom;
                const points = [x, y, x, y];
                const line = new fabric.Line(points, {
                    strokeWidth: 2,
                    fill: '#999999',
                    stroke: '#999999',
                    class: 'line',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    evented: false,
                });
                if (this.activeShape) {
                    const position = this.canvas.getPointer(e);
                    const activeShapePoints = this.activeShape.get('points');
                    activeShapePoints.push({
                        x: position.x,
                        y: position.y,
                    });
                    const polygon = new fabric.Polygon(activeShapePoints, {
                        stroke: '#333333',
                        strokeWidth: 1,
                        fill: '#cccccc',
                        opacity: 0.1,
                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        evented: false,
                    });
                    this.canvas.remove(this.activeShape);
                    this.canvas.add(polygon);
                    this.activeShape = polygon;
                    this.canvas.renderAll();
                } else {
                    const polyPoint = [{ x, y }];
                    const polygon = new fabric.Polygon(polyPoint, {
                        stroke: '#333333',
                        strokeWidth: 1,
                        fill: '#cccccc',
                        opacity: 0.1,
                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        evented: false,
                    });
                    this.activeShape = polygon;
                    this.canvas.add(polygon);
                }
                this.activeLine = line;
                this.pointArray.push(circle);
                this.lineArray.push(line);
                this.canvas.add(line);
                this.canvas.add(circle);
                this.canvas.selection = false;
            },
            generatePolygon: (pointArray) => {
                const points = [];
                const id = uuid();
                pointArray.forEach((point) => {
                    points.push({
                        x: point.left,
                        y: point.top,
                    });
                    this.canvas.remove(point);
                });
                this.lineArray.forEach((line) => {
                    this.canvas.remove(line);
                });
                this.canvas.remove(this.activeShape).remove(this.activeLine);
                const option = {
                    id,
                    points,
                    type: 'polygon',
                    stroke: 'rgba(0, 0, 0, 1)',
                    strokeWidth: 3,
                    strokeDashArray: [10, 5],
                    fill: 'rgba(255, 255, 255, 0)',
                    opacity: 1,
                };
                this.handlers.add(option, false);
                this.activeLine = null;
                this.activeShape = null;
                this.polygonMode = false;
                this.canvas.selection = true;
            },
        },
        line: {

        },
    }

    events = {
        object: {
            mousedown: (opt) => {
                console.log('objectmousedown', opt);
            },
            mouseover: (opt) => {
                console.log('objectmouseover', opt);
            },
            mouseout: (opt) => {
                console.log('objectmouseout', opt);
            },
        },
        modified: (opt) => {
            const { onModified } = this.props;
            if (onModified) {
                const { target } = opt;
                if (!target) {
                    return;
                }
                onModified(opt.target);
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
            const { zoom, onZoom } = this.props;
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
                if (onZoom) {
                    onZoom(zoomRatio);
                }
            }
        },
        mousedown: (opt) => {
            if (this.polygonMode) {
                if (opt.target && this.pointArray.length && opt.target.id === this.pointArray[0].id) {
                    this.drawingHandlers.polygon.generatePolygon(this.pointArray);
                } else {
                    this.drawingHandlers.polygon.addPoint(opt);
                }
            }
        },
        mousemove: (opt) => {
            if (this.activeLine && this.activeLine.class === 'line') {
                const pointer = this.canvas.getPointer(opt.e);
                this.activeLine.set({ x2: pointer.x, y2: pointer.y });
                const points = this.activeShape.get('points');
                points[this.pointArray.length] = {
                    x: pointer.x,
                    y: pointer.y,
                };
                this.activeShape.set({
                    points,
                });
                this.canvas.renderAll();
            }
            this.canvas.renderAll();
        },
        selection: (opt) => {
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(opt);
            }
        },
        resize: (currentWidth, currentHeight, nextWidth, nextHeight) => {
            this.canvas.setWidth(nextWidth).setHeight(nextHeight);
            if (this.props.editable) {
                this.canvas.centerObject(this.workarea);
                this.workarea.setCoords();
            }
            this.ratio = nextWidth / nextHeight;
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
            } else if (e.code === 'Esc') {
                if (this.polygonMode) {
                    this.drawingHandlers.finishDraw();
                }
            }
        },
    }

    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    state = {
        id: `id_${uuid()}`,
        clipboard: null,
    }

    componentDidMount() {
        const { id } = this.state;
        const { editable, width, height } = this.props;
        this.canvas = new fabric.Canvas(id, {
            preserveObjectStacking: true,
            width,
            height,
            backgroundColor: '#f3f3f3',
            selection: editable,

        });
        if (editable) {
            this.workarea = new fabric.Image(null, {
                lockScalingX: true,
                lockScalingY: true,
                backgroundColor: '#fff',
                width: canvasSize.width,
                height: canvasSize.height,
                hasBorders: false,
                hasControls: false,
                selectable: false,
                lockMovementX: true,
                lockMovementY: true,
                hoverCursor: 'default',
                name: '',
                id: 'workarea',
                type: 'image',
            });
            this.canvas.add(this.workarea);
            this.canvas.centerObject(this.workarea);
            const { modified, mousewheel, mousedown, mousemove, selection } = this.events;
            this.canvas.on({
                'object:modified': modified,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
            });
            this.attachEventListener();
        }
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
        this.canvas.wrapperEl.tabIndex = 1000;
        document.addEventListener('keydown', this.events.keydown, false);
        document.addEventListener('paste', this.events.paste, false);
    }

    detachEventListener = () => {
        document.removeEventListener('keydown', this.events.keydown);
        document.removeEventListener('paste', this.events.paste);
    }

    render() {
        const { id } = this.state;
        return (
            <div
                ref={this.container}
                id="rde-canvas"
                className="rde-canvas"
            >
                <canvas id={id} />
            </div>
        );
    }
}

export default Canvas;
