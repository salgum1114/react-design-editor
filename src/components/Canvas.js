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

import CanvasObjects from './canvas/CanvasObjects';

notification.config({
    top: 80,
    duration: 2,
});

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
            const newOption = Object.assign({}, obj, option);
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
                createdObj.on('mousedown', this.events.object.mousedown);
            }
            this.canvas.add(createdObj);
            if (obj.type !== 'polygon' && editable) {
                this.handlers.centerObject(createdObj, centered);
            }
            const { onAdd } = this.props;
            if (onAdd && editable) {
                onAdd(createdObj);
            }
        },
        addImage: (obj, centered = true) => {
            const { editable } = this.props;
            const image = new Image();
            const { src, file, ...otherOption } = obj;
            const defaultOptions = {
                action: {},
                tooltip: {
                    enabled: true,
                },
            };
            const createImage = (img) => {
                const createdObj = new fabric.Image(img, {
                    src,
                    ...otherOption,
                    ...defaultOptions,
                });
                if (!editable) {
                    createdObj.on('mousedown', this.events.object.mousedown);
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
            const defaultOptions = {
                action: {},
                tooltip: {
                    enabled: true,
                },
            };
            const { src, file, ...otherOption } = obj;
            const createdObj = new fabric.Rect({
                src,
                file,
                ...otherOption,
                ...defaultOptions,
                fill: 'rgba(255, 255, 255, 0)',
            });
            if (!editable) {
                createdObj.on('mousedown', this.events.object.mousedown);
            }
            canvas.add(createdObj);
            if (src || file) {
                if (obj.type === 'video') {
                    this.videoHandlers.setVideo(createdObj, src || file);
                } else if (obj.type === 'element') {
                    this.elementHandlers.setElement(createdObj, src || file);
                } else {
                    this.elementHandlers.setIFrame(createdObj, src);
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
                }
                this.canvas.remove(activeObject);
            } else {
                const { _objects: activeObjects } = activeObject;
                this.canvas.discardActiveObject();
                activeObjects.forEach((obj) => {
                    if (this.handlers.isElementType(obj.type)) {
                        this.elementHandlers.removeById(obj.id);
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
        loadImage: (obj, src) => {
            if (obj.type === 'image') {
                const newImg = new Image();
                newImg.onload = () => {
                    obj.setElement(newImg);
                    obj.setCoords();
                    this.canvas.renderAll();
                };
                newImg.src = src;
                return;
            }
            fabric.util.loadImage(src, (source) => {
                obj.setPatternFill({
                    source,
                    repeat: 'repeat',
                });
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
            let prevLeft;
            let prevTop;
            json.forEach((obj) => {
                if (obj.id === 'workarea') {
                    prevLeft = obj.left;
                    prevTop = obj.top;
                    this.workarea.set(obj);
                    this.canvas.add(this.workarea);
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
        exportJSON: () => this.canvas.toDatalessJSON(this.props.propertiesToInclude),
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
        clear: () => {
            const { canvas } = this;
            const ids = canvas.getObjects().reduce((prev, curr) => {
                if (this.handlers.isElementType(curr.type)) {
                    prev.push(curr.id);
                    return prev;
                }
                return prev;
            }, []);
            this.elementHandlers.removeByIds(ids);
            canvas.clear();
        },
        isElementType: (type) => {
            return type === 'video' || type === 'element' || type === 'iframe';
        },
    }

    videoHandlers = {
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

                    }
                    // https://www.youtube.com/watch?v=bbAQtfoQMp8
                    console.log(mediaeElement, originalNode, instance);
                },
            });
            player.setPlayerSize(width, height);
            player.setSrc(src.src);
            if (editable) {
                this.elementHandlers.draggable(video, obj);
                video.addEventListener('mousedown', (e) => {
                    this.canvas.setActiveObject(obj);
                }, false);
            }
            obj.setCoords();
            obj.set('player', player);
        },
        loadVideo: (obj, src) => {
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
        setVideo: (obj, src) => {
            let newSrc;
            if (typeof src === 'string') {
                obj.set('file', null);
                obj.set('src', src);
                newSrc = {
                    src,
                };
                this.videoHandlers.loadVideo(obj, newSrc);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    obj.set('file', src);
                    obj.set('src', e.target.result);
                    newSrc = {
                        src: e.target.result,
                        type: src.type,
                    };
                    this.videoHandlers.loadVideo(obj, newSrc);
                };
                reader.readAsDataURL(src);
            }
        },
    }

    elementHandlers = {
        setElementById: (id, source) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            if (findObject.type === 'video') {
                this.videoHandlers.setVideo(findObject, source);
            } else if (findObject.type === 'element') {
                this.elementHandlers.setElement(findObject, source);
            } else if (findObject.type === 'iframe') {
                this.elementHandlers.setIFrame(findObject, source);
            }
        },
        setElement: (obj, src) => {
            const { editable } = this.props;
            const { left, top } = obj.getBoundingRect();
            const { id, scaleX, scaleY, angle } = obj;
            if (editable) {
                this.elementHandlers.removeById(id);
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
            element.innerHTML = src;
            this.container.current.appendChild(element);
            if (editable) {
                this.elementHandlers.draggable(element, obj);
                element.addEventListener('mousedown', (e) => {
                    this.canvas.setActiveObject(obj);
                }, false);
            }
            obj.setCoords();
        },
        setIFrame: (obj, src) => {
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
                        position: absolute;`,
            });
            this.container.current.appendChild(iframe);
            if (editable) {
                this.elementHandlers.draggable(iframe, obj);
                iframe.addEventListener('mousedown', (e) => {
                    console.log(e);
                    this.canvas.setActiveObject(obj);
                }, false);
            }
            obj.setCoords();
        },
        findById: id => document.getElementById(`${id}_container`),
        remove: (el) => {
            if (!el) {
                return;
            }
            this.container.current.removeChild(el);
        },
        removeById: (id) => {
            const el = this.elementHandlers.findById(id);
            this.elementHandlers.remove(el);
        },
        removeByIds: (ids) => {
            ids.forEach((id) => {
                this.elementHandlers.removeById(id);
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
                    zoomHandlers.zoomToPoint(point, scaleX);
                    canvas.renderAll();
                });
            };
            if (typeof source === 'string') {
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
            this.polygonMode = true;
            this.pointArray = [];
            this.lineArray = [];
            this.activeLine = null;
            this.activeShape = null;
        },
        finishDraw: () => {
            this.polygonMode = false;
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
                const { e, absolutePointer } = opt;
                const { x, y } = absolutePointer;
                const circle = new fabric.Circle({
                    id,
                    radius: 5,
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

    alignments = {
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

    tooltip = {
        showTooltip: debounce((target) => {
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
        hiddenTooltip: debounce((target) => {
            this.tooltipRef.current.classList.add('tooltip-hidden');
        }, 100),
    }

    actions = {

    }

    events = {
        object: {
            mousedown: (opt) => {
                const { target } = opt;
                if (target && target.action.enabled) {
                    const { action } = target;
                    if (action.type === 'dashboard') {
                        console.log(opt.target);
                    } else if (action.type === 'url') {
                        if (action.state === 'current') {
                            document.location.href = action.url;
                            return;
                        }
                        window.open(action.url);
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
                onModified(opt.target);
            }
        },
        moving: (opt) => {
            const { target } = opt;
            if (this.handlers.isElementType(target.type)) {
                const el = this.elementHandlers.findById(target.id);
                // update the element
                this.elementHandlers.setPosition(el, target.left, target.top);
            }
        },
        scaling: (opt) => {
            const { target } = opt;
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
            const activeObject = this.handlers.getActiveObject();
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
                this.canvas.zoomToPoint(new fabric.Point(this.canvas.width / 2, this.canvas.height / 2), zoomRatio);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                if (onZoom) {
                    onZoom(zoomRatio);
                }
            }
        },
        mousedown: (opt) => {
            if (!this.polygonMode && this.props.editable) {
                this.props.onSelect(opt.target);
            }
            if (this.polygonMode) {
                if (opt.target && this.pointArray.length && opt.target.id === this.pointArray[0].id) {
                    this.drawingHandlers.polygon.generatePolygon(this.pointArray);
                } else {
                    this.drawingHandlers.polygon.addPoint(opt);
                }
            }
        },
        mousemove: (opt) => {
            if (!this.props.editable && opt.target) {
                if (this.handlers.isElementType(opt.target.type)) {
                    return false;
                }
                if (opt.target.id !== 'workarea') {
                    this.tooltip.showTooltip(opt.target);
                } else {
                    this.tooltip.hiddenTooltip(opt.target);
                }
            }
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
                onSelect(opt.target);
            }
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
            this.canvas.getObjects().forEach((obj, index) => {
                if (index !== 0) {
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
                    obj.set({
                        scaleX,
                        scaleY,
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
            if (!document.activeElement.id.includes('mep')
            && this.canvas.wrapperEl !== document.activeElement) {
                return false;
            }
            if (e.keyCode === 46) {
                this.handlers.remove();
            } else if (e.code.includes('Arrow')) {
                this.events.arrowmoving(e);
            } else if (e.ctrlKey && e.keyCode === 65) {
                e.preventDefault();
                this.handlers.allSelect();
            } else if (e.ctrlKey && e.keyCode === 67) {
                e.preventDefault();
                this.handlers.copy();
            } else if (e.ctrlKey && e.keyCode === 86) {
                e.preventDefault();
                this.handlers.paste();
            } else if (e.code === 27) {
                if (this.polygonMode) {
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
        const { modified, moving, scaling, rotating, mousewheel, mousedown, mousemove, selection } = this.events;
        if (editable) {
            this.canvas.on({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:monvig': moving,
                'object:rotating': rotating,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
            });
            this.attachEventListener();
        } else {
            this.canvas.on({
                'mouse:move': mousemove,
            });
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
