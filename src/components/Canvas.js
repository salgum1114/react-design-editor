import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { notification } from 'antd';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import debounce from 'lodash/debounce';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';
import interact from 'interactjs';
import anime from 'animejs';

import CanvasObjects from './canvas/CanvasObjects';

notification.config({
    top: 80,
    duration: 2,
});

const defaultOptions = {
    action: {},
    tooltip: {
        enabled: true,
    },
    animation: {
        type: 'none',
    },
};

const workareaOption = {
    width: 600,
    height: 400,
    workareaWidth: 600,
    workareaHeight: 400,
    lockScalingX: true,
    lockScalingY: true,
    scaleX: 1,
    scaleY: 1,
    backgroundColor: '#fff',
    hasBorders: false,
    hasControls: false,
    selectable: false,
    lockMovementX: true,
    lockMovementY: true,
    hoverCursor: 'default',
    name: '',
    id: 'workarea',
    type: 'image',
    layout: 'fixed', // fixed, responsive, fullscreen
    action: {},
    tooltip: {
        enabled: true,
    },
};

class Canvas extends Component {
    static propsTypes = {
        fabricObjects: PropTypes.object,
        editable: PropTypes.bool,
        width: PropTypes.width,
        height: PropTypes.height,
        tooltip: PropTypes.any,
        zoom: PropTypes.bool,
        propertiesToInclude: PropTypes.array,
        onModified: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onSelect: PropTypes.func,
        onZoom: PropTypes.func,
        onTooltip: PropTypes.func,
        onAction: PropTypes.func,
    }

    static defaultProps = {
        editable: true,
        width: 300,
        height: 150,
        tooltip: null,
        zoom: true,
        propertiesToInclude: [],
    }

    handlers = {
        centerObject: (obj, centered) => {
            if (centered) {
                this.canvas.centerObject(obj);
                obj.setCoords();
            } else {
                this.handlers.setByObject(obj, 'left', obj.left - (obj.width / 2));
                this.handlers.setByObject(obj, 'top', obj.top - (obj.height / 2));
            }
        },
        add: (obj, centered = true) => {
            const { editable } = this.props;
            const option = {
                hasControls: editable,
                hasBorders: editable,
                selection: editable,
                lockMovementX: !editable,
                lockMovementY: !editable,
                hoverCursor: !editable ? 'pointer' : 'move',
            };
            if (obj.type === 'i-text') {
                option.editable = false;
            } else {
                option.editable = editable;
            }
            if (editable && this.workarea.layout === 'fullscreen') {
                option.scaleX = this.workarea.scaleX;
                option.scaleY = this.workarea.scaleY;
            }
            const newOption = Object.assign({}, option, obj);
            if (obj.type === 'group') {
                const objects = this.handlers.addGroup(newOption);
                const groupOption = Object.assign({}, newOption, { objects });
                if (obj.type === 'image') {
                    this.handlers.addImage(newOption, centered);
                    return;
                }
                if (this.handlers.isElementType(obj.type)) {
                    this.handlers.addElement(newOption, centered);
                    return;
                }
                const createdObj = this.fabricObjects[obj.type].create({ ...groupOption });
                if (!editable && !this.handlers.isElementType(obj.type)) {
                    createdObj.on('mousedown', this.eventHandlers.object.mousedown);
                }
                this.canvas.add(createdObj);
                if (obj.type !== 'polygon' && editable) {
                    this.handlers.centerObject(createdObj, centered);
                }
                if (createdObj.animation && createdObj.animation.autoplay) {
                    this.animationHandlers.play(createdObj.id);
                }
                const { onAdd } = this.props;
                if (onAdd && editable) {
                    onAdd(createdObj);
                }
                return createdObj;
            }
            if (obj.type === 'image') {
                this.handlers.addImage(newOption, centered);
                return;
            }
            if (this.handlers.isElementType(obj.type)) {
                this.handlers.addElement(newOption, centered);
                return;
            }
            const createdObj = this.fabricObjects[obj.type].create({ ...newOption });
            if (!editable && !this.handlers.isElementType(obj.type)) {
                createdObj.on('mousedown', this.eventHandlers.object.mousedown);
            }
            this.canvas.add(createdObj);
            if (obj.type !== 'polygon' && editable) {
                this.handlers.centerObject(createdObj, centered);
            }
            if (createdObj.animation && createdObj.animation.autoplay) {
                this.animationHandlers.play(createdObj.id);
            }
            const { onAdd } = this.props;
            if (onAdd && editable) {
                onAdd(createdObj);
            }
            return createdObj;
        },
        addGroup: (obj) => {
            return obj.objects.map((child) => {
                return this.handlers.add(child);
            });
        },
        addImage: (obj, centered = true) => {
            const { editable } = this.props;
            const image = new Image();
            const { src, file, ...otherOption } = obj;
            const createImage = (img) => {
                const createdObj = new fabric.Image(img, {
                    src,
                    ...otherOption,
                    ...defaultOptions,
                });
                if (!editable) {
                    createdObj.on('mousedown', this.eventHandlers.object.mousedown);
                }
                this.canvas.add(createdObj);
                if (editable) {
                    this.handlers.centerObject(createdObj, centered);
                }
                const { onAdd } = this.props;
                if (onAdd && editable) {
                    onAdd(createdObj);
                }
            };
            if (src) {
                image.onload = () => {
                    createImage(image);
                };
                image.src = src;
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                image.onload = () => {
                    createImage(image);
                };
                image.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        addElement: (obj, centered = true) => {
            const { canvas } = this;
            const { editable } = this.props;
            const { src, file, code, ...otherOption } = obj;
            const createdObj = new fabric.Rect({
                src,
                file,
                code,
                ...otherOption,
                ...defaultOptions,
                fill: 'rgba(255, 255, 255, 0)',
                stroke: 'rgba(255, 255, 255, 0)',
            });
            if (!editable) {
                createdObj.on('mousedown', this.eventHandlers.object.mousedown);
            }
            canvas.add(createdObj);
            if (src || file || code) {
                if (obj.type === 'video') {
                    this.videoHandlers.set(createdObj, src || file);
                } else {
                    this.elementHandlers.set(createdObj, src || code);
                }
            }
            if (editable) {
                this.handlers.centerObject(createdObj, centered);
            }
            const { onAdd } = this.props;
            if (onAdd && editable) {
                onAdd(createdObj);
            }
        },
        remove: () => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            if (activeObject.type !== 'activeSelection') {
                this.canvas.discardActiveObject();
                if (this.handlers.isElementType(activeObject.type)) {
                    this.elementHandlers.removeById(activeObject.id);
                    this.elementHandlers.removeStyleById(activeObject.id);
                    this.elementHandlers.removeScriptById(activeObject.id);
                }
                this.canvas.remove(activeObject);
            } else {
                const { _objects: activeObjects } = activeObject;
                this.canvas.discardActiveObject();
                activeObjects.forEach((obj) => {
                    if (this.handlers.isElementType(obj.type)) {
                        this.elementHandlers.removeById(obj.id);
                        this.elementHandlers.removeStyleById(obj.id);
                        this.elementHandlers.removeScriptById(obj.id);
                    }
                    this.canvas.remove(obj);
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
                if (this.handlers.isElementType(findObject.type)) {
                    this.elementHandlers.removeById(findObject.id);
                    this.elementHandlers.removeStyleById(findObject.id);
                    this.elementHandlers.removeScriptById(findObject.id);
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
            const { propertiesToInclude } = this.props;
            this.canvas.getActiveObject().clone((cloned) => {
                this.setState({
                    clipboard: cloned,
                });
            }, propertiesToInclude);
        },
        paste: () => {
            const { onAdd, propertiesToInclude } = this.props;
            const { clipboard } = this.state;
            if (!clipboard) {
                return false;
            }
            clipboard.clone((clonedObj) => {
                this.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    id: uuid(),
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
                const newClipboard = clipboard.set({
                    top: clonedObj.top,
                    left: clonedObj.left,
                });
                this.setState({
                    clipboard: newClipboard,
                });
                this.canvas.setActiveObject(clonedObj);
                this.canvas.requestRenderAll();
            }, propertiesToInclude);
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
        setObject: (option) => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            Object.keys(option).forEach((key) => {
                if (option[key] !== activeObject[key]) {
                    activeObject.set(key, option[key]);
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
            if (!obj) {
                return;
            }
            obj.set(key, value);
            obj.setCoords();
            this.canvas.requestRenderAll();
            const { onModified } = this.props;
            if (onModified) {
                onModified(obj);
            }
        },
        setById: (id, key, value) => {
            const findObject = this.handlers.findById(id);
            this.handlers.setByObject(findObject, key, value);
        },
        setShadow: (key, value) => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            activeObject.setShadow(value);
            this.canvas.requestRenderAll();
            const { onModified } = this.props;
            if (onModified) {
                onModified(activeObject);
            }
        },
        loadImage: (obj, src) => {
            fabric.util.loadImage(src, (source) => {
                if (obj.type !== 'image') {
                    obj.setPatternFill({
                        source,
                        repeat: 'repeat',
                    });
                    obj.setCoords();
                    this.canvas.renderAll();
                    return;
                }
                obj.setElement(source);
                obj.setCoords();
                this.canvas.renderAll();
            });
        },
        setImage: (obj, src) => {
            if (typeof src === 'string') {
                this.handlers.loadImage(obj, src);
                obj.set('file', null);
                obj.set('src', src);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.handlers.loadImage(obj, e.target.result);
                    obj.set('file', src);
                    obj.set('src', null);
                };
                reader.readAsDataURL(src);
            }
        },
        setImageById: (id, source) => {
            const findObject = this.handlers.findById(id);
            this.handlers.setImage(findObject, source);
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
        allSelect: () => {
            const { canvas } = this;
            canvas.discardActiveObject();
            const filteredObjects = canvas.getObjects().filter((obj) => {
                if (obj.id === 'workarea') {
                    return false;
                }
                if (this.handlers.isElementType(obj.type)) {
                    return false;
                }
                if (obj.lock) {
                    return false;
                }
                return true;
            });
            if (!filteredObjects.length) {
                return;
            }
            if (filteredObjects.length === 1) {
                canvas.setActiveObject(filteredObjects[0]);
                canvas.renderAll();
                return;
            }
            const activeSelection = new fabric.ActiveSelection(filteredObjects, {
                canvas,
            });
            canvas.setActiveObject(activeSelection);
            canvas.renderAll();
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
        originScaleToResize: (obj, width, height) => {
            if (obj.id === 'workarea') {
                this.handlers.setById(obj.id, 'workareaWidth', obj.width);
                this.handlers.setById(obj.id, 'workareaHeight', obj.height);
            }
            this.handlers.setById(obj.id, 'scaleX', width / obj.width);
            this.handlers.setById(obj.id, 'scaleY', height / obj.height);
        },
        scaleToResize: (width, height) => {
            const activeObject = this.canvas.getActiveObject();
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
            let prevLeft;
            let prevTop;
            json.forEach((obj) => {
                if (obj.id === 'workarea') {
                    prevLeft = obj.left;
                    prevTop = obj.top;
                    this.workarea.set(obj);
                    this.canvas.centerObject(this.workarea);
                    this.workareaHandlers.setImage(obj.src);
                    this.workarea.setCoords();
                    return;
                }
                const canvasWidth = this.canvas.getWidth();
                const canvasHeight = this.canvas.getHeight();
                const { width, height, scaleX, scaleY, layout, left, top } = this.workarea;
                if (layout === 'fullscreen') {
                    const leftRatio = canvasWidth / (width * scaleX);
                    const topRatio = canvasHeight / (height * scaleY);
                    obj.left *= leftRatio;
                    obj.top *= topRatio;
                    obj.scaleX *= leftRatio;
                    obj.scaleY *= topRatio;
                } else {
                    const diffLeft = left - prevLeft;
                    const diffTop = top - prevTop;
                    obj.left += diffLeft;
                    obj.top += diffTop;
                }
                if (this.handlers.isElementType(obj.type)) {
                    obj.id = uuid();
                }
                this.handlers.add(obj, false);
                this.canvas.renderAll();
            });
            this.canvas.setZoom(1);
            if (callback) {
                callback(this.canvas);
            }
        },
        exportJSON: () => this.canvas.toDatalessJSON(this.props.propertiesToInclude).objects,
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
        bringToFront: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                this.canvas.bringToFront(activeObject);
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            }
        },
        sendBackwards: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                if (this.canvas.getObjects()[1].id === activeObject.id) {
                    return;
                }
                this.canvas.sendBackwards(activeObject);
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            }
        },
        sendToBack: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                this.canvas.sendToBack(activeObject);
                this.canvas.sendToBack(this.canvas.getObjects()[1]);
                const { onModified } = this.props;
                if (onModified) {
                    onModified(activeObject);
                }
            }
        },
        clear: (workarea = false) => {
            const { canvas } = this;
            const ids = canvas.getObjects().reduce((prev, curr) => {
                if (this.handlers.isElementType(curr.type)) {
                    prev.push(curr.id);
                    return prev;
                }
                return prev;
            }, []);
            this.elementHandlers.removeByIds(ids);
            if (workarea) {
                canvas.clear();
            } else {
                canvas.getObjects().forEach((obj) => {
                    if (obj.id !== 'workarea') {
                        canvas.remove(obj);
                    }
                });
            }
        },
        toGroup: () => {
            const { canvas } = this;
            if (!canvas.getActiveObject()) {
                return;
            }
            if (canvas.getActiveObject().type !== 'activeSelection') {
                return;
            }
            const group = canvas.getActiveObject().toGroup();
            group.set({
                id: uuid(),
                name: 'New group',
                ...defaultOptions,
            });
            canvas.renderAll();
        },
        toActiveSelection: () => {
            const { canvas } = this;
            if (!canvas.getActiveObject()) {
                return;
            }
            if (canvas.getActiveObject().type !== 'group') {
                return;
            }
            canvas.getActiveObject().toActiveSelection();
            canvas.renderAll();
        },
        isElementType: (type) => {
            return type === 'video' || type === 'element' || type === 'iframe';
        },
    }

    cropHandlers = {
        validType: () => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return true;
            }
            if (activeObject.type === 'image') {
                return false;
            }
            return true;
        },
        start: () => {
            if (this.cropHandlers.validType()) {
                return;
            }
            this.interactionMode = 'crop';
            this.cropObject = this.canvas.getActiveObject();
            const { left, top } = this.cropObject;
            this.cropRect = new fabric.Rect({
                width: this.cropObject.width,
                height: this.cropObject.height,
                scaleX: this.cropObject.scaleX,
                scaleY: this.cropObject.scaleY,
                originX: 'left',
                originY: 'top',
                left,
                top,
                hasRotatingPoint: false,
                fill: 'rgba(0, 0, 0, 0.2)',
            });
            this.canvas.add(this.cropRect);
            this.canvas.setActiveObject(this.cropRect);
            this.cropObject.selectable = false;
            this.cropObject.evented = false;
            this.canvas.renderAll();
        },
        finish: () => {
            const { left, top, width, height, scaleX, scaleY } = this.cropRect;
            const croppedImg = this.cropObject.toDataURL({
                left: left - this.cropObject.left,
                top: top - this.cropObject.top,
                width: width * scaleX,
                height: height * scaleY,
            });
            this.handlers.setImage(this.cropObject, croppedImg);
            this.cropHandlers.cancel();
        },
        cancel: () => {
            this.interactionMode = 'selection';
            this.cropObject.selectable = true;
            this.cropObject.evented = true;
            this.canvas.setActiveObject(this.cropObject);
            this.canvas.remove(this.cropRect);
            this.cropRect = null;
            // this.cropObject = null;
            this.canvas.renderAll();
        },
        resize: (opt) => {
            const { target, transform: { original, corner } } = opt;
            const { left, top, width, height, scaleX, scaleY } = target;
            const { left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight, scaleX: cropScaleX, scaleY: cropScaleY } = this.cropObject;
            if (corner === 'tl') {
                if (Math.round(cropLeft) > Math.round(left)) { // left
                    const originRight = Math.round(cropLeft + cropWidth);
                    const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                    const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                    target.set({
                        left: cropLeft,
                        scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                    });
                }
                if (Math.round(cropTop) > Math.round(top)) { // top
                    const originBottom = Math.round(cropTop + cropHeight);
                    const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                    const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                    target.set({
                        top: cropTop,
                        scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                    });
                }
            } else if (corner === 'bl') {
                if (Math.round(cropLeft) > Math.round(left)) { // left
                    const originRight = Math.round(cropLeft + cropWidth);
                    const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                    const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                    target.set({
                        left: cropLeft,
                        scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                    });
                }
                if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                    const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                    target.set({
                        top: original.top,
                        scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                    });
                }
            } else if (corner === 'tr') {
                if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                    const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                    target.set({
                        left: original.left,
                        scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                    });
                }
                if (Math.round(cropTop) > Math.round(top)) { // top
                    const originBottom = Math.round(cropTop + cropHeight);
                    const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                    const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                    target.set({
                        top: cropTop,
                        scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                    });
                }
            } else if (corner === 'br') {
                if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                    const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                    target.set({
                        left: original.left,
                        scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                    });
                }
                if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                    const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                    target.set({
                        top: original.top,
                        scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                    });
                }
            } else if (corner === 'ml') {
                if (Math.round(cropLeft) > Math.round(left)) { // left
                    const originRight = Math.round(cropLeft + cropWidth);
                    const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                    const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                    target.set({
                        left: cropLeft,
                        scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                    });
                }
            } else if (corner === 'mt') {
                if (Math.round(cropTop) > Math.round(top)) { // top
                    const originBottom = Math.round(cropTop + cropHeight);
                    const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                    const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                    target.set({
                        top: cropTop,
                        scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                    });
                }
            } else if (corner === 'mb') {
                if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                    const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                    target.set({
                        top: original.top,
                        scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                    });
                }
            } else if (corner === 'mr') {
                if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                    const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                    target.set({
                        left: original.left,
                        scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                    });
                }
            }
        },
        moving: (opt) => {
            const { target } = opt;
            const { left, top, width, height, scaleX, scaleY } = target;
            const { left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight } = this.cropObject.getBoundingRect();
            const movedTop = () => {
                if (Math.round(cropTop) >= Math.round(top)) {
                    target.set({
                        top: cropTop,
                    });
                } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
                    target.set({
                        top: cropTop + cropHeight - (height * scaleY),
                    });
                }
            };
            if (Math.round(cropLeft) >= Math.round(left)) {
                target.set({
                    left: Math.max(left, cropLeft),
                });
                movedTop();
            } else if (Math.round(cropLeft + cropWidth) <= Math.round(left + (width * scaleX))) {
                target.set({
                    left: cropLeft + cropWidth - (width * scaleX),
                });
                movedTop();
            } else if (Math.round(cropTop) >= Math.round(top)) {
                target.set({
                    top: cropTop,
                });
            } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
                target.set({
                    top: cropTop + cropHeight - (height * scaleY),
                });
            }
        },
    }

    modeHandlers = {
        panning: false,
        selection: () => {
            this.interactionMode = 'selection';
            this.canvas.selection = true;
            this.canvas.setCursor('pointer');
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    obj.selectable = true;
                }
            });
            this.canvas.renderAll();
        },
        grab: () => {
            this.interactionMode = 'grab';
            this.canvas.selection = false;
            this.canvas.setCursor('grab');
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    obj.selectable = false;
                }
            });
            this.canvas.renderAll();
        },
        moving: (e) => {
            const delta = new fabric.Point(e.movementX, e.movementY);
            this.canvas.relativePan(delta);
        },
    }

    animationHandlers = {
        play: (id) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            if (findObject.anime) {
                findObject.anime.play();
                return;
            }
            if (findObject.animation.type === 'none') {
                return;
            }
            const instance = this.animationHandlers.getAnimation(findObject);
            if (instance) {
                findObject.set('anime', instance);
                instance.play();
            }
        },
        pause: (id) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            findObject.anime.pause();
        },
        stop: (id) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            this.animationHandlers.initAnimation(findObject);
        },
        initAnimation: (obj) => {
            if (!obj.anime) {
                return;
            }
            anime.remove(obj);
            const option = {
                anime: null,
                hasControls: true,
                lockMovementX: false,
                lockMovementY: false,
                hoverCursor: 'move',
            };
            const { type } = obj.animation;
            if (type === 'fade') {
                Object.assign(option, {
                    opacity: obj.originOpacity,
                    originOpacity: null,
                });
            } else if (type === 'bounce') {
                if (obj.animation.bounce === 'vertical') {
                    Object.assign(option, {
                        top: obj.originTop,
                        originTop: null,
                    });
                } else {
                    Object.assign(option, {
                        left: obj.originLeft,
                        originLeft: null,
                    });
                }
            } else if (type === 'shake') {
                if (obj.animation.shake === 'vertical') {
                    Object.assign(option, {
                        top: obj.originTop,
                        originTop: null,
                    });
                } else {
                    Object.assign(option, {
                        left: obj.originLeft,
                        originLeft: null,
                    });
                }
            } else if (type === 'scaling') {
                Object.assign(option, {
                    scaleX: obj.originScaleX,
                    scaleY: obj.originScaleY,
                    originScaleX: null,
                    originScaleY: null,
                });
            } else if (type === 'rotation') {
                Object.assign(option, {
                    angle: obj.originAngle,
                    originAngle: null,
                });
            } else if (type === 'flash') {
                Object.assign(option, {
                    fill: obj.originFill,
                    stroke: obj.originStroke,
                    originFill: null,
                    origniStroke: null,
                });
            } else {
                console.warn('Not supportes type.');
            }
            obj.set(option);
            this.canvas.renderAll();
        },
        getAnimation: (obj) => {
            const { delay = 100, duration = 100, autoplay = false, loop = false, type, ...other } = obj.animation;
            const option = {
                targets: obj,
                delay,
                loop,
                autoplay,
                duration,
                direction: 'alternate',
                begin: () => {
                    obj.set({
                        hasControls: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        hoverCursor: 'pointer',
                    });
                    this.canvas.renderAll();
                },
                update: (e) => {
                    if (type === 'flash') {
                        // I do not know why it works. Magic code...
                        const fill = e.animations[0].currentValue;
                        const stroke = e.animations[1].currentValue;
                        obj.set('fill', '');
                        obj.set('fill', fill);
                        obj.set('stroke', stroke);
                    }
                    obj.setCoords();
                    this.canvas.renderAll();
                },
                complete: () => {
                    this.animationHandlers.initAnimation(obj);
                },
            };
            if (type === 'fade') {
                const { opacity = 0 } = other;
                obj.set('originOpacity', obj.opacity);
                Object.assign(option, {
                    opacity,
                    easing: 'easeInQuad',
                });
            } else if (type === 'bounce') {
                const { offset = 1 } = other;
                if (other.bounce === 'vertical') {
                    obj.set('originTop', obj.top);
                    Object.assign(option, {
                        top: obj.top + offset,
                        easing: 'easeInQuad',
                    });
                } else {
                    obj.set('originLeft', obj.left);
                    Object.assign(option, {
                        left: obj.left + offset,
                        easing: 'easeInQuad',
                    });
                }
            } else if (type === 'shake') {
                const { offset = 1 } = other;
                if (other.shake === 'vertical') {
                    obj.set('originTop', obj.top);
                    Object.assign(option, {
                        top: obj.top + offset,
                        delay: 0,
                        elasticity: 1000,
                        duration: 500,
                    });
                } else {
                    obj.set('originLeft', obj.left);
                    Object.assign(option, {
                        left: obj.left + offset,
                        delay: 0,
                        elasticity: 1000,
                        duration: 500,
                    });
                }
            } else if (type === 'scaling') {
                const { scale = 1 } = other;
                obj.set('originZoomX', obj.scaleX);
                obj.set('originZoomY', obj.scaleY);
                const scaleX = obj.scaleX * scale;
                const scaleY = obj.scaleY * scale;
                Object.assign(option, {
                    scaleX,
                    scaleY,
                    easing: 'easeInQuad',
                });
            } else if (type === 'rotation') {
                obj.set('originAngle', obj.angle);
                Object.assign(option, {
                    angle: other.angle,
                    easing: 'easeInQuad',
                });
            } else if (type === 'flash') {
                const { fill = obj.fill, stroke = obj.stroke } = other;
                obj.set('originFill', obj.fill);
                obj.set('originStroke', obj.stroke);
                Object.assign(option, {
                    fill,
                    stroke,
                    easing: 'easeInQuad',
                });
            } else {
                console.warn('Not supported type.');
                return;
            }
            return anime(option);
        },
    }

    videoHandlers = {
        play: () => {

        },
        pause: () => {

        },
        stop: () => {

        },
        create: (obj, src) => {
            const { editable } = this.props;
            const { id, autoplay, muted, loop } = obj;
            const { left, top } = obj.getBoundingRect();
            const videoElement = fabric.util.makeElement('video', {
                id,
                autoplay,
                muted,
                loop,
                preload: 'none',
                controls: false,
            });
            const { scaleX, scaleY, angle } = obj;
            const zoom = this.canvas.getZoom();
            const width = obj.width * scaleX * zoom;
            const height = obj.height * scaleY * zoom;
            const video = fabric.util.wrapElement(videoElement, 'div', {
                id: `${obj.id}_container`,
                style: `transform: rotate(${angle}deg);
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left}px;
                        top: ${top}px;
                        position: absolute;`,
            });
            this.container.current.appendChild(video);
            const player = new MediaElementPlayer(obj.id, {
                pauseOtherPlayers: false,
                videoWidth: '100%',
                videoHeight: '100%',
                success: (mediaeElement, originalNode, instance) => {
                    if (editable) {
                        instance.pause();
                    }
                    // https://www.youtube.com/watch?v=bbAQtfoQMp8
                    // console.log(mediaeElement, originalNode, instance);
                },
            });
            player.setPlayerSize(width, height);
            player.setSrc(src.src);
            if (editable) {
                this.elementHandlers.draggable(video, obj);
                video.addEventListener('mousedown', (e) => {
                    this.canvas.setActiveObject(obj);
                    this.canvas.renderAll();
                }, false);
            }
            obj.setCoords();
            obj.set('player', player);
        },
        load: (obj, src) => {
            const { canvas } = this;
            const { editable } = this.props;
            if (editable) {
                this.elementHandlers.removeById(obj.id);
            }
            this.videoHandlers.create(obj, src);
            this.canvas.renderAll();
            fabric.util.requestAnimFrame(function render() {
                canvas.renderAll();
                fabric.util.requestAnimFrame(render);
            });
        },
        set: (obj, src) => {
            let newSrc;
            if (typeof src === 'string') {
                obj.set('file', null);
                obj.set('src', src);
                newSrc = {
                    src,
                };
                this.videoHandlers.load(obj, newSrc);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    obj.set('file', src);
                    obj.set('src', e.target.result);
                    newSrc = {
                        src: e.target.result,
                        type: src.type,
                    };
                    this.videoHandlers.load(obj, newSrc);
                };
                reader.readAsDataURL(src);
            }
        },
    }

    elementHandlers = {
        setById: (id, source) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            if (findObject.type === 'video') {
                this.videoHandlers.set(findObject, source);
            } else if (findObject.type === 'element') {
                this.elementHandlers.set(findObject, source);
            } else if (findObject.type === 'iframe') {
                this.elementHandlers.set(findObject, source);
            }
        },
        set: (obj, source) => {
            if (obj.type === 'iframe') {
                this.elementHandlers.createIFrame(obj, source);
            } else {
                this.elementHandlers.createElement(obj, source);
            }
        },
        createElement: (obj, code) => {
            obj.set('code', code);
            const { editable } = this.props;
            const { left, top } = obj.getBoundingRect();
            const { id, scaleX, scaleY, angle } = obj;
            if (editable) {
                this.elementHandlers.removeById(id);
                this.elementHandlers.removeStyleById(id);
                this.elementHandlers.removeScriptById(id);
            }
            const zoom = this.canvas.getZoom();
            const width = obj.width * scaleX * zoom;
            const height = obj.height * scaleY * zoom;
            const element = fabric.util.makeElement('div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg);
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left}px;
                        top: ${top}px;
                        position: absolute;`,
            });
            const { html, css, js } = code;
            if (code.css && code.css.length) {
                const styleElement = document.createElement('style');
                styleElement.id = `${id}_style`;
                styleElement.type = 'text/css';
                styleElement.innerHTML = css;
                document.head.appendChild(styleElement);
            }
            this.container.current.appendChild(element);
            if (code.js && code.js.length) {
                const script = document.createElement('script');
                script.id = `${id}_script`;
                script.type = 'text/javascript';
                script.innerHTML = js;
                element.appendChild(script);
            }
            element.innerHTML = html;
            if (editable) {
                this.elementHandlers.draggable(element, obj);
                element.addEventListener('mousedown', (e) => {
                    this.canvas.setActiveObject(obj);
                    this.canvas.renderAll();
                }, false);
            }
            obj.setCoords();
        },
        createIFrame: (obj, src) => {
            obj.set('src', src);
            const { editable } = this.props;
            const { id, scaleX, scaleY, angle } = obj;
            if (editable) {
                this.elementHandlers.removeById(id);
            }
            const { left, top } = obj.getBoundingRect();
            const iframeElement = fabric.util.makeElement('iframe', {
                id,
                src,
                width: '100%',
                height: '100%',
            });
            const zoom = this.canvas.getZoom();
            const width = obj.width * scaleX * zoom;
            const height = obj.height * scaleY * zoom;
            const iframe = fabric.util.wrapElement(iframeElement, 'div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg);
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left}px;
                        top: ${top}px;
                        position: absolute;
                        z-index: 100000;`,
            });
            this.container.current.appendChild(iframe);
            if (editable) {
                this.elementHandlers.draggable(iframe, obj);
                iframe.addEventListener('mousedown', (e) => {
                    this.canvas.setActiveObject(obj);
                    this.canvas.renderAll();
                }, false);
            }
            obj.setCoords();
        },
        findScriptById: id => document.getElementById(`${id}_script`),
        findStyleById: id => document.getElementById(`${id}_style`),
        findById: id => document.getElementById(`${id}_container`),
        remove: (el) => {
            if (!el) {
                return;
            }
            this.container.current.removeChild(el);
        },
        removeStyleById: (id) => {
            const style = this.elementHandlers.findStyleById(id);
            if (!style) {
                return;
            }
            document.head.removeChild(style);
        },
        removeScriptById: (id) => {
            const style = this.elementHandlers.findScriptById(id);
            if (!style) {
                return;
            }
            document.head.removeChild(style);
        },
        removeById: (id) => {
            const el = this.elementHandlers.findById(id);
            this.elementHandlers.remove(el);
        },
        removeByIds: (ids) => {
            ids.forEach((id) => {
                this.elementHandlers.removeById(id);
                this.elementHandlers.removeStyleById(id);
                this.elementHandlers.removeScriptById(id);
            });
        },
        setPosition: (el, left, top) => {
            if (!el) {
                return false;
            }
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            el.style.transform = null;
            el.setAttribute('data-x', 0);
            el.setAttribute('data-y', 0);
            return el;
        },
        setSize: (el, width, height) => {
            if (!el) {
                return false;
            }
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            return el;
        },
        setScale: (el, x, y) => {
            if (!el) {
                return false;
            }
            el.style.transform = `scale(${x}, ${y})`;
            return el;
        },
        setZoom: (el, zoom) => {
            if (!el) {
                return false;
            }
            el.style.zoom = zoom;
            return el;
        },
        draggable: (el, obj) => {
            if (!el) {
                return false;
            }
            return interact(el)
                .draggable({
                    restrict: {
                        restriction: 'parent',
                        // elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                    },
                    onmove: (e) => {
                        const { dx, dy, target } = e;
                        // keep the dragged position in the data-x/data-y attributes
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + dy;
                        // translate the element
                        target.style.webkitTransform = `translate(${x}px, ${y}px)`;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        // update the posiion attributes
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                        // update canvas object the position
                        obj.set({
                            left: obj.left + dx,
                            top: obj.top + dy,
                        });
                        obj.setCoords();
                        this.canvas.renderAll();
                    },
                    onend: () => {
                        if (this.props.onSelect) {
                            this.props.onSelect(obj);
                        }
                    },
                });
        },
    }

    workareaHandlers = {
        setLayout: (value) => {
            this.workarea.set('layout', value);
            const { canvas } = this;
            const { _element } = this.workarea;
            let scaleX = 1;
            let scaleY = 1;
            const isFixed = value === 'fixed';
            const isResponsive = value === 'responsive';
            const isFullscreen = value === 'fullscreen';
            if (_element) {
                if (isFixed) {
                    scaleX = this.workarea.workareaWidth / _element.width;
                    scaleY = this.workarea.workareaHeight / _element.height;
                } else if (isResponsive) {
                    scaleX = canvas.getWidth() / _element.width;
                    scaleY = canvas.getHeight() / _element.height;
                    if (_element.height > _element.width) {
                        scaleX = scaleY;
                    } else {
                        scaleY = scaleX;
                    }
                } else {
                    scaleX = canvas.getWidth() / _element.width;
                    scaleY = canvas.getHeight() / _element.height;
                }
            }
            canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    const objScaleX = !isFullscreen ? 1 : scaleX;
                    const objScaleY = !isFullscreen ? 1 : scaleY;
                    const objWidth = obj.width * objScaleX * canvas.getZoom();
                    const objHeight = obj.height * objScaleY * canvas.getZoom();
                    const el = this.elementHandlers.findById(obj.id);
                    this.elementHandlers.setSize(el, objWidth, objHeight);
                    if (obj.player) {
                        obj.player.setPlayerSize(objWidth, objHeight);
                    }
                    obj.set({
                        scaleX: !isFullscreen ? 1 : objScaleX,
                        scaleY: !isFullscreen ? 1 : objScaleY,
                    });
                }
            });
            if (isResponsive) {
                if (_element) {
                    const center = canvas.getCenter();
                    const point = {
                        x: center.left,
                        y: center.top,
                    };
                    this.workarea.set({
                        scaleX: 1,
                        scaleY: 1,
                    });
                    this.zoomHandlers.zoomToPoint(point, scaleX);
                } else {
                    this.workarea.set({
                        width: 0,
                        height: 0,
                    });
                }
                canvas.centerObject(this.workarea);
                canvas.renderAll();
                return;
            }
            if (_element) {
                this.workarea.set({
                    width: _element.width,
                    height: _element.height,
                    scaleX,
                    scaleY,
                });
            } else {
                const width = isFixed ? this.workarea.workareaWidth : this.canvas.getWidth();
                const height = isFixed ? this.workarea.workareaHeight : this.canvas.getHeight();
                this.workarea.set({
                    width,
                    height,
                });
                if (isFixed) {
                    canvas.centerObject(this.workarea);
                } else {
                    this.workarea.set({
                        left: 0,
                        top: 0,
                    });
                }
            }
            canvas.centerObject(this.workarea);
            const center = canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            this.zoomHandlers.zoomToPoint(point, 1);
            canvas.renderAll();
        },
        setResponsiveImage: (src) => {
            const { canvas, workarea, zoomHandlers } = this;
            const { editable } = this.props;
            const imageFromUrl = (source) => {
                fabric.Image.fromURL(source, (img) => {
                    let scaleX = canvas.getWidth() / img.width;
                    let scaleY = canvas.getHeight() / img.height;
                    if (img.height > img.width) {
                        scaleX = scaleY;
                    } else {
                        scaleY = scaleX;
                    }
                    img.set({
                        originX: 'left',
                        originY: 'top',
                    });
                    workarea.set({
                        ...img,
                        selectable: false,
                    });
                    canvas.centerObject(workarea);
                    if (editable) {
                        canvas.getObjects().forEach((obj, index) => {
                            if (index !== 0) {
                                const objWidth = obj.width * scaleX;
                                const objHeight = obj.height * scaleY;
                                const el = this.elementHandlers.findById(obj.id);
                                this.elementHandlers.setSize(el, objWidth, objHeight);
                                if (obj.player) {
                                    obj.player.setPlayerSize(objWidth, objHeight);
                                }
                                obj.set({
                                    scaleX: 1,
                                    scaleY: 1,
                                });
                                obj.setCoords();
                            }
                        });
                    }
                    const center = canvas.getCenter();
                    const point = {
                        x: center.left,
                        y: center.top,
                    };
                    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                    zoomHandlers.zoomToPoint(point, scaleX);
                    canvas.renderAll();
                });
            };
            if (typeof src === 'string') {
                workarea.set({
                    src,
                });
                imageFromUrl(src);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                workarea.set({
                    file: src,
                });
                imageFromUrl(e.target.result);
            };
            reader.readAsDataURL(src);
        },
        setImage: (src) => {
            if (!src) {
                return;
            }
            const { canvas, workarea, zoomHandlers, workareaHandlers } = this;
            const { editable } = this.props;
            if (workarea.layout === 'responsive') {
                workareaHandlers.setResponsiveImage(src);
                return;
            }
            const imageFromUrl = (source) => {
                fabric.Image.fromURL(source, (img) => {
                    let width = canvas.getWidth();
                    let height = canvas.getHeight();
                    if (workarea.layout === 'fixed') {
                        width = workarea.width * workarea.scaleX;
                        height = workarea.height * workarea.scaleY;
                    }
                    let scaleX = width / img.width;
                    let scaleY = height / img.height;
                    img.set({
                        originX: 'left',
                        originY: 'top',
                        scaleX,
                        scaleY,
                    });
                    workarea.set({
                        ...img,
                        selectable: false,
                    });
                    canvas.centerObject(workarea);
                    if (editable) {
                        const { layout } = workarea;
                        canvas.getObjects().forEach((obj, index) => {
                            if (index !== 0) {
                                scaleX = layout !== 'fullscreen' ? 1 : scaleX;
                                scaleY = layout !== 'fullscreen' ? 1 : scaleY;
                                const objWidth = obj.width * scaleX;
                                const objHeight = obj.height * scaleY;
                                const el = this.elementHandlers.findById(obj.id);
                                this.elementHandlers.setSize(el, width, height);
                                if (obj.player) {
                                    obj.player.setPlayerSize(objWidth, objHeight);
                                }
                                obj.set({
                                    scaleX,
                                    scaleY,
                                });
                                obj.setCoords();
                            }
                        });
                    }
                    const center = canvas.getCenter();
                    const point = {
                        x: center.left,
                        y: center.top,
                    };
                    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                    zoomHandlers.zoomToPoint(point, 1);
                    canvas.renderAll();
                });
            };
            if (typeof src === 'string') {
                workarea.set({
                    src,
                });
                imageFromUrl(src);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                workarea.set({
                    file: src,
                });
                imageFromUrl(e.target.result);
            };
            reader.readAsDataURL(src);
        },
    }

    drawingHandlers = {
        initDraw: () => {
            this.interactionMode = 'polygon';
            this.pointArray = [];
            this.lineArray = [];
            this.activeLine = null;
            this.activeShape = null;
        },
        finishDraw: () => {
            this.interactionMode = 'selection';
            this.pointArray.forEach((point) => {
                this.canvas.remove(point);
            });
            this.lineArray.forEach((line) => {
                this.canvas.remove(line);
            });
            this.canvas.remove(this.activeLine);
            this.canvas.remove(this.activeShape);
            this.pointArray = [];
            this.lineArray = [];
            this.activeLine = null;
            this.activeShape = null;
            this.canvas.selection = true;
            this.canvas.renderAll();
        },
        polygon: {
            addPoint: (opt) => {
                const id = uuid();
                const { e, absolutePointer } = opt;
                const { x, y } = absolutePointer;
                const circle = new fabric.Circle({
                    id,
                    radius: 3,
                    fill: '#ffffff',
                    stroke: '#333333',
                    strokeWidth: 0.5,
                    left: x,
                    top: y,
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
                    objectCaching: !this.props.editable,
                };
                this.handlers.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.activeShape = null;
                this.interactionMode = 'selection';
                this.canvas.selection = true;
            },
            // TODO... polygon resize
            createResize: (target, points) => {
                points.forEach((point, index) => {
                    const { x, y } = point;
                    const circle = new fabric.Circle({
                        name: index,
                        radius: 3,
                        fill: '#ffffff',
                        stroke: '#333333',
                        strokeWidth: 0.5,
                        left: x,
                        top: y,
                        hasBorders: false,
                        hasControls: false,
                        originX: 'center',
                        originY: 'center',
                        hoverCursor: 'pointer',
                        parentId: target.id,
                    });
                    this.pointArray.push(circle);
                });
                const group = [target].concat(this.pointArray);
                this.canvas.add(new fabric.Group(group, { type: 'polygon', id: uuid() }));
            },
            removeResize: () => {
                if (this.pointArray) {
                    this.pointArray.forEach((point) => {
                        this.canvas.remove(point);
                    });
                    this.pointArray = [];
                }
            },
            movingResize: (target, e) => {
                const points = target.diffPoints || target.points;
                const diffPoints = [];
                points.forEach((point) => {
                    diffPoints.push({
                        x: point.x + e.movementX,
                        y: point.y + e.movementY,
                    });
                });
                target.set({
                    diffPoints,
                });
                this.canvas.renderAll();
            },
        },
        line: {

        },
    }

    alignmentHandlers = {
        left: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'activeSelection') {
                const activeObjectLeft = -(activeObject.width / 2);
                activeObject.forEachObject((obj) => {
                    obj.set({
                        left: activeObjectLeft,
                    });
                    obj.setCoords();
                    this.canvas.renderAll();
                });
            }
        },
        center: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'activeSelection') {
                activeObject.forEachObject((obj) => {
                    obj.set({
                        left: 0 - (obj.width / 2),
                    });
                    obj.setCoords();
                    this.canvas.renderAll();
                });
            }
        },
        right: () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'activeSelection') {
                const activeObjectLeft = (activeObject.width / 2);
                activeObject.forEachObject((obj) => {
                    obj.set({
                        left: activeObjectLeft - obj.width,
                    });
                    obj.setCoords();
                    this.canvas.renderAll();
                });
            }
        },
    }

    zoomHandlers = {
        zoomToPoint: (point, zoom) => {
            const { onZoom } = this.props;
            this.canvas.zoomToPoint(point, zoom);
            this.canvas.getObjects().forEach((obj) => {
                if (this.handlers.isElementType(obj.type)) {
                    const width = obj.width * obj.scaleX * zoom;
                    const height = obj.height * obj.scaleY * zoom;
                    const el = this.elementHandlers.findById(obj.id);
                    // update the element
                    this.elementHandlers.setSize(el, width, height);
                    const { left, top } = obj.getBoundingRect();
                    this.elementHandlers.setPosition(el, left, top);
                    if (obj.type === 'video' && obj.player) {
                        obj.player.setPlayerSize(width, height);
                    }
                }
            });
            if (onZoom) {
                onZoom(zoom);
            }
        },
        zoomOneToOne: () => {
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            this.zoomHandlers.zoomToPoint(point, 1);
        },
        zoomToFit: () => {
            let scaleX = this.canvas.getWidth() / this.workarea.width;
            const scaleY = this.canvas.getHeight() / this.workarea.height;
            if (this.workarea.height > this.workarea.width) {
                scaleX = scaleY;
            }
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.zoomHandlers.zoomToPoint(point, scaleX);
        },
        zoomIn: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio += 0.01;
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.zoomHandlers.zoomToPoint(point, zoomRatio);
        },
        zoomOut: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio -= 0.01;
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.zoomHandlers.zoomToPoint(point, zoomRatio);
        },
    }

    tooltipHandlers = {
        show: debounce((target) => {
            if (target.tooltip && target.tooltip.enabled) {
                while (this.tooltipRef.current.hasChildNodes()) {
                    this.tooltipRef.current.removeChild(this.tooltipRef.current.firstChild);
                }
                const tooltip = document.createElement('div');
                tooltip.className = 'rde-canvas-tooltip-container';
                let element = target.name;
                if (this.props.onTooltip) {
                    element = this.props.onTooltip(this.tooltipRef, target);
                }
                tooltip.innerHTML = element;
                this.tooltipRef.current.appendChild(tooltip);
                ReactDOM.render(element, tooltip);
                this.tooltipRef.current.classList.remove('tooltip-hidden');
                const zoom = this.canvas.getZoom();
                const { clientHeight } = this.tooltipRef.current;
                const { width, height, scaleX, scaleY } = target;
                const { left, top } = target.getBoundingRect();
                const objWidthDiff = (width * scaleX) * zoom;
                const objHeightDiff = (((height * scaleY) * zoom) / 2) - ((clientHeight / 2) * zoom);
                this.tooltipRef.current.style.left = `${left + objWidthDiff}px`;
                this.tooltipRef.current.style.top = `${top + objHeightDiff}px`;
            }
        }, 100),
        hide: debounce((target) => {
            this.tooltipRef.current.classList.add('tooltip-hidden');
        }, 100),
    }

    guidelineHandlers = {
        init: () => {
            this.ctx = this.canvas.getSelectionContext();
            this.aligningLineOffset = 5;
            this.aligningLineMargin = 4;
            this.aligningLineWidth = 1;
            this.aligningLineColor = 'rgb(255, 0, 0)';
            this.viewportTransform = this.canvas.viewportTransform;
            this.zoom = 1;
            this.verticalLines = [];
            this.horizontalLines = [];
        },
        drawVerticalLine: (coords) => {
            this.guidelineHandlers.drawLine(
                coords.x + 0.5,
                coords.y1 > coords.y2 ? coords.y2 : coords.y1,
                coords.x + 0.5,
                coords.y2 > coords.y1 ? coords.y2 : coords.y1,
            );
        },
        drawHorizontalLine: (coords) => {
            this.guidelineHandlers.drawLine(
                coords.x1 > coords.x2 ? coords.x2 : coords.x1,
                coords.y + 0.5,
                coords.x2 > coords.x1 ? coords.x2 : coords.x1,
                coords.y + 0.5,
            );
        },
        drawLine: (x1, y1, x2, y2) => {
            const { ctx, aligningLineWidth, aligningLineColor, viewportTransform, zoom } = this;
            ctx.save();
            ctx.lineWidth = aligningLineWidth;
            ctx.strokeStyle = aligningLineColor;
            ctx.beginPath();
            ctx.moveTo((x1 * zoom) + viewportTransform[4], (y1 * zoom) + viewportTransform[5]);
            ctx.lineTo((x2 * zoom) + viewportTransform[4], (y2 * zoom) + viewportTransform[5]);
            ctx.stroke();
            ctx.restore();
        },
        isInRange: (v1, v2) => {
            const { aligningLineMargin } = this;
            v1 = Math.round(v1);
            v2 = Math.round(v2);
            for (let i = v1 - aligningLineMargin, len = v1 + aligningLineMargin; i <= len; i++) {
                if (i === v2) {
                    return true;
                }
            }
            return false;
        },
        movingGuidelines: (target) => {
            const canvasObjects = this.canvas.getObjects();
            const activeObjectCenter = target.getCenterPoint();
            const activeObjectLeft = activeObjectCenter.x;
            const activeObjectTop = activeObjectCenter.y;
            const activeObjectBoundingRect = target.getBoundingRect();
            const activeObjectHeight = activeObjectBoundingRect.height / this.viewportTransform[3];
            const activeObjectWidth = activeObjectBoundingRect.width / this.viewportTransform[0];
            let horizontalInTheRange = false;
            let verticalInTheRange = false;
            const { _currentTransform: transform } = this.canvas;
            if (!transform) return;

            // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
            // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

            for (let i = canvasObjects.length; i--;) {
                if (canvasObjects[i] === target) {
                    continue;
                }

                const objectCenter = canvasObjects[i].getCenterPoint();
                const objectLeft = objectCenter.x;
                const objectTop = objectCenter.y;
                const objectBoundingRect = canvasObjects[i].getBoundingRect();
                const objectHeight = objectBoundingRect.height / this.viewportTransform[3];
                const objectWidth = objectBoundingRect.width / this.viewportTransform[0];

                // snap by the horizontal center line
                if (this.guidelineHandlers.isInRange(objectLeft, activeObjectLeft)) {
                    verticalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const y1 = -5000;
                        const y2 = 5000;
                        this.verticalLines.push({
                            x: objectLeft,
                            y1,
                            y2,
                        });
                    } else {
                        this.verticalLines.push({
                            x: objectLeft,
                            y1: (objectTop < activeObjectTop)
                                ? (objectTop - (objectHeight / 2) - this.aligningLineOffset)
                                : (objectTop + (objectHeight / 2) + this.aligningLineOffset),
                            y2: (activeObjectTop > objectTop)
                                ? (activeObjectTop + (activeObjectHeight / 2) + this.aligningLineOffset)
                                : (activeObjectTop - (activeObjectHeight / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
                }

                // snap by the left edge
                if (this.guidelineHandlers.isInRange(objectLeft - (objectWidth / 2), activeObjectLeft - (activeObjectWidth / 2))) {
                    verticalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const y1 = -5000;
                        const y2 = 5000;
                        let x = objectLeft - (objectWidth / 2);
                        if (canvasObjects[i].layout === 'fullscreen') {
                            x = 0;
                        }
                        this.verticalLines.push({
                            x,
                            y1,
                            y2,
                        });
                    } else {
                        this.verticalLines.push({
                            x: objectLeft - (objectWidth / 2),
                            y1: (objectTop < activeObjectTop)
                                ? (objectTop - (objectHeight / 2) - this.aligningLineOffset)
                                : (objectTop + (objectHeight / 2) + this.aligningLineOffset),
                            y2: (activeObjectTop > objectTop)
                                ? (activeObjectTop + (activeObjectHeight / 2) + this.aligningLineOffset)
                                : (activeObjectTop - (activeObjectHeight / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(objectLeft - (objectWidth / 2) + (activeObjectWidth / 2), activeObjectTop), 'center', 'center');
                }

                // snap by the right edge
                if (this.guidelineHandlers.isInRange(objectLeft + (objectWidth / 2), activeObjectLeft + (activeObjectWidth / 2))) {
                    verticalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const y1 = -5000;
                        const y2 = 5000;
                        let x = objectLeft + (objectWidth / 2);
                        if (canvasObjects[i].layout === 'fullscreen') {
                            x = this.canvas.getWidth();
                        }
                        this.verticalLines.push({
                            x,
                            y1,
                            y2,
                        });
                    } else {
                        this.verticalLines.push({
                            x: objectLeft + (objectWidth / 2),
                            y1: (objectTop < activeObjectTop)
                                ? (objectTop - (objectHeight / 2) - this.aligningLineOffset)
                                : (objectTop + (objectHeight / 2) + this.aligningLineOffset),
                            y2: (activeObjectTop > objectTop)
                                ? (activeObjectTop + (activeObjectHeight / 2) + this.aligningLineOffset)
                                : (activeObjectTop - (activeObjectHeight / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(objectLeft + (objectWidth / 2) - (activeObjectWidth / 2), activeObjectTop), 'center', 'center');
                }

                // snap by the vertical center line
                if (this.guidelineHandlers.isInRange(objectTop, activeObjectTop)) {
                    horizontalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const x1 = -5000;
                        const x2 = 5000;
                        this.horizontalLines.push({
                            y: objectTop,
                            x1,
                            x2,
                        });
                    } else {
                        this.horizontalLines.push({
                            y: objectTop,
                            x1: (objectLeft < activeObjectLeft)
                                ? (objectLeft - (objectWidth / 2) - this.aligningLineOffset)
                                : (objectLeft + (objectWidth / 2) + this.aligningLineOffset),
                            x2: (activeObjectLeft > objectLeft)
                                ? (activeObjectLeft + (activeObjectWidth / 2) + this.aligningLineOffset)
                                : (activeObjectLeft - (activeObjectWidth / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
                }

                // snap by the top edge
                if (this.guidelineHandlers.isInRange(objectTop - (objectHeight / 2), activeObjectTop - (activeObjectHeight / 2))) {
                    horizontalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const x1 = -5000;
                        const x2 = 5000;
                        let y = objectTop - (objectHeight / 2);
                        if (canvasObjects[i].layout === 'fullscreen') {
                            y = 0;
                        }
                        this.horizontalLines.push({
                            y,
                            x1,
                            x2,
                        });
                    } else {
                        this.horizontalLines.push({
                            y: objectTop - (objectHeight / 2),
                            x1: (objectLeft < activeObjectLeft)
                                ? (objectLeft - (objectWidth / 2) - this.aligningLineOffset)
                                : (objectLeft + (objectWidth / 2) + this.aligningLineOffset),
                            x2: (activeObjectLeft > objectLeft)
                                ? (activeObjectLeft + (activeObjectWidth / 2) + this.aligningLineOffset)
                                : (activeObjectLeft - (activeObjectWidth / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - (objectHeight / 2) + (activeObjectHeight / 2)), 'center', 'center');
                }

                // snap by the bottom edge
                if (this.guidelineHandlers.isInRange(objectTop + (objectHeight / 2), activeObjectTop + (activeObjectHeight / 2))) {
                    horizontalInTheRange = true;
                    if (canvasObjects[i].id === 'workarea') {
                        const x1 = -5000;
                        const x2 = 5000;
                        let y = objectTop + (objectHeight / 2);
                        if (canvasObjects[i].layout === 'fullscreen') {
                            y = this.canvas.getHeight();
                        }
                        this.horizontalLines.push({
                            y,
                            x1,
                            x2,
                        });
                    } else {
                        this.horizontalLines.push({
                            y: objectTop + (objectHeight / 2),
                            x1: (objectLeft < activeObjectLeft)
                                ? (objectLeft - (objectWidth / 2) - this.aligningLineOffset)
                                : (objectLeft + (objectWidth / 2) + this.aligningLineOffset),
                            x2: (activeObjectLeft > objectLeft)
                                ? (activeObjectLeft + (activeObjectWidth / 2) + this.aligningLineOffset)
                                : (activeObjectLeft - (activeObjectWidth / 2) - this.aligningLineOffset),
                        });
                    }
                    target.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + (objectHeight / 2) - (activeObjectHeight / 2)), 'center', 'center');
                }
            }

            if (!horizontalInTheRange) {
                this.horizontalLines.length = 0;
            }

            if (!verticalInTheRange) {
                this.verticalLines.length = 0;
            }
        },
        scalingGuidelines: (target) => {
            // TODO...
        },
    }

    eventHandlers = {
        object: {
            mousedown: (opt) => {
                const { target } = opt;
                if (target && target.action && target.action.enabled) {
                    const { onAction } = this.props;
                    if (onAction) {
                        onAction(this.canvas, target);
                    }
                }
            },
        },
        modified: (opt) => {
            const { onModified } = this.props;
            if (onModified) {
                const { target } = opt;
                if (!target) {
                    return;
                }
                if (target.type === 'circle' && target.parentId) {
                    return;
                }
                onModified(target);
            }
        },
        moving: (opt) => {
            const { target } = opt;
            if (this.interactionMode === 'crop') {
                this.cropHandlers.moving(opt);
            } else {
                this.guidelineHandlers.movingGuidelines(target);
                if (this.handlers.isElementType(target.type)) {
                    const el = this.elementHandlers.findById(target.id);
                    // update the element
                    this.elementHandlers.setPosition(el, target.left, target.top);
                }
            }
        },
        scaling: (opt) => {
            const { target } = opt;
            if (this.interactionMode === 'crop') {
                this.cropHandlers.resize(opt);
            }
            // TODO...this.guidelineHandlers.scalingGuidelines(target);
            if (this.handlers.isElementType(target.type)) {
                const zoom = this.canvas.getZoom();
                const width = target.width * target.scaleX * zoom;
                const height = target.height * target.scaleY * zoom;
                const el = this.elementHandlers.findById(target.id);
                // update the element
                this.elementHandlers.setSize(el, width, height);
                this.elementHandlers.setPosition(el, target.left, target.top);
                if (target.type === 'video' && target.player) {
                    target.player.setPlayerSize(width, height);
                }
            }
        },
        rotating: (opt) => {
            const { target } = opt;
            if (this.handlers.isElementType(target.type)) {
                const el = this.elementHandlers.findById(target.id);
                // update the element
                el.style.transform = `rotate(${target.angle}deg)`;
            }
        },
        arrowmoving: (e) => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            if (e.keyCode === 38) {
                activeObject.set('top', activeObject.top - 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.keyCode === 40) {
                activeObject.set('top', activeObject.top + 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.keyCode === 37) {
                activeObject.set('left', activeObject.left - 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            } else if (e.keyCode === 39) {
                activeObject.set('left', activeObject.left + 2);
                activeObject.setCoords();
                this.canvas.renderAll();
            }
            if (this.props.onModified) {
                this.props.onModified(activeObject);
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
                this.zoomHandlers.zoomToPoint(new fabric.Point(this.canvas.width / 2, this.canvas.height / 2), zoomRatio);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                if (onZoom) {
                    onZoom(zoomRatio);
                }
            }
        },
        mousedown: (opt) => {
            if (this.interactionMode === 'grab') {
                this.modeHandlers.panning = true;
            }
            const { onSelect, editable } = this.props;
            const { target } = opt;
            if (editable) {
                this.viewportTransform = this.canvas.viewportTransform;
                this.zoom = this.canvas.getZoom();
                if (this.interactionMode === 'selection') {
                    if (onSelect) {
                        onSelect(target);
                    }
                }
                if (this.interactionMode === 'polygon') {
                    if (target && this.pointArray.length && target.id === this.pointArray[0].id) {
                        this.drawingHandlers.polygon.generatePolygon(this.pointArray);
                    } else {
                        this.drawingHandlers.polygon.addPoint(opt);
                    }
                }
            }
        },
        mousemove: (opt) => {
            if (this.interactionMode === 'grab' && this.modeHandlers.panning) {
                this.modeHandlers.moving(opt.e);
            }
            if (!this.props.editable && opt.target) {
                if (this.handlers.isElementType(opt.target.type)) {
                    return false;
                }
                if (opt.target.id !== 'workarea') {
                    this.tooltipHandlers.show(opt.target);
                } else {
                    this.tooltipHandlers.hide(opt.target);
                }
            }
            if (this.interactionMode === 'polygon') {
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
            }
            this.canvas.renderAll();
        },
        mouseup: (opt) => {
            this.verticalLines.length = 0;
            this.horizontalLines.length = 0;
            this.canvas.renderAll();
            if (this.modeHandlers.mode === 'grab') {
                this.modeHandlers.panning = false;
            }
        },
        selection: (opt) => {
            const { onSelect } = this.props;
            const { target } = opt;
            if (onSelect) {
                onSelect(target);
            }
        },
        beforeRender: (opt) => {
            this.canvas.clearContext(this.canvas.contextTop);
        },
        afterRender: (opt) => {
            for (let i = this.verticalLines.length; i--;) {
                this.guidelineHandlers.drawVerticalLine(this.verticalLines[i]);
            }
            for (let i = this.horizontalLines.length; i--;) {
                this.guidelineHandlers.drawHorizontalLine(this.horizontalLines[i]);
            }
            this.verticalLines.length = 0;
            this.horizontalLines.length = 0;
        },
        resize: (currentWidth, currentHeight, nextWidth, nextHeight) => {
            this.currentWidth = currentWidth;
            this.canvas.setWidth(nextWidth).setHeight(nextHeight);
            if (!this.workarea) {
                return;
            }
            const diffWidth = (nextWidth / 2) - (currentWidth / 2);
            const diffHeight = (nextHeight / 2) - (currentHeight / 2);
            if (this.workarea.layout === 'fixed') {
                this.canvas.centerObject(this.workarea);
                this.workarea.setCoords();
                this.canvas.getObjects().forEach((obj, index) => {
                    if (index !== 0) {
                        const left = obj.left + diffWidth;
                        const top = obj.top + diffHeight;
                        const el = this.elementHandlers.findById(obj.id);
                        this.elementHandlers.setPosition(el, left, top);
                        obj.set({
                            left,
                            top,
                        });
                        obj.setCoords();
                    }
                });
                this.canvas.renderAll();
                return;
            }
            let scaleX = nextWidth / this.workarea.width;
            const scaleY = nextHeight / this.workarea.height;
            if (this.workarea.layout === 'responsive') {
                if (this.workarea.height > this.workarea.width) {
                    scaleX = scaleY;
                }
                const deltaPoint = new fabric.Point(diffWidth, diffHeight);
                this.canvas.relativePan(deltaPoint);
                const center = this.canvas.getCenter();
                const point = {
                    x: center.left,
                    y: center.top,
                };
                this.zoomHandlers.zoomToPoint(point, scaleX);
                this.canvas.getObjects().forEach((obj) => {
                    if (this.handlers.isElementType(obj.type)) {
                        const width = obj.width * obj.scaleX * scaleX;
                        const height = obj.height * obj.scaleY * scaleX;
                        const { left, top } = obj.getBoundingRect();
                        const el = this.elementHandlers.findById(obj.id);
                        this.elementHandlers.setSize(el, width, height);
                        this.elementHandlers.setPosition(el, left, top);
                        if (obj.player) {
                            obj.player.setPlayerSize(width, height);
                        }
                    }
                });
                this.canvas.renderAll();
                return;
            }
            const diffScaleX = nextWidth / (this.workarea.width * this.workarea.scaleX);
            const diffScaleY = nextHeight / (this.workarea.height * this.workarea.scaleY);
            this.workarea.set({
                scaleX,
                scaleY,
            });
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    const left = obj.left * diffScaleX;
                    const top = obj.top * diffScaleY;
                    const width = obj.width * scaleX;
                    const height = obj.height * scaleY;
                    const el = this.elementHandlers.findById(obj.id);
                    this.elementHandlers.setSize(el, width, height);
                    if (obj.player) {
                        obj.player.setPlayerSize(width, height);
                    }
                    this.elementHandlers.setPosition(el, left, top);
                    const newScaleX = obj.scaleX * diffScaleX;
                    const newScaleY = obj.scaleY * diffScaleY;
                    obj.set({
                        scaleX: newScaleX,
                        scaleY: newScaleY,
                        left,
                        top,
                    });
                    obj.setCoords();
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
        },
        keydown: (e) => {
            if (this.canvas.wrapperEl !== document.activeElement) {
                return false;
            }
            if (e.keyCode === 46) {
                this.handlers.remove();
            } else if (e.code.includes('Arrow')) {
                this.eventHandlers.arrowmoving(e);
            } else if (e.ctrlKey && e.keyCode === 65) {
                e.preventDefault();
                this.handlers.allSelect();
            } else if (e.ctrlKey && e.keyCode === 67) {
                e.preventDefault();
                this.handlers.copy();
            }
            // else if (e.ctrlKey && e.keyCode === 86) {
            //     e.preventDefault();
            //     console.log('tewqttweq');
            //     this.handlers.paste();
            // } 
            else if (e.keyCode === 27) {
                if (this.interactionMode === 'polygon') {
                    this.drawingHandlers.finishDraw();
                }
            }
        },
    }

    constructor(props) {
        super(props);
        this.fabricObjects = CanvasObjects(props.fabricObjects);
        this.container = React.createRef();
        this.tooltipRef = React.createRef();
    }

    state = {
        id: uuid(),
        clipboard: null,
    }

    componentDidMount() {
        const { id } = this.state;
        const { editable, width, height } = this.props;
        this.canvas = new fabric.Canvas(`canvas_${id}`, {
            preserveObjectStacking: true,
            width,
            height,
            backgroundColor: '#f3f3f3',
            selection: editable,
        });
        this.workarea = new fabric.Image(null, {
            ...workareaOption,
        });
        this.canvas.add(this.workarea);
        this.canvas.centerObject(this.workarea);
        const { modified, moving, scaling, rotating, mousewheel, mousedown, mousemove, mouseup, selection, beforeRender, afterRender } = this.eventHandlers;
        if (editable) {
            this.interactionMode = 'selection';
            this.guidelineHandlers.init();
            this.canvas.on({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:moving': moving,
                'object:rotating': rotating,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:up': mouseup,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
                'before:render': beforeRender,
                'after:render': afterRender,
            });
            this.attachEventListener();
        } else {
            this.canvas.on({
                'mouse:move': mousemove,
            });
        }
    }

    componentDidUpdate(prevProps) {
        const { width: currentWidth, height: currentHeight } = this.props;
        const { width: prevWidth, height: prevHeight } = prevProps;
        if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
            this.eventHandlers.resize(prevWidth, prevHeight, currentWidth, currentHeight);
        }
    }

    componentWillUnmount() {
        this.detachEventListener();
    }

    attachEventListener = () => {
        // if add canvas wrapper element event, tabIndex = 1000;
        this.canvas.wrapperEl.tabIndex = 1000;
        document.addEventListener('keydown', this.eventHandlers.keydown, false);
        document.addEventListener('paste', this.eventHandlers.paste, false);
    }

    detachEventListener = () => {
        document.removeEventListener('keydown', this.eventHandlers.keydown);
        document.removeEventListener('paste', this.eventHandlers.paste);
    }

    render() {
        const { editable } = this.props;
        const { id } = this.state;
        const tooltipRender = editable ? null : (
            <div
                ref={this.tooltipRef}
                id={`${id}_tooltip`}
                className="rde-canvas-tooltip tooltip-hidden"
            />
        );
        return (
            <div
                ref={this.container}
                id="rde-canvas"
                className="rde-canvas"
            >
                <canvas id={`canvas_${id}`} />
                {tooltipRender}
            </div>
        );
    }
}

export default Canvas;
