import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import debounce from 'lodash/debounce';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';
import interact from 'interactjs';
import anime from 'animejs';

import CanvasObjects from './CanvasObjects';
import OrthogonalLink from '../workflow/link/OrthogonalLink';
import CurvedLink from '../workflow/link/CurvedLink';
import Arrow from './Arrow';
import { ImageHandler } from './handlers';

import '../../styles/core/tooltip.less';
import '../../styles/core/contextmenu.less';

const defaultCanvasOption = {
    preserveObjectStacking: true,
    width: 300,
    height: 150,
    selection: true,
    defaultCursor: 'default',
    backgroundColor: '#fff',
};

const defaultWorkareaOption = {
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
    link: {},
    tooltip: {
        enabled: false,
    },
    isElement: false,
};

const defaultKeyboardEvent = {
    move: true,
    all: true,
    copy: true,
    paste: true,
    esc: true,
    del: true,
    clipboard: false,
    transaction: true,
};

class Canvas extends Component {
    static propsTypes = {
        fabricObjects: PropTypes.object,
        editable: PropTypes.bool,
        canvasOption: PropTypes.object,
        defaultOptions: PropTypes.object,
        activeSelection: PropTypes.object,
        tooltip: PropTypes.any,
        zoomEnabled: PropTypes.bool,
        minZoom: PropTypes.number,
        maxZoom: PropTypes.number,
        propertiesToInclude: PropTypes.array,
        guidelineOption: PropTypes.obj,
        workareaOption: PropTypes.obj,
        gridOption: PropTypes.obj,
        onModified: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onSelect: PropTypes.func,
        onZoom: PropTypes.func,
        onTooltip: PropTypes.func,
        onLink: PropTypes.func,
        onDblClick: PropTypes.func,
        keyEvent: PropTypes.object,
    }

    static defaultProps = {
        editable: true,
        canvasOption: {
            selection: true,
        },
        defaultOptions: {},
        activeSelection: {
            hasControls: true,
        },
        tooltip: null,
        zoomEnabled: true,
        minZoom: 0,
        maxZoom: 300,
        propertiesToInclude: [],
        workareaOption: {},
        gridOption: {
            enabled: false,
            grid: 10,
            snapToGrid: false,
        },
        guidelineOption: {
            enabled: true,
        },
        keyEvent: {},
    }

    constructor(props) {
        super(props);
        this.fabricObjects = CanvasObjects(props.fabricObjects, props.defaultOptions);
        this.container = React.createRef();
        this.objects = [];
        this.keyEvent = Object.assign({}, defaultKeyboardEvent, props.keyEvent);
    }

    state = {
        id: uuid(),
        clipboard: null,
    }

    componentDidMount() {
        const { id } = this.state;
        const { editable, canvasOption, guidelineOption } = this.props;
        const mergedCanvasOption = Object.assign({}, defaultCanvasOption, canvasOption);
        this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
        this.imageHandler = new ImageHandler({
            canvas: this.canvas,
        });
        this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        this.workareaHandlers.init();
        this.canvas.renderAll();
        this.gridHandlers.init();
        const { modified, moving, moved, scaling, rotating, mousewheel, mousedown, mousemove, mouseup, mouseout, selection, beforeRender, afterRender } = this.eventHandlers;
        if (editable) {
            this.transactionHandlers.init();
            this.interactionMode = 'selection';
            this.panning = false;
            if (guidelineOption.enabled) {
                this.guidelineHandlers.init();
            }
            this.contextmenuRef = document.createElement('div');
            this.contextmenuRef.id = `${id}_contextmenu`;
            this.contextmenuRef.className = 'rde-contextmenu contextmenu-hidden';
            document.body.appendChild(this.contextmenuRef);
            this.canvas.on({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:moving': moving,
                'object:moved': moved,
                'object:rotating': rotating,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:up': mouseup,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
                'before:render': guidelineOption.enabled ? beforeRender : null,
                'after:render': guidelineOption.enabled ? afterRender : null,
            });
        } else {
            this.tooltipRef = document.createElement('div');
            this.tooltipRef.id = `${id}_tooltip`;
            this.tooltipRef.className = 'rde-tooltip tooltip-hidden';
            document.body.appendChild(this.tooltipRef);
            this.canvas.on({
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:out': mouseout,
                'mouse:up': mouseup,
                'mouse:wheel': mousewheel,
            });
        }
        this.attachEventListener();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.canvasOption) !== JSON.stringify(prevProps.canvasOption)) {
            const { canvasOption: { width: currentWidth, height: currentHeight } } = this.props;
            const { canvasOption: { width: prevWidth, height: prevHeight } } = prevProps;
            if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
                this.eventHandlers.resize(prevWidth, prevHeight, currentWidth, currentHeight);
            }
            this.canvas.setBackgroundColor(this.props.canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
            if (typeof this.props.canvasOption.selection === 'undefined') {
                this.canvas.selection = true;
            } else {
                this.canvas.selection = this.props.canvasOption.selection;
            }
        }
        if (JSON.stringify(this.props.keyEvent) !== JSON.stringify(prevProps.keyEvent)) {
            this.keyEvent = Object.assign({}, defaultKeyboardEvent, this.props.keyEvent);
        }
        if (JSON.stringify(this.props.fabricObjects) !== JSON.stringify(prevProps.fabricObjects)) {
            this.fabricObjects = CanvasObjects(this.props.fabricObjects);
        } else if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption)) {
            this.workarea.set({
                ...this.props.workareaOption,
            });
        } else if (JSON.stringify(this.props.guidelineOption) !== JSON.stringify(prevProps.guidelineOption)) {
            if (this.props.guidelineOption.enabled) {
                this.canvas.on({
                    'before:render': this.eventHandlers.beforeRender,
                    'after:render': this.eventHandlers.afterRender,
                });
            } else {
                this.canvas.off({
                    'before:render': this.eventHandlers.beforeRender,
                    'after:render': this.eventHandlers.afterRender,
                });
            }
        }
    }

    componentWillUnmount() {
        this.detachEventListener();
        const { editable } = this.props;
        const { modified, moving, moved, scaling, rotating, mousewheel, mousedown, mousemove, mouseup, mouseout, selection, beforeRender, afterRender } = this.eventHandlers;
        if (editable) {
            this.canvas.off({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:moving': moving,
                'object:moved': moved,
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
        } else {
            this.canvas.off({
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:out': mouseout,
                'mouse:up': mouseup,
                'mouse:wheel': mousewheel,
            });
            this.handlers.getObjects().forEach((object) => {
                object.off('mousedown', this.eventHandlers.object.mousedown);
                if (object.anime) {
                    anime.remove(object);
                }
            });
        }
        this.handlers.clear(true);
        if (this.tooltipRef) {
            document.body.removeChild(this.tooltipRef);
        }
    }

    attachEventListener = () => {
        // if add canvas wrapper element event, tabIndex = 1000;
        this.canvas.wrapperEl.tabIndex = 1000;
        document.addEventListener('keydown', this.eventHandlers.keydown, false);
        document.addEventListener('keyup', this.eventHandlers.keyup, false);
        document.addEventListener('mousedown', this.eventHandlers.onmousedown, false);
        this.canvas.wrapperEl.addEventListener('contextmenu', this.eventHandlers.contextmenu, false);
        if (this.keyEvent.clipboard) {
            document.addEventListener('paste', this.eventHandlers.paste, false);
        }
    }

    detachEventListener = () => {
        document.removeEventListener('keydown', this.eventHandlers.keydown);
        document.removeEventListener('keyup', this.eventHandlers.keyup);
        document.removeEventListener('mousedown', this.eventHandlers.onmousedown);
        this.canvas.wrapperEl.removeEventListener('contextmenu', this.eventHandlers.contextmenu);
        if (this.keyEvent.clipboard) {
            document.removeEventListener('paste', this.eventHandlers.paste);
        }
    }

    /* eslint-disable react/sort-comp, react/prop-types */
    handlers = {
        /**
         * Set the position on Object
         *
         * @param {fabric.Object} obj
         * @param {boolean} centered
         */
        centerObject: (obj, centered) => {
            if (centered) {
                this.canvas.centerObject(obj);
                obj.setCoords();
            } else {
                this.handlers.setByPartial(obj, {
                    left: (obj.left / this.canvas.getZoom()) - (obj.width / 2) - (this.canvas.viewportTransform[4] / this.canvas.getZoom()),
                    top: (obj.top / this.canvas.getZoom()) - (obj.height / 2) - (this.canvas.viewportTransform[5] / this.canvas.getZoom())
                });
            }
        },
        add: (obj, centered = true, loaded = false) => {
            const { editable } = this.props;
            const option = {
                hasControls: editable,
                hasBorders: editable,
                selectable: editable,
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
            let createdObj;
            if (obj.type === 'group') {
                const objects = this.handlers.addGroup(newOption, centered, loaded);
                const groupOption = Object.assign({}, newOption, { objects });
                if (obj.type === 'image') {
                    this.handlers.addImage(newOption, centered, loaded);
                    return;
                }
                if (this.handlers.isElementType(obj.type)) {
                    this.handlers.addElement(newOption, centered);
                    return;
                }
                if (obj.type === 'svg') {
                    this.handlers.addSVG(newOption, centered, loaded);
                    return;
                }
                createdObj = this.fabricObjects[obj.type].create({ name: 'New Group', ...groupOption });
                if (!editable && !this.handlers.isElementType(obj.type)) {
                    createdObj.on('mousedown', this.eventHandlers.object.mousedown);
                }
                this.canvas.add(createdObj);
                this.objects = this.handlers.getObjects();
                if (obj.type !== 'polygon' && editable && !loaded) {
                    this.handlers.centerObject(createdObj, centered);
                }
                if (!editable && createdObj.animation && createdObj.animation.autoplay) {
                    this.animationHandlers.play(createdObj.id);
                }
                const { onAdd } = this.props;
                if (onAdd && editable && !loaded) {
                    onAdd(createdObj);
                }
                return createdObj;
            }
            if (obj.type === 'image') {
                this.handlers.addImage(newOption, centered, loaded);
                return;
            }
            if (this.handlers.isElementType(obj.type)) {
                this.handlers.addElement(newOption, centered, loaded);
                return;
            }
            if (obj.type === 'svg') {
                this.handlers.addSVG(newOption, centered, loaded);
                return;
            }
            if (obj.superType === 'link') {
                return this.linkHandlers.create(newOption);
            }
            // Create canvas object
            createdObj = this.fabricObjects[obj.type].create(newOption);
            if (!editable && !this.handlers.isElementType(obj.type)) {
                createdObj.on('mousedown', this.eventHandlers.object.mousedown);
            }
            if (createdObj.dbclick) {
                createdObj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
            }
            this.canvas.add(createdObj);
            this.objects = this.handlers.getObjects();
            if (
                obj.superType !== 'drawing'
                && obj.superType !== 'link'
                && editable
                && !loaded
            ) {
                this.handlers.centerObject(createdObj, centered);
            }
            if (createdObj.superType === 'node') {
                this.portHandlers.create(createdObj);
                if (createdObj.iconButton) {
                    this.canvas.add(createdObj.iconButton);
                }
            }
            if (!editable && createdObj.animation && createdObj.animation.autoplay) {
                this.animationHandlers.play(createdObj.id);
            }
            const { onAdd, gridOption } = this.props;
            if (onAdd && editable && !loaded) {
                onAdd(createdObj);
            }
            if (!loaded) {
                if (createdObj.superType === 'node') {
                    createdObj.setShadow({
                        color: createdObj.stroke,
                    });
                    this.nodeHandlers.highlightingNode(createdObj);
                }
            }
            if (gridOption.enabled) {
                this.gridHandlers.setCoords(createdObj);
            }
            return createdObj;
        },
        addGroup: (obj, centered = true, loaded = false) => {
            return obj.objects.map((child) => {
                return this.handlers.add(child, centered, loaded);
            });
        },
        addImage: (obj, centered = true, loaded = false) => {
            const { editable, defaultOptions } = this.props;
            const image = new Image();
            const { src, file, filters = [], ...otherOption } = obj;
            const createImage = (img) => {
                const createdObj = new fabric.Image(img, {
                    src,
                    file,
                    filters: this.imageHandler.createFilters(filters),
                    ...defaultOptions,
                    ...otherOption,
                });
                if (!editable) {
                    createdObj.on('mousedown', this.eventHandlers.object.mousedown);
                }
                this.canvas.add(createdObj);
                this.objects = this.handlers.getObjects();
                if (editable && !loaded) {
                    this.handlers.centerObject(createdObj, centered);
                }
                if (!editable && createdObj.animation && createdObj.animation.autoplay) {
                    this.animationHandlers.play(createdObj.id);
                }
                const { onAdd } = this.props;
                if (onAdd && editable && !loaded) {
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
        addElement: (obj, centered = true, loaded = false) => {
            const { canvas } = this;
            const { editable, defaultOptions } = this.props;
            const { src, file, code, ...otherOption } = obj;
            const createdObj = new fabric.Rect({
                src,
                file,
                code,
                ...defaultOptions,
                ...otherOption,
                fill: 'rgba(255, 255, 255, 0)',
                stroke: 'rgba(255, 255, 255, 0)',
            });
            if (!editable) {
                createdObj.on('mousedown', this.eventHandlers.object.mousedown);
            }
            canvas.add(createdObj);
            this.objects = this.handlers.getObjects();
            if (src || file || code) {
                if (obj.type === 'video') {
                    this.videoHandlers.set(createdObj, src || file);
                } else {
                    this.elementHandlers.set(createdObj, src || code);
                }
            }
            if (editable && !loaded) {
                this.handlers.centerObject(createdObj, centered);
            }
            const { onAdd } = this.props;
            if (onAdd && editable && !loaded) {
                onAdd(createdObj);
            }
        },
        addSVG: (obj, centered = true, loaded = false) => {
            const getSVGElements = (object, objects, options) => {
                const createdObj = fabric.util.groupSVGElements(objects, options);
                createdObj.set({ ...this.props.defaultOptions, ...object });
                this.canvas.add(createdObj);
                this.objects = this.handlers.getObjects();
                const { onAdd, editable } = this.props;
                if (!editable && !this.handlers.isElementType(obj.type)) {
                    createdObj.on('mousedown', this.eventHandlers.object.mousedown);
                }
                if (createdObj.dbclick) {
                    createdObj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                }
                if (editable && !loaded) {
                    this.handlers.centerObject(createdObj, centered);
                }
                if (!editable && createdObj.animation && createdObj.animation.autoplay) {
                    this.animationHandlers.play(createdObj.id);
                }
                if (onAdd && !loaded && editable) {
                    onAdd(obj);
                }
            };
            if (obj.loadType === 'svg') {
                fabric.loadSVGFromString(obj.svg, (objects, options) => {
                    getSVGElements(obj, objects, options);
                });
            } else {
                fabric.loadSVGFromURL(obj.svg, (objects, options) => {
                    getSVGElements(obj, objects, options);
                });
            }
        },
        /**
         * Remove object
         *
         * @param {fabric.Object} target
         * @returns {any}
         */
        remove: (target) => {
            const activeObject = target || this.canvas.getActiveObject();
            if (this.prevTarget && this.prevTarget.superType === 'link') {
                this.linkHandlers.remove(this.prevTarget);
                return true;
            }
            if (!activeObject) {
                return false;
            }
            if (typeof activeObject.deleted !== 'undefined' && !activeObject.deleted) {
                return false;
            }
            if (activeObject.type !== 'activeSelection') {
                this.canvas.discardActiveObject();
                if (this.handlers.isElementType(activeObject.type)) {
                    this.elementHandlers.removeById(activeObject.id);
                    this.elementHandlers.removeStyleById(activeObject.id);
                    this.elementHandlers.removeScriptById(activeObject.id);
                }
                if (activeObject.superType === 'link') {
                    this.linkHandlers.remove(activeObject);
                } else if (activeObject.superType === 'node') {
                    if (activeObject.toPort) {
                        if (activeObject.toPort.links.length) {
                            activeObject.toPort.links.forEach((link) => {
                                this.linkHandlers.remove(link, 'from');
                            });
                        }
                        this.canvas.remove(activeObject.toPort);
                    }
                    if (activeObject.fromPort && activeObject.fromPort.length) {
                        activeObject.fromPort.forEach((port) => {
                            if (port.links.length) {
                                port.links.forEach((link) => {
                                    this.linkHandlers.remove(link, 'to');
                                });
                            }
                            this.canvas.remove(port);
                        });
                    }
                }
                this.canvas.remove(activeObject);
                this.handlers.removeOriginById(activeObject.id);
            } else {
                const { _objects: activeObjects } = activeObject;
                const existDeleted = activeObjects.some(obj => typeof obj.deleted !== 'undefined' && !obj.deleted);
                if (existDeleted) {
                    return false;
                }
                this.canvas.discardActiveObject();
                activeObjects.forEach((obj) => {
                    if (this.handlers.isElementType(obj.type)) {
                        this.elementHandlers.removeById(obj.id);
                        this.elementHandlers.removeStyleById(obj.id);
                        this.elementHandlers.removeScriptById(obj.id);
                    } else if (obj.superType === 'node') {
                        if (obj.toPort) {
                            if (obj.toPort.links.length) {
                                obj.toPort.links.forEach((link) => {
                                    this.linkHandlers.remove(link, 'from');
                                });
                            }
                            this.canvas.remove(obj.toPort);
                        }
                        if (obj.fromPort && obj.fromPort.length) {
                            obj.fromPort.forEach((port) => {
                                if (port.links.length) {
                                    port.links.forEach((link) => {
                                        this.linkHandlers.remove(link, 'to');
                                    });
                                }
                                this.canvas.remove(port);
                            });
                        }
                    }
                    this.canvas.remove(obj);
                    this.handlers.removeOriginById(obj.id);
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
                this.handlers.remove(findObject);
            }
        },
        duplicate: () => {
            const { onAdd, propertiesToInclude, gridOption: { grid = 10 } } = this.props;
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            if (typeof activeObject.cloned !== 'undefined' && !activeObject.cloned) {
                return false;
            }
            activeObject.clone((clonedObj) => {
                this.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + grid,
                    top: clonedObj.top + grid,
                    evented: true,
                });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = this.canvas;
                    clonedObj.forEachObject((obj) => {
                        obj.set('id', uuid());
                        this.canvas.add(obj);
                        this.objects = this.handlers.getObjects();
                        if (obj.dbclick) {
                            obj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                        }
                    });
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                    clonedObj.setCoords();
                } else {
                    if (activeObject.id === clonedObj.id) {
                        clonedObj.set('id', uuid());
                    }
                    this.canvas.add(clonedObj);
                    this.objects = this.handlers.getObjects();
                    if (clonedObj.dbclick) {
                        clonedObj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                    }
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                }
                this.canvas.setActiveObject(clonedObj);
                this.portHandlers.create(clonedObj);
                this.canvas.requestRenderAll();
            }, propertiesToInclude);
        },
        duplicateById: (id) => {
            const { onAdd, propertiesToInclude, gridOption: { grid = 10 } } = this.props;
            const findObject = this.handlers.findById(id);
            if (findObject) {
                if (typeof findObject.cloned !== 'undefined' && !findObject.cloned) {
                    return false;
                }
                findObject.clone((cloned) => {
                    cloned.set({
                        left: cloned.left + grid,
                        top: cloned.top + grid,
                        id: uuid(),
                        evented: true,
                    });
                    this.canvas.add(cloned);
                    this.objects = this.handlers.getObjects();
                    if (onAdd) {
                        onAdd(cloned);
                    }
                    if (cloned.dbclick) {
                        cloned.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                    }
                    this.canvas.setActiveObject(cloned);
                    this.portHandlers.create(cloned);
                    this.canvas.requestRenderAll();
                }, propertiesToInclude);
            }
        },
        copyToClipboard: (value) => {
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.value = value;
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.canvas.wrapperEl.focus();
        },
        copy: () => {
            const { propertiesToInclude } = this.props;
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.superType === 'link') {
                return false;
            }
            if (activeObject) {
                if (typeof activeObject.cloned !== 'undefined' && !activeObject.cloned) {
                    return false;
                }
                if (activeObject.type === 'activeSelection') {
                    if (activeObject.getObjects().some(obj => obj.superType === 'node')) {
                        if (this.keyEvent.clipboard) {
                            const links = [];
                            const objects = activeObject.getObjects().map((obj, index) => {
                                if (typeof obj.cloned !== 'undefined' && !obj.cloned) {
                                    return null;
                                }
                                if (obj.fromPort.length) {
                                    obj.fromPort.forEach((port) => {
                                        if (port.links.length) {
                                            port.links.forEach((link) => {
                                                const linkTarget = {
                                                    fromNodeIndex: index,
                                                    fromPort: port.id,
                                                    type: 'CurvedLink',
                                                    superType: 'link',
                                                };
                                                const findIndex = activeObject.getObjects().findIndex(compObj => compObj.id === link.toNode.id);
                                                if (findIndex >= 0) {
                                                    linkTarget.toNodeIndex = findIndex;
                                                    links.push(linkTarget);
                                                }
                                            });
                                        }
                                    });
                                }
                                return {
                                    name: obj.name,
                                    description: obj.description,
                                    superType: obj.superType,
                                    type: obj.type,
                                    nodeClazz: obj.nodeClazz,
                                    configuration: obj.configuration,
                                    properties: {
                                        left: activeObject.left + (activeObject.width / 2) + obj.left || 0,
                                        top: activeObject.top + (activeObject.height / 2) + obj.top || 0,
                                        iconName: obj.descriptor.icon,
                                    },
                                };
                            });
                            this.handlers.copyToClipboard(JSON.stringify(objects.concat(links), null, '\t'));
                            return;
                        }
                        this.setState({
                            clipboard: activeObject,
                        });
                        return;
                    }
                }
                activeObject.clone((cloned) => {
                    if (this.keyEvent.clipboard) {
                        if (cloned.superType === 'node') {
                            const node = {
                                name: cloned.name,
                                description: cloned.description,
                                superType: cloned.superType,
                                type: cloned.type,
                                nodeClazz: cloned.nodeClazz,
                                configuration: cloned.configuration,
                                properties: {
                                    left: cloned.left || 0,
                                    top: cloned.top || 0,
                                    iconName: cloned.descriptor.icon,
                                },
                            };
                            const objects = [node];
                            this.handlers.copyToClipboard(JSON.stringify(objects, null, '\t'));
                            return;
                        }
                        this.handlers.copyToClipboard(JSON.stringify(cloned.toObject(this.props.propertiesToInclude), null, '\t'));
                        return;
                    }
                    this.setState({
                        clipboard: cloned,
                    });
                }, propertiesToInclude);
            }
        },
        paste: () => {
            const { onAdd, propertiesToInclude, gridOption: { grid = 10 } } = this.props;
            const { clipboard } = this.state;
            if (!clipboard) {
                return false;
            }
            if (typeof clipboard.cloned !== 'undefined' && !clipboard.cloned) {
                return false;
            }
            if (clipboard.type === 'activeSelection') {
                if (clipboard.getObjects().some(obj => obj.superType === 'node')) {
                    this.canvas.discardActiveObject();
                    const objects = [];
                    const linkObjects = [];
                    clipboard.getObjects().forEach((obj) => {
                        if (typeof obj.cloned !== 'undefined' && !obj.cloned) {
                            return false;
                        }
                        const clonedObj = obj.duplicate();
                        if (clonedObj.type === 'SwitchNode') {
                            clonedObj.set({
                                left: obj.left + grid + grid,
                                top: obj.top + grid,
                            });
                        } else {
                            clonedObj.set({
                                left: obj.left + grid,
                                top: obj.top + grid,
                            });
                        }
                        if (obj.fromPort.length) {
                            obj.fromPort.forEach((port) => {
                                if (port.links.length) {
                                    port.links.forEach((link) => {
                                        const linkTarget = {
                                            fromNode: clonedObj.id,
                                            fromPort: port.id,
                                        };
                                        const findIndex = clipboard.getObjects().findIndex(compObj => compObj.id === link.toNode.id);
                                        if (findIndex >= 0) {
                                            linkTarget.toNodeIndex = findIndex;
                                            linkObjects.push(linkTarget);
                                        }
                                    });
                                }
                            });
                        }
                        if (clonedObj.dbclick) {
                            clonedObj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                        }
                        this.canvas.add(clonedObj);
                        this.objects = this.handlers.getObjects();
                        this.portHandlers.create(clonedObj);
                        objects.push(clonedObj);
                    });
                    if (linkObjects.length) {
                        linkObjects.forEach((linkObject) => {
                            const { fromNode, fromPort, toNodeIndex } = linkObject;
                            const toNode = objects[toNodeIndex];
                            const link = {
                                type: 'CurvedLink',
                                fromNode,
                                fromPort,
                                toNode: toNode.id,
                                toPort: toNode.toPort.id,
                            };
                            this.linkHandlers.create(link);
                        });
                    }
                    const activeSelection = new fabric.ActiveSelection(objects, {
                        canvas: this.canvas,
                        ...this.props.activeSelection,
                    });
                    this.setState({
                        clipboard: activeSelection,
                    });
                    this.canvas.setActiveObject(activeSelection);
                    this.canvas.renderAll();
                    return;
                }
            }
            clipboard.clone((clonedObj) => {
                this.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + grid,
                    top: clonedObj.top + grid,
                    id: uuid(),
                    evented: true,
                });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = this.canvas;
                    clonedObj.forEachObject((obj) => {
                        obj.set('id', uuid());
                        this.canvas.add(obj);
                        if (obj.dbclick) {
                            obj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                        }
                        this.objects = this.handlers.getObjects();
                    });
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                    clonedObj.setCoords();
                } else {
                    if (clonedObj.superType === 'node') {
                        clonedObj = clonedObj.duplicate();
                    } else {
                        clonedObj.set('id', uuid());
                    }
                    this.canvas.add(clonedObj);
                    if (clonedObj.dbclick) {
                        clonedObj.on('mousedblclick', this.eventHandlers.object.mousedblclick);
                    }
                    this.objects = this.handlers.getObjects();
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
                this.portHandlers.create(clonedObj);
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
            this.canvas.renderAll();
            const { onModified } = this.props;
            if (onModified) {
                onModified(obj);
            }
        },
        setById: (id, key, value) => {
            const findObject = this.handlers.findById(id);
            this.handlers.setByObject(findObject, key, value);
        },
        /**
         * Set the option by partial
         *
         * @param {fabric.Object} object
         * @param {*} option
         * @returns {fabric.Object}
         */
        setByPartial: (object, option) => {
            if (!object) {
                return;
            }
            object.set(option);
            object.setCoords();
            this.canvas.renderAll();
            return object;
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
        /**
         * Load the image
         *
         * @param {fabric.Object} obj
         * @param {string} src
         */
        loadImage: (obj, src) => {
            let url = src;
            if (!url) {
                url = './images/sample/transparentBg.png';
            }
            fabric.util.loadImage(url, (source) => {
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
        /**
         * Set the image
         *
         * @param {fabric.Object} obj
         * @param {string | File} src
         * @returns
         */
        setImage: (obj, src) => {
            if (!src) {
                this.handlers.loadImage(obj, null);
                obj.set('file', null);
                obj.set('src', null);
                return;
            }
            if (typeof src === 'string') {
                this.handlers.loadImage(obj, src);
                obj.set('file', null);
                obj.set('src', src);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.handlers.loadImage(obj, e.target.result);
                    const file = {
                        name: src.name,
                        size: src.size,
                        uid: src.uid,
                        type: src.type,
                    };
                    obj.set('file', file);
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
            const exist = this.objects.some((obj) => {
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
                } else if (!obj.evented) {
                    return false;
                } else if (obj.superType === 'link') {
                    return false;
                } else if (obj.superType === 'port') {
                    return false;
                } else if (this.handlers.isElementType(obj.type)) {
                    return false;
                } else if (obj.lock) {
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
                ...this.props.activeSelection,
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
        selectByObject: (object) => {
            if (object) {
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(object);
                this.canvas.requestRenderAll();
            }
        },
        originScaleToResize: (obj, width, height) => {
            if (obj.id === 'workarea') {
                this.handlers.setByPartial(obj, {
                    workareaWidth: obj.width,
                    workareaHeight: obj.height,
                });
            }
            this.handlers.setByPartial(obj, {
                scaleX: width / obj.width,
                scaleY: height / obj.height,
            });
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
            let prevLeft = 0;
            let prevTop = 0;
            this.canvas.setBackgroundColor(this.props.canvasOption.backgroundColor);
            const workareaExist = json.filter(obj => obj.id === 'workarea');
            if (!this.workarea) {
                this.workareaHandlers.init();
            }
            if (!workareaExist.length) {
                this.canvas.centerObject(this.workarea);
                this.workarea.setCoords();
                prevLeft = this.workarea.left;
                prevTop = this.workarea.top;
            } else {
                const workarea = workareaExist[0];
                prevLeft = workarea.left;
                prevTop = workarea.top;
                this.workarea.set(workarea);
                this.canvas.centerObject(this.workarea);
                this.workareaHandlers.setImage(workarea.src, true);
                this.workarea.setCoords();
            }
            setTimeout(() => {
                json.forEach((obj) => {
                    if (obj.id === 'workarea') {
                        return;
                    }
                    // if (workareaExist.length && obj.id === 'workarea') {
                    //     prevLeft = obj.left;
                    //     prevTop = obj.top;
                    //     this.workarea.set(obj);
                    //     this.canvas.centerObject(this.workarea);
                    //     this.workareaHandlers.setImage(obj.src, true);
                    //     this.workarea.setCoords();
                    //     return;
                    // }
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
                    this.handlers.add(obj, false, true);
                    this.canvas.renderAll();
                });
                if (callback) {
                    callback(this.canvas);
                }
            }, 300);
            this.canvas.setZoom(1);
        },
        exportJSON: () => this.canvas.toDatalessJSON(this.props.propertiesToInclude),
        getObjects: () => this.canvas.getObjects().filter((obj) => {
            if (obj.id === 'workarea') {
                return false;
            } else if (obj.id === 'grid') {
                return false;
            } else if (obj.superType === 'port') {
                return false;
            } else if (!obj.id) {
                return false;
            }
            return true;
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
                this.workarea = null;
            } else {
                canvas.getObjects().forEach((obj) => {
                    if (obj.id === 'grid') {
                        return;
                    }
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
                ...this.props.defaultOptions,
            });
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(group);
            }
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
            const activeObject = canvas.getActiveObject().toActiveSelection();
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(activeObject);
            }
            canvas.renderAll();
        },
        isElementType: (type) => {
            return type === 'video' || type === 'element' || type === 'iframe';
        },
        getOriginObjects: () => this.objects,
        findOriginById: (id) => {
            let findObject;
            const exist = this.objects.some((obj) => {
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
        findOriginByIdWithIndex: (id) => {
            let findObject;
            let index;
            const exist = this.objects.some((obj, i) => {
                if (obj.id === id) {
                    findObject = obj;
                    index = i;
                    return true;
                }
                return false;
            });
            if (!exist) {
                console.warn('Not found object by id.');
                return exist;
            }
            return {
                object: findObject,
                index,
            };
        },
        removeOriginById: (id) => {
            const object = this.handlers.findOriginByIdWithIndex(id);
            if (object) {
                this.objects.splice(object.index, 1);
            }
        },
        saveImage: (targetObject, option = { name: 'New Image', format: 'png', quality: 1 }) => {
            let dataUrl;
            let target = targetObject;
            if (target) {
                dataUrl = target.toDataURL(option);
            } else {
                target = this.canvas.getActiveObject();
                if (target) {
                    dataUrl = target.toDataURL(option);
                }
            }
            if (dataUrl) {
                const anchorEl = document.createElement('a');
                anchorEl.href = dataUrl;
                anchorEl.download = `${option.name}.png`;
                document.body.appendChild(anchorEl); // required for firefox
                anchorEl.click();
                anchorEl.remove();
            }
        },
        saveCanvasImage: (option = { name: 'New Image', format: 'png', quality: 1 }) => {
            const dataUrl = this.canvas.toDataURL(option);
            if (dataUrl) {
                const anchorEl = document.createElement('a');
                anchorEl.href = dataUrl;
                anchorEl.download = `${option.name}.png`;
                document.body.appendChild(anchorEl); // required for firefox
                anchorEl.click();
                anchorEl.remove();
            }
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
        selection: (callback) => {
            if (this.interactionMode === 'selection') {
                return;
            }
            this.interactionMode = 'selection';
            if (typeof this.props.canvasOption.selection === 'undefined') {
                this.canvas.selection = true;
            } else {
                this.canvas.selection = this.props.canvasOption.selection;
            }
            this.canvas.defaultCursor = 'default';
            this.workarea.hoverCursor = 'default';
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    if (obj.id === 'grid') {
                        obj.selectable = false;
                        obj.evented = false;
                        return;
                    }
                    if (callback) {
                        const ret = callback(obj);
                        if (typeof ret === 'object') {
                            obj.selectable = ret.selectable;
                            obj.evented = ret.evented;
                        } else {
                            obj.selectable = ret;
                            obj.evented = ret;
                        }
                    } else {
                        obj.selectable = true;
                        obj.evented = true;
                    }
                }
            });
            this.canvas.renderAll();
        },
        grab: (callback) => {
            if (this.interactionMode === 'grab') {
                return;
            }
            this.interactionMode = 'grab';
            this.canvas.selection = false;
            this.canvas.defaultCursor = 'grab';
            this.workarea.hoverCursor = 'grab';
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    if (callback) {
                        const ret = callback(obj);
                        if (typeof ret === 'object') {
                            obj.selectable = ret.selectable;
                            obj.evented = ret.evented;
                        } else {
                            obj.selectable = ret;
                            obj.evented = ret;
                        }
                    } else {
                        obj.selectable = false;
                        obj.evented = this.props.editable ? false : true;
                    }
                }
            });
            this.canvas.renderAll();
        },
        drawing: (callback, type) => {
            this.interactionMode = type;
            this.canvas.selection = false;
            this.canvas.defaultCursor = 'pointer';
            this.workarea.hoverCursor = 'pointer';
            this.canvas.getObjects().forEach((obj) => {
                if (obj.id !== 'workarea') {
                    if (callback) {
                        const ret = callback(obj);
                        if (typeof ret === 'object') {
                            obj.selectable = ret.selectable;
                            obj.evented = ret.evented;
                        } else {
                            obj.selectable = ret;
                            obj.evented = ret;
                        }
                    } else {
                        obj.selectable = false;
                        obj.evented = this.props.editable ? false : true;
                    }
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
        play: (id, hasControls) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            if (findObject.anime) {
                findObject.anime.restart();
                return;
            }
            if (findObject.animation.type === 'none') {
                return;
            }
            const instance = this.animationHandlers.getAnimation(findObject, hasControls);
            if (instance) {
                findObject.set('anime', instance);
                findObject.set({
                    hasControls: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    hoverCursor: 'pointer',
                });
                this.canvas.requestRenderAll();
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
        stop: (id, hasControls = true) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            this.animationHandlers.initAnimation(findObject, hasControls);
        },
        restart: (id) => {
            const findObject = this.handlers.findById(id);
            if (!findObject) {
                return;
            }
            if (!findObject.anime) {
                return;
            }
            this.animationHandlers.stop(id);
            this.animationHandlers.play(id);
        },
        initAnimation: (obj, hasControls = true) => {
            if (!obj.anime) {
                return;
            }
            let option;
            if (this.props.editable) {
                option = {
                    anime: null,
                    hasControls,
                    lockMovementX: !hasControls,
                    lockMovementY: !hasControls,
                    hoverCursor: hasControls ? 'move' : 'pointer',
                };
            } else {
                option = {
                    anime: null,
                    hasControls: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    hoverCursor: 'pointer',
                };
            }
            anime.remove(obj);
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
                console.warn('Not supported type.');
            }
            obj.set(option);
            this.canvas.renderAll();
        },
        getAnimation: (obj, hasControls) => {
            const { delay = 100, duration = 100, autoplay = true, loop = true, type, ...other } = obj.animation;
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
                    this.canvas.requestRenderAll();
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
                    this.canvas.requestRenderAll();
                },
                complete: () => {
                    this.animationHandlers.initAnimation(obj, hasControls);
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
                obj.set('originScaleX', obj.scaleX);
                obj.set('originScaleY', obj.scaleY);
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
        /**
         * Init workarea
         *
         */
        init: () => {
            const { workareaOption } = this.props;
            const mergedWorkareaOption = Object.assign({}, defaultWorkareaOption, workareaOption);
            const image = new Image();
            image.width = mergedWorkareaOption.width;
            image.height = mergedWorkareaOption.height;
            this.workarea = new fabric.Image(image, mergedWorkareaOption);
            this.canvas.add(this.workarea);
            this.objects = this.handlers.getObjects();
            this.canvas.centerObject(this.workarea);
        },
        /**
         * Set the layout on workarea
         *
         * @param {'fixed' | 'responsive' | 'fullscreen'} layout
         * @returns
         */
        setLayout: (layout) => {
            this.workarea.set('layout', layout);
            const { canvas } = this;
            const { _element, isElement } = this.workarea;
            let scaleX = 1;
            let scaleY = 1;
            const isFixed = layout === 'fixed';
            const isResponsive = layout === 'responsive';
            const isFullscreen = layout === 'fullscreen';
            if (isElement) {
                if (isFixed) {
                    scaleX = this.workarea.workareaWidth / _element.width;
                    scaleY = this.workarea.workareaHeight / _element.height;
                } else if (isResponsive) {
                    scaleX = canvas.getWidth() / _element.width;
                    scaleY = canvas.getHeight() / _element.height;
                    if (_element.height >= _element.width) {
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
                if (isElement) {
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
                        backgroundColor: 'rgba(255, 255, 255, 0)',
                    });
                }
                canvas.centerObject(this.workarea);
                canvas.renderAll();
                return;
            }
            if (isElement) {
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
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                });
                this.canvas.renderAll();
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
        /**
         * Set the responsive image on Workarea
         *
         * @param {string} [src]
         * @param {boolean} [loaded]
         * @returns
         */
        setResponsiveImage: (src, loaded) => {
            const { canvas, workarea, zoomHandlers } = this;
            const { editable } = this.props;
            const imageFromUrl = (source) => {
                fabric.Image.fromURL(source, (img) => {
                    let scaleX = canvas.getWidth() / img.width;
                    let scaleY = canvas.getHeight() / img.height;
                    if (img.height > img.width) {
                        scaleX = scaleY;
                        if (canvas.getWidth() < img.width * scaleX) {
                            scaleX = scaleX * (canvas.getWidth() / (img.width * scaleX));
                        }
                    } else {
                        scaleY = scaleX;
                        if (canvas.getHeight() < img.height * scaleX) {
                            scaleX = scaleX * (canvas.getHeight() / (img.height * scaleX));
                        }
                    }
                    img.set({
                        originX: 'left',
                        originY: 'top',
                    });
                    if (!img._element) {
                        workarea.setElement(new Image());
                        workarea.set({
                            isElement: false,
                            selectable: false,
                        });
                    } else {
                        workarea.set({
                            ...img,
                            isElement: true,
                            selectable: false,
                        });
                    }
                    if (!source) {
                        scaleX = 1;
                    }
                    canvas.centerObject(workarea);
                    if (editable && !loaded) {
                        canvas.getObjects().forEach((obj) => {
                            if (obj.id !== 'workarea') {
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
            if (!src) {
                workarea.set({
                    src,
                });
                imageFromUrl(src);
                return;
            }
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
        /**
         * Set the image on Workarea
         *
         * @param {string} [src]
         * @param {boolean} [loaded=false]
         * @returns
         */
        setImage: (src, loaded = false) => {
            const { canvas, workarea, zoomHandlers, workareaHandlers } = this;
            const { editable } = this.props;
            if (workarea.layout === 'responsive') {
                workareaHandlers.setResponsiveImage(src, loaded);
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
                    let scaleX = 1;
                    let scaleY = 1;
                    if (img._element) {
                        scaleX = width / img.width;
                        scaleY = height / img.height;
                        img.set({
                            originX: 'left',
                            originY: 'top',
                            scaleX,
                            scaleY,
                        });
                        workarea.set({
                            ...img,
                            isElement: true,
                            selectable: false,
                        });
                    } else {
                        workarea.setElement(new Image());
                        workarea.set({
                            width,
                            height,
                            scaleX,
                            scaleY,
                            isElement: false,
                            selectable: false,
                        });
                    }
                    canvas.centerObject(workarea);
                    if (editable && !loaded) {
                        const { layout } = workarea;
                        canvas.getObjects().forEach((obj) => {
                            if (obj.id !== 'workarea') {
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
            if (!src) {
                workarea.set({
                    src,
                });
                imageFromUrl(src);
                return;
            }
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

    nodeHandlers = {
        /**
         * Get the node path by target object
         *
         * @param {fabric.Object} target
         * @param {fabric.Object[]} [nodes=[]]
         * @param {string} [direction='init']
         */
        getNodePath: (target, nodes = [], direction = 'init') => {
            if (target) {
                if (direction === 'to' || direction === 'init') {
                    if (target.toPort) {
                        target.toPort.links.forEach((link) => {
                            if (link.fromNode) {
                                nodes.push(link.fromNode);
                                this.nodeHandlers.getNodePath(link.fromNode, nodes, 'to');
                            }
                        });
                    }
                    if (direction === 'init') {
                        nodes.push(target);
                    }
                }
                if (direction === 'from' || direction === 'init') {
                    target.fromPort.forEach((port) => {
                        port.links.forEach((link) => {
                            if (link.toNode) {
                                nodes.push(link.toNode);
                                this.nodeHandlers.getNodePath(link.toNode, nodes, 'from');
                            }
                        });
                    });
                }
            }
        },
        /**
         * Select the node path
         *
         * @param {string[]} path
         * @returns
         */
        selectByPath: (path) => {
            if (!path || !path.length) {
                return;
            }
            const targetObjects = this.handlers.getOriginObjects().filter(object => path.some(id => id === object.id));
            const nonTargetObjects = this.handlers.getOriginObjects().filter(object => path.some(id => id !== object.id));
            nonTargetObjects.forEach((object) => {
                if (object.superType === 'link') {
                    const { fromNode, toNode } = object;
                    if (fromNode && toNode) {
                        const fromIndex = targetObjects.findIndex(obj => obj.id === fromNode.id);
                        const toIndex = targetObjects.findIndex(obj => obj.id === toNode.id);
                        if ((fromIndex >= 0 && targetObjects[fromIndex]) && (toIndex >= 0 && targetObjects[toIndex])) {
                            object.set({
                                opacity: 1,
                            });
                            object.setShadow({
                                color: object.stroke,
                            });
                            this.nodeHandlers.highlightingNode(object, 300);
                            this.canvas.requestRenderAll();
                            return;
                        }
                    }
                }
                object.set({
                    opacity: 0.2,
                });
                if (object.superType === 'node') {
                    if (object.toPort) {
                        object.toPort.set({
                            opacity: 0.2,
                        });
                    }
                    object.fromPort.forEach((port) => {
                        port.set({
                            opacity: 0.2,
                        });
                    });
                }
                if (!object.isAnimated) {
                    object.setShadow({
                        blur: 0,
                    });
                }
            });
            targetObjects.forEach((object) => {
                object.set({
                    opacity: 1,
                });
                object.setShadow({
                    color: object.fill,
                });
                this.nodeHandlers.highlightingNode(object, 300);
                if (object.toPort) {
                    object.toPort.set({
                        opacity: 1,
                    });
                }
                if (object.fromPort) {
                    object.fromPort.forEach((port) => {
                        port.set({
                            opacity: 1,
                        });
                    });
                }
            });
            this.canvas.requestRenderAll();
        },
        selectById: (id) => {
            this.handlers.getOriginObjects().forEach((object) => {
                if (id === object.id) {
                    object.setShadow({
                        color: object.fill,
                        blur: 50,
                    });
                    return;
                } else if (id === object.nodeId) {
                    return;
                }
                object.setShadow({
                    blur: 0,
                });
            });
            this.canvas.requestRenderAll();
        },
        deselect: () => {
            this.handlers.getOriginObjects().forEach((object) => {
                object.set({
                    opacity: 1,
                });
                if (object.superType === 'node') {
                    if (object.toPort) {
                        object.toPort.set({
                            opacity: 1,
                        });
                    }
                    object.fromPort.forEach((port) => {
                        port.set({
                            opacity: 1,
                        });
                    });
                }
                if (!object.isAnimated) {
                    object.setShadow({
                        blur: 0,
                    });
                }
            });
            this.canvas.renderAll();
        },
        highlightingByPath: (path) => {
            if (!path || !path.length) {
                return;
            }
            const targetObjects = this.handlers.getOriginObjects().filter(object => path.some(id => id === object.id));
            const nonTargetObjects = this.handlers.getOriginObjects().filter(object => path.some(id => id !== object.id));
            const lastObject = targetObjects.filter(obj => obj.id === path[path.length - 1])[0];
            targetObjects.forEach((object) => {
                if (lastObject) {
                    object.setShadow({
                        color: lastObject.fill,
                    });
                } else {
                    object.setShadow({
                        color: object.fill,
                    });
                }
                this.nodeHandlers.highlightingNode(object);
                this.canvas.requestRenderAll();
            });
            nonTargetObjects.forEach((object) => {
                if (object.superType === 'link') {
                    const { fromNode, toNode } = object;
                    if (fromNode && toNode) {
                        const fromIndex = targetObjects.findIndex(obj => obj.id === fromNode.id);
                        const toIndex = targetObjects.findIndex(obj => obj.id === toNode.id);
                        if ((fromIndex >= 0 && targetObjects[fromIndex]) && (toIndex >= 0 && targetObjects[toIndex])) {
                            if (lastObject) {
                                object.setShadow({
                                    color: lastObject.stroke,
                                });
                            } else {
                                object.setShadow({
                                    color: object.stroke,
                                });
                            }
                            this.nodeHandlers.highlightingNode(object);
                            this.nodeHandlers.highlightingLink(object, lastObject);
                            return;
                        }
                    }
                }
            });
            this.canvas.requestRenderAll();
        },
        highlightingLink: (object, targetObject, duration = 500) => {
            object.animation = {
                duration,
                type: 'flash',
                stroke: targetObject ? targetObject.stroke : object.stroke,
                loop: 1,
                delay: 0,
            };
            this.animationHandlers.play(object.id, false);
        },
        highlightingNode: (object, duration = 500) => {
            const maxBlur = 50;
            const minBlur = 0;
            const onComplete = () => {
                if (object.shadow.blur === maxBlur) {
                    object.isAnimated = true;
                    object.animate('shadow.blur', minBlur, {
                        easing: fabric.util.ease.easeInOutQuad,
                        onChange: (value) => {
                            object.shadow.blur = value;
                            this.canvas.requestRenderAll();
                        },
                        onComplete: () => {
                            object.isAnimated = false;
                            if (object.superType === 'link') {
                                object.set({
                                    stroke: object.originStroke,
                                });
                            }
                        },
                    });
                }
            };
            object.isAnimated = true;
            object.animate('shadow.blur', maxBlur, {
                easing: fabric.util.ease.easeInOutQuad,
                duration,
                onChange: (value) => {
                    object.shadow.blur = value;
                    this.canvas.requestRenderAll();
                },
                onComplete,
            });
        },
    }

    portHandlers = {
        create: (target) => {
            if (!target.createToPort) {
                return;
            }
            const toPort = target.createToPort(target.left + (target.width / 2), target.top);
            if (toPort) {
                toPort.on('mouseover', () => {
                    if (this.interactionMode === 'link' && this.activeLine && this.activeLine.class === 'line') {
                        if (toPort.links.some(link => link.fromNode.id ===  this.activeLine.fromNode)) {
                            toPort.set({
                                fill: toPort.errorFill,
                            });
                            this.canvas.renderAll();
                            return;
                        }
                        toPort.set({
                            fill: toPort.hoverFill,
                        });
                        this.canvas.renderAll();
                    }
                });
                toPort.on('mouseout', () => {
                    toPort.set({
                        fill: toPort.originFill,
                    });
                    this.canvas.renderAll();
                });
                this.canvas.add(toPort);
                toPort.setCoords();
                this.canvas.bringToFront(toPort);
            }
            const fromPort = target.createFromPort(target.left + (target.width / 2), target.top + target.height);
            if (fromPort && fromPort.length) {
                fromPort.forEach((port) => {
                    if (port) {
                        port.on('mouseover', () => {
                            if (port.enabled) {
                                if (this.activeLine) {
                                    port.set({
                                        fill: port.errorFill,
                                    });
                                    this.canvas.renderAll();
                                    return;
                                }
                                port.set({
                                    fill: port.hoverFill,
                                });
                                this.canvas.renderAll();
                                return;
                            }
                            port.set({
                                fill: port.errorFill,
                            });
                            this.canvas.renderAll();
                        });
                        port.on('mouseout', () => {
                            port.set({
                                fill: port.originFill,
                            });
                            this.canvas.renderAll();
                        });
                        this.canvas.add(port);
                        port.setCoords();
                        this.canvas.bringToFront(port);
                    }
                });
            }
        },
        setCoords: (target) => {
            if (target.toPort) {
                const toCoords = {
                    left: target.left + (target.width / 2),
                    top: target.top,
                };
                target.toPort.set({
                    ...toCoords,
                });
                target.toPort.setCoords();
                if (target.toPort.links.length) {
                    target.toPort.links.forEach((link) => {
                        const fromPort = link.fromNode.fromPort.filter(port => port.id === link.fromPort)[0];
                        this.linkHandlers.setCoords(fromPort.left, fromPort.top, toCoords.left, toCoords.top, link);
                    });
                }
            }
            if (target.fromPort) {
                const fromCoords = {
                    left: target.left + (target.width / 2),
                    top: target.top + target.height,
                };
                target.fromPort.forEach((port) => {
                    const left = port.leftDiff ? fromCoords.left + port.leftDiff : fromCoords.left;
                    const top = port.topDiff ? fromCoords.top + port.topDiff : fromCoords.top;
                    port.set({
                        left,
                        top,
                    });
                    port.setCoords();
                    if (port.links.length) {
                        port.links.forEach((link) => {
                            this.linkHandlers.setCoords(left, top, link.toNode.toPort.left, link.toNode.toPort.top, link);
                        });
                    }
                });
            }
        },
        recreate: (target) => {
            const { fromPort, toPort } = target;
            if (target.ports) {
                target.ports.forEach((port) => {
                    target.removeWithUpdate(port);
                    this.canvas.remove(port.fromPort);
                });
            }
            this.canvas.remove(target.toPort);
            if (target.toPort) {
                target.toPort.links.forEach((link) => {
                    this.linkHandlers.remove(link, 'from');
                });
            }
            if (target.fromPort) {
                target.fromPort.forEach((port) => {
                    if (port.links.length) {
                        port.links.forEach((link) => {
                            this.linkHandlers.remove(link, 'to');
                        });
                    }
                });
            }
            this.portHandlers.create(target);
            toPort.links.forEach((link) => {
                link.fromNode = link.fromNode.id;
                link.toNode = target.toPort.nodeId;
                this.linkHandlers.create(link);
            });
            fromPort.filter(op => target.fromPort.some(np => np.id === op.id)).forEach((port) => {
                port.links.forEach((link) => {
                    if (link.fromPort === port.id) {
                        link.fromNode = port.nodeId;
                        link.toNode = link.toNode.id;
                        this.linkHandlers.create(link);
                        this.portHandlers.setCoords(target);
                    }
                });
            });
        },
    }

    linkHandlers = {
        init: (target) => {
            if (!target.enabled) {
                console.warn('A connected node already exists.');
                return;
            }
            this.interactionMode = 'link';
            const { left, top } = target;
            // const points = [left, top, left, top];
            const fromPort = { left, top };
            const toPort = { left, top };
            this.activeLine = new CurvedLink(target.nodeId, fromPort, null, toPort, {
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
                fromNode: target.nodeId,
                fromPort: target.id,
            });
            this.canvas.add(this.activeLine);
        },
        finish: () => {
            this.interactionMode = 'selection';
            this.canvas.remove(this.activeLine);
            this.activeLine = null;
            this.canvas.renderAll();
        },
        generate: (target) => {
            if (!target) {
                console.warn('Does not exist target.');
                return;
            }
            if (target.nodeId === this.activeLine.fromNode) {
                console.warn('Can not select the same node.');
                return;
            }
            const link = {
                type: 'CurvedLink',
                fromNode: this.activeLine.fromNode,
                fromPort: this.activeLine.fromPort,
                toNode: target.nodeId,
                toPort: target.id,
            };
            this.linkHandlers.create(link, true);
            this.linkHandlers.finish();
        },
        create: (link, init = false) => {
            const fromNode = this.handlers.findById(link.fromNode);
            const fromPort = fromNode.fromPort.filter(port => port.id === link.fromPort || !port.id)[0];
            const toNode = this.handlers.findById(link.toNode);
            const { toPort } = toNode;
            const createdObj = this.fabricObjects[link.type].create(fromNode, fromPort, toNode, toPort, { ...link });
            this.canvas.add(createdObj);
            this.objects = this.handlers.getObjects();
            const { onAdd } = this.props;
            if (onAdd && this.props.editable && init) {
                onAdd(createdObj);
            }
            this.canvas.renderAll();
            createdObj.setPort(fromNode, fromPort, toNode, toPort);
            this.portHandlers.setCoords(fromNode);
            this.portHandlers.setCoords(toNode);
            this.canvas.requestRenderAll();
            return createdObj;
        },
        setCoords: (x1, y1, x2, y2, link) => {
            link.set({
                x1,
                y1,
                x2,
                y2,
            });
            link.setCoords();
        },
        removeFrom: (link) => {
            if (link.fromNode.fromPort.length) {
                let index = -1;
                link.fromNode.fromPort.forEach((port) => {
                    if (port.links.length) {
                        port.links.some((portLink, i) => {
                            if (link.id === portLink.id) {
                                index = i;
                                return true;
                            }
                            return false;
                        });
                        if (index > -1) {
                            port.links.splice(index, 1);
                        }
                    }
                    link.setPortEnabled(link.fromNode, port, true);
                });
            }
        },
        removeTo: (link) => {
            if (link.toNode.toPort.links.length) {
                let index = -1;
                link.toNode.toPort.links.some((portLink, i) => {
                    if (link.id === portLink.id) {
                        index = i;
                        return true;
                    }
                    return false;
                });
                if (index > -1) {
                    link.toNode.toPort.links.splice(index, 1);
                }
                link.setPortEnabled(link.toNode, link.toNode.toPort, true);
            }
        },
        removeAll: (link) => {
            this.linkHandlers.removeFrom(link);
            this.linkHandlers.removeTo(link);
        },
        remove: (link, type) => {
            if (type === 'from') {
                this.linkHandlers.removeFrom(link);
            } else if (type === 'to') {
                this.linkHandlers.removeTo(link);
            } else {
                this.linkHandlers.removeAll(link);
            }
            this.canvas.remove(link);
            this.handlers.removeOriginById(link.id);
        },
        exception: {
            alreadyConnect: (target) => {
                if (!target.enabled) {
                    console.warn('A connected node already exists.');
                    return;
                }
            },
            duplicate: (target) => {
                if (target.links.some(link => link.fromNode.id === this.activeLine.fromNode)) {
                    console.warn('Duplicate connections can not be made.');
                    return;
                }
            },
            alreadyDrawing: () => {
                if (this.interactionMode === 'link' && this.activeLine) {
                    console.warn('Already drawing links.');
                    return;
                }
            },
        },
    }

    drawingHandlers = {
        polygon: {
            init: () => {
                this.modeHandlers.drawing(null, 'polygon');
                this.pointArray = [];
                this.lineArray = [];
                this.activeLine = null;
                this.activeShape = null;
            },
            finish: () => {
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
                this.canvas.renderAll();
                this.modeHandlers.selection();
            },
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
            },
            generate: (pointArray) => {
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
                    fill: 'rgba(0, 0, 0, 0.25)',
                    opacity: 1,
                    objectCaching: !this.props.editable,
                    name: 'New polygon',
                    superType: 'drawing',
                };
                this.handlers.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.activeShape = null;
                this.modeHandlers.selection();
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
            init: () => {
                this.modeHandlers.drawing(null, 'line');
                this.pointArray = [];
                this.activeLine = null;
            },
            finish: () => {
                this.pointArray.forEach((point) => {
                    this.canvas.remove(point);
                });
                this.canvas.remove(this.activeLine);
                this.pointArray = [];
                this.activeLine = null;
                this.canvas.renderAll();
                this.modeHandlers.selection();
            },
            addPoint: (opt) => {
                const { absolutePointer } = opt;
                const { x, y } = absolutePointer;
                const circle = new fabric.Circle({
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
                this.activeLine = new fabric.Line(points, {
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
                this.pointArray.push(circle);
                this.canvas.add(this.activeLine);
                this.canvas.add(circle);
            },
            generate: (opt) => {
                const { absolutePointer } = opt;
                const { x, y } = absolutePointer;
                let points = [];
                const id = uuid();
                this.pointArray.forEach((point) => {
                    points = points.concat(point.left, point.top, x, y);
                    this.canvas.remove(point);
                });
                this.canvas.remove(this.activeLine);
                const option = {
                    id,
                    points,
                    type: 'line',
                    stroke: 'rgba(0, 0, 0, 1)',
                    strokeWidth: 3,
                    opacity: 1,
                    objectCaching: !this.props.editable,
                    name: 'New line',
                    superType: 'drawing',
                };
                this.handlers.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.modeHandlers.selection();
            },
        },
        arrow: {
            init: () => {
                this.modeHandlers.drawing(null, 'arrow');
                this.pointArray = [];
                this.activeLine = null;
            },
            finish: () => {
                this.pointArray.forEach((point) => {
                    this.canvas.remove(point);
                });
                this.canvas.remove(this.activeLine);
                this.pointArray = [];
                this.activeLine = null;
                this.canvas.renderAll();
                this.modeHandlers.selection();
            },
            addPoint: (opt) => {
                const { absolutePointer } = opt;
                const { x, y } = absolutePointer;
                const circle = new fabric.Circle({
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
                this.activeLine = new Arrow(points, {
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
                this.pointArray.push(circle);
                this.canvas.add(this.activeLine);
                this.canvas.add(circle);
            },
            generate: (opt) => {
                const { absolutePointer } = opt;
                const { x, y } = absolutePointer;
                let points = [];
                const id = uuid();
                this.pointArray.forEach((point) => {
                    points = points.concat(point.left, point.top, x, y);
                    this.canvas.remove(point);
                });
                this.canvas.remove(this.activeLine);
                const option = {
                    id,
                    points,
                    type: 'arrow',
                    stroke: 'rgba(0, 0, 0, 1)',
                    strokeWidth: 3,
                    opacity: 1,
                    objectCaching: !this.props.editable,
                    name: 'New line',
                    superType: 'drawing',
                };
                this.handlers.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.modeHandlers.selection();
            },
        },
        orthogonal: {

        },
        curve: {

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
                        left: 0 - ((obj.width * obj.scaleX) / 2),
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
                        left: activeObjectLeft - (obj.width * obj.scaleX),
                    });
                    obj.setCoords();
                    this.canvas.renderAll();
                });
            }
        },
    }

    zoomHandlers = {
        zoomToPoint: (point, zoom) => {
            const { onZoom, minZoom, maxZoom } = this.props;
            let zoomRatio = zoom;
            if (zoom <= (minZoom / 100)) {
                zoomRatio = minZoom / 100;
            } else if (zoom >= (maxZoom / 100)) {
                zoomRatio = maxZoom / 100;
            }
            this.canvas.zoomToPoint(point, zoomRatio);
            this.canvas.getObjects().forEach((obj) => {
                if (this.handlers.isElementType(obj.type)) {
                    const width = obj.width * obj.scaleX * zoomRatio;
                    const height = obj.height * obj.scaleY * zoomRatio;
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
                onZoom(zoomRatio);
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
            let scaleX;
            let scaleY;
            scaleX = this.canvas.getWidth() / this.workarea.width;
            scaleY = this.canvas.getHeight() / this.workarea.height;
            if (this.workarea.height > this.workarea.width) {
                scaleX = scaleY;
                if (this.canvas.getWidth() < this.workarea.width * scaleX) {
                    scaleX = scaleX * (this.canvas.getWidth() / (this.workarea.width * scaleX));
                }
            } else {
                scaleY = scaleX;
                if (this.canvas.getHeight() < this.workarea.height * scaleX) {
                    scaleX = scaleX * (this.canvas.getHeight() / (this.workarea.height * scaleX));
                }
            }
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            this.zoomHandlers.zoomToPoint(point, scaleX);
        },
        zoomIn: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio += 0.05;
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.zoomHandlers.zoomToPoint(point, zoomRatio);
        },
        zoomOut: () => {
            let zoomRatio = this.canvas.getZoom();
            zoomRatio -= 0.05;
            const center = this.canvas.getCenter();
            const point = {
                x: center.left,
                y: center.top,
            };
            this.zoomHandlers.zoomToPoint(point, zoomRatio);
        },
    }

    tooltipHandlers = {
        show: debounce(async (target) => {
            if (target.tooltip && target.tooltip.enabled) {
                while (this.tooltipRef.hasChildNodes()) {
                    this.tooltipRef.removeChild(this.tooltipRef.firstChild);
                }
                const tooltip = document.createElement('div');
                tooltip.className = 'rde-tooltip-right';
                let element = target.name;
                const { onTooltip } = this.props;
                if (onTooltip) {
                    element = await onTooltip(this.tooltipRef, target);
                    if (!element) {
                        return;
                    }
                }
                tooltip.innerHTML = element;
                this.tooltipRef.appendChild(tooltip);
                ReactDOM.render(element, tooltip);
                this.tooltipRef.classList.remove('tooltip-hidden');
                const zoom = this.canvas.getZoom();
                const { clientHeight } = this.tooltipRef;
                const { width, height, scaleX, scaleY } = target;
                const { left, top } = target.getBoundingRect();
                const { _offset: offset } = this.canvas.calcOffset();
                const objWidthDiff = (width * scaleX) * zoom;
                const objHeightDiff = (((height * scaleY) * zoom) / 2) - (clientHeight / 2);
                const calcLeft = offset.left + left + objWidthDiff;
                const calcTop = offset.top + top + objHeightDiff;
                if (document.body.clientWidth <= (calcLeft + this.tooltipRef.offsetWidth)) {
                    this.tooltipRef.style.left = `${left + offset.left - this.tooltipRef.offsetWidth}px`;
                    tooltip.className = 'rde-tooltip-left';
                } else {
                    this.tooltipRef.style.left = `${calcLeft}px`;
                }
                this.tooltipRef.style.top = `${calcTop}px`;
                this.target = target;
            }
        }, 100),
        hide: debounce((target) => {
            this.target = null;
            if (this.tooltipRef) {
                this.tooltipRef.classList.add('tooltip-hidden');
            }
        }, 100),
    }

    contextmenuHandlers = {
        show: debounce(async (e, target) => {
            const { onContext } = this.props;
            while (this.contextmenuRef.hasChildNodes()) {
                this.contextmenuRef.removeChild(this.contextmenuRef.firstChild);
            }
            const contextmenu = document.createElement('div');
            contextmenu.className = 'rde-contextmenu-right';
            const element = await onContext(this.contextmenuRef, e, target);
            if (!element) {
                return;
            }
            contextmenu.innerHTML = element;
            this.contextmenuRef.appendChild(contextmenu);
            ReactDOM.render(element, contextmenu);
            this.contextmenuRef.classList.remove('contextmenu-hidden');
            const { clientX: left, clientY: top } = e;
            this.contextmenuRef.style.left = `${left}px`;
            this.contextmenuRef.style.top = `${top}px`;
        }),
        hide: debounce((target) => {
            if (this.contextmenuRef) {
                this.contextmenuRef.classList.add('contextmenu-hidden');
            }
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
                if (canvasObjects[i] === target
                    || canvasObjects[i].superType === 'port'
                    || canvasObjects[i].superType === 'link'
                    || !canvasObjects[i].evented) {
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

    gridHandlers = {
        init: () => {
            const { gridOption } = this.props;
            if (gridOption.enabled && gridOption.grid) {
                const width = 5000;
                const gridLength = width / gridOption.grid;
                const lineOptions = {
                    stroke: '#ebebeb',
                    selectable: false,
                    evented: false,
                    id: 'grid',
                };
                this.horizontalGridLines = [];
                this.verticalGridLines = [];
                for (let i = 0; i < gridLength; i++) {
                    const distance = i * gridOption.grid;
                    const fhorizontal = new fabric.Line([distance, -width, distance, width], lineOptions);
                    const shorizontal = new fabric.Line([distance - width, -width, distance - width, width], lineOptions);
                    this.canvas.add(fhorizontal);
                    this.canvas.add(shorizontal);
                    const fvertical = new fabric.Line([-width, distance - width, width, distance - width], lineOptions);
                    const svertical = new fabric.Line([-width, distance, width, distance], lineOptions);
                    this.canvas.add(fvertical);
                    this.canvas.add(svertical);
                    if (i % 5 === 0) {
                        fhorizontal.set({ stroke: '#cccccc' });
                        shorizontal.set({ stroke: '#cccccc' });
                        fvertical.set({ stroke: '#cccccc' });
                        svertical.set({ stroke: '#cccccc' });
                    }
                }
            }
        },
        setCoords: (target) => {
            const { gridOption: { enabled, grid, snapToGrid } } = this.props;
            if (enabled && grid && snapToGrid) {
                if (target.type === 'activeSelection') {
                    target.set({
                        left: Math.round(target.left / grid) * grid,
                        top: Math.round(target.top / grid) * grid,
                    });
                    target.setCoords();
                    target.getObjects().forEach((obj) => {
                        if (obj.superType === 'node') {
                            const left = target.left + obj.left + (target.width / 2);
                            const top = target.top + obj.top + (target.height / 2);
                            this.portHandlers.setCoords({ ...obj, left, top });
                            if (obj.iconButton) {
                                obj.iconButton.set({
                                    left: obj.left + 5,
                                    top: obj.top + 5,
                                });
                            }
                        }
                    });
                    return;
                }
                target.set({
                    left: Math.round(target.left / grid) * grid,
                    top: Math.round(target.top / grid) * grid,
                });
                target.setCoords();
                this.portHandlers.setCoords(target);
            }
        },
    }

    eventHandlers = {
        object: {
            mousedown: (opt) => {
                const { target } = opt;
                if (target && target.link && target.link.enabled) {
                    const { onLink } = this.props;
                    if (onLink) {
                        onLink(this.canvas, target);
                    }
                }
            },
            mousedblclick: (opt) => {
                const { target } = opt;
                if (target) {
                    const { onDblClick } = this.props;
                    if (onDblClick) {
                        onDblClick(this.canvas, target);
                    }
                }
            },
        },
        modified: (opt) => {
            const { target } = opt;
            if (!target) {
                return;
            }
            if (target.type === 'circle' && target.parentId) {
                return;
            }
            const { onModified } = this.props;
            if (onModified) {
                onModified(target);
            }
        },
        moving: (opt) => {
            const { target } = opt;
            if (this.interactionMode === 'crop') {
                this.cropHandlers.moving(opt);
            } else {
                if (this.props.editable && this.props.guidelineOption.enabled) {
                    this.guidelineHandlers.movingGuidelines(target);
                }
                if (target.type === 'activeSelection') {
                    target.getObjects().forEach((obj) => {
                        if (obj.superType === 'node') {
                            const left = target.left + obj.left + (target.width / 2);
                            const top = target.top + obj.top + (target.height / 2);
                            this.portHandlers.setCoords({ ...obj, left, top });
                            if (obj.iconButton) {
                                obj.iconButton.set({
                                    left: obj.left + 5,
                                    top: obj.top + 5,
                                });
                            }
                        }
                    });
                    return;
                }
                if (target.superType === 'node') {
                    this.portHandlers.setCoords(target);
                    if (target.iconButton) {
                        target.iconButton.set({
                            left: target.left + 5,
                            top: target.top + 5,
                        });
                    }
                } else if (this.handlers.isElementType(target.type)) {
                    const el = this.elementHandlers.findById(target.id);
                    // update the element
                    this.elementHandlers.setPosition(el, target.left, target.top);
                }
            }
        },
        moved: (opt) => {
            const { target } = opt;
            this.gridHandlers.setCoords(target);
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
            if (activeObject.id === 'workarea') {
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
            const { zoomEnabled } = this.props;
            if (!zoomEnabled) {
                return;
            }
            const delta = opt.e.deltaY;
            let zoomRatio = this.canvas.getZoom();
            if (delta > 0) {
                zoomRatio -= 0.05;
            } else {
                zoomRatio += 0.05;
            }
            this.zoomHandlers.zoomToPoint(new fabric.Point(this.canvas.width / 2, this.canvas.height / 2), zoomRatio);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        },
        mousedown: (opt) => {
            if (opt.e.ctrlKey) {
                this.modeHandlers.grab();
                this.panning = true;
                return;
            }
            if (this.interactionMode === 'grab') {
                this.panning = true;
                return;
            }
            const { editable } = this.props;
            const { target } = opt;
            if (editable) {
                if (this.prevTarget && this.prevTarget.superType === 'link') {
                    this.prevTarget.set({
                        stroke: this.prevTarget.originStroke,
                    });
                }
                if (target && target.type === 'fromPort') {
                    if (this.interactionMode === 'link' && this.activeLine) {
                        console.warn('Already drawing links.');
                        return;
                    }
                    this.linkHandlers.init(target);
                    return;
                }
                if (target && this.interactionMode === 'link' && (target.type === 'toPort' || target.superType === 'node')) {
                    let toPort;
                    if (target.superType === 'node') {
                        toPort = target.toPort;
                    } else {
                        toPort = target;
                    }
                    if (toPort && toPort.links.some(link => link.fromNode.id === this.activeLine.fromNode)) {
                        console.warn('Duplicate connections can not be made.');
                        return;
                    }
                    this.linkHandlers.generate(toPort);
                    return;
                }
                this.viewportTransform = this.canvas.viewportTransform;
                this.zoom = this.canvas.getZoom();
                if (this.interactionMode === 'selection') {
                    if (target && target.superType === 'link') {
                        target.set({
                            stroke: target.selectedStroke || 'green',
                        });
                    }
                    this.prevTarget = target;
                    return;
                }
                if (this.interactionMode === 'polygon') {
                    if (target && this.pointArray.length && target.id === this.pointArray[0].id) {
                        this.drawingHandlers.polygon.generate(this.pointArray);
                    } else {
                        this.drawingHandlers.polygon.addPoint(opt);
                    }
                } else if (this.interactionMode === 'line') {
                    if (this.pointArray.length && this.activeLine) {
                        this.drawingHandlers.line.generate(opt);
                    } else {
                        this.drawingHandlers.line.addPoint(opt);
                    }
                } else if (this.interactionMode === 'arrow') {
                    if (this.pointArray.length && this.activeLine) {
                        this.drawingHandlers.arrow.generate(opt);
                    } else {
                        this.drawingHandlers.arrow.addPoint(opt);
                    }
                }
            }
        },
        mousemove: (opt) => {
            if (this.interactionMode === 'grab' && this.panning) {
                this.modeHandlers.moving(opt.e);
                this.canvas.requestRenderAll();
                return;
            }
            if (!this.props.editable && opt.target) {
                if (this.handlers.isElementType(opt.target.type)) {
                    return false;
                }
                if (opt.target.id !== 'workarea') {
                    if (opt.target !== this.target) {
                        this.tooltipHandlers.show(opt.target);
                    }
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
                    this.canvas.requestRenderAll();
                }
            } else if (this.interactionMode === 'line') {
                if (this.activeLine && this.activeLine.class === 'line') {
                    const pointer = this.canvas.getPointer(opt.e);
                    this.activeLine.set({ x2: pointer.x, y2: pointer.y });
                }
                this.canvas.requestRenderAll();
            } else if (this.interactionMode === 'arrow') {
                if (this.activeLine && this.activeLine.class === 'line') {
                    const pointer = this.canvas.getPointer(opt.e);
                    this.activeLine.set({ x2: pointer.x, y2: pointer.y });
                }
                this.canvas.requestRenderAll();
            } else if (this.interactionMode === 'link') {
                if (this.activeLine && this.activeLine.class === 'line') {
                    const pointer = this.canvas.getPointer(opt.e);
                    this.activeLine.set({ x2: pointer.x, y2: pointer.y });
                }
                this.canvas.requestRenderAll();
            }
        },
        mouseup: (opt) => {
            if (this.interactionMode === 'grab') {
                this.panning = false;
                return;
            }
            const { target, e } = opt;
            if (this.interactionMode === 'selection') {
                if (target && e.shiftKey && target.superType === 'node') {
                    this.canvas.discardActiveObject();
                    const nodes = [];
                    this.nodeHandlers.getNodePath(target, nodes);
                    const activeSelection = new fabric.ActiveSelection(nodes, {
                        canvas: this.canvas,
                        ...this.props.activeSelection,
                    });
                    this.canvas.setActiveObject(activeSelection);
                    this.canvas.requestRenderAll();
                }
            }
            if (this.props.editable && this.props.guidelineOption.enabled) {
                this.verticalLines.length = 0;
                this.horizontalLines.length = 0;
            }
            this.canvas.renderAll();
        },
        mouseout: (opt) => {
            if (!opt.target) {
                this.tooltipHandlers.hide();
            }
        },
        selection: (opt) => {
            const { onSelect, activeSelection } = this.props;
            const { target } = opt;
            if (target && target.type === 'activeSelection') {
                target.set({
                    ...activeSelection,
                });
            }
            if (onSelect) {
                onSelect(target);
            }
        },
        beforeRender: (opt) => {
            this.canvas.clearContext(this.ctx);
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
                if (this.props.gridOption.enabled) {
                    return;
                }
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
                    if (nextWidth < this.workarea.width * scaleX) {
                        scaleX = scaleX * (nextWidth / (this.workarea.width * scaleX));
                    }
                } else {
                    if (nextHeight < this.workarea.height * scaleX) {
                        scaleX = scaleX * (nextHeight / (this.workarea.height * scaleX));
                    }
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
                        try {
                            const objects = JSON.parse(textPlain);
                            const { gridOption: { grid = 10 } } = this.props;
                            if (objects && Array.isArray(objects)) {
                                const filteredObjects = objects.filter(obj => obj !== null);
                                if (filteredObjects.length === 1) {
                                    const obj = filteredObjects[0];
                                    if (typeof obj.cloned !== 'undefined' && !obj.cloned) {
                                        return false;
                                    }
                                    obj.left = obj.properties.left + grid;
                                    obj.top = obj.properties.top + grid;
                                    const createdObj = this.handlers.add(obj, false, true);
                                    this.canvas.setActiveObject(createdObj);
                                    this.canvas.requestRenderAll();
                                } else {
                                    const nodes = [];
                                    const targets = [];
                                    objects.forEach((obj) => {
                                        if (!obj) {
                                            return false;
                                        }
                                        if (obj.superType === 'link') {
                                            obj.fromNode = nodes[obj.fromNodeIndex].id;
                                            obj.toNode = nodes[obj.toNodeIndex].id;
                                        } else {
                                            obj.left = obj.properties.left + grid;
                                            obj.top = obj.properties.top + grid;
                                        }
                                        const createdObj = this.handlers.add(obj, false, true);
                                        if (obj.superType === 'node') {
                                            nodes.push(createdObj);
                                        } else {
                                            targets.push(createdObj);
                                        }
                                    });
                                    const activeSelection = new fabric.ActiveSelection(nodes.length ? nodes : targets, {
                                        canvas: this.canvas,
                                        ...this.props.activeSelection,
                                    });
                                    this.canvas.setActiveObject(activeSelection);
                                    this.canvas.requestRenderAll();
                                }
                                this.handlers.copy();
                            }
                        } catch (error) {
                            console.error(error);
                            // const item = {
                            //     id: uuid(),
                            //     type: 'textbox',
                            //     text: textPlain,
                            // };
                            // this.handlers.add(item, true);
                        }
                    } else if (clipboardType === 'text/html') {
                        // Todo ...
                        // const textHtml = clipboardData.getData('text/html');
                        // console.log(textHtml);
                    } else if (clipboardType === 'Files') {
                        // Array.from(clipboardData.files).forEach((file) => {
                        //     const { type } = file;
                        //     if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
                        //         const item = {
                        //             id: uuid(),
                        //             type: 'image',
                        //             file,
                        //             superType: 'image',
                        //         };
                        //         this.handlers.add(item, true);
                        //     } else {
                        //         console.error('Not supported file type');
                        //     }
                        // });
                    }
                });
            }
        },
        /**
         * Document keyboard event
         *
         * @param {KeyboardEvent} e
         * @returns {any}
         */
        keydown: (e) => {
            const { keyEvent } = this;
            if (!Object.keys(keyEvent).length) {
                return false;
            }
            const { editable } = this.props;
            const { move, all, copy, paste, esc, del, clipboard, transaction } = keyEvent;
            if (e.keyCode === 87) {
                this.keyCode = e.keyCode;
            } else if (e.keyCode === 81) {
                this.keyCode = e.keyCode;
            }
            if (e.ctrlKey) {
                this.canvas.defaultCursor = 'grab';
                if (this.workarea.hoverCursor) {
                    this.workarea.hoverCursor = 'grab';
                }
            }
            if (e.keyCode === 27 && esc) {
                if (this.interactionMode === 'selection') {
                    this.canvas.discardActiveObject();
                    this.canvas.renderAll();
                } else if (this.interactionMode === 'polygon') {
                    this.drawingHandlers.polygon.finish();
                } else if (this.interactionMode === 'line') {
                    this.drawingHandlers.line.finish();
                } else if (this.interactionMode === 'arrow') {
                    this.drawingHandlers.arrow.finish();
                } else if (this.interactionMode === 'link') {
                    this.linkHandlers.finish();
                }
                this.tooltipHandlers.hide();
            }
            if (this.canvas.wrapperEl !== document.activeElement) {
                return false;
            }
            if (editable) {
                if (e.keyCode === 46 && del) {
                    this.handlers.remove();
                } else if (e.code.includes('Arrow') && move) {
                    this.eventHandlers.arrowmoving(e);
                } else if (e.ctrlKey && e.keyCode === 65 && all) {
                    e.preventDefault();
                    this.handlers.allSelect();
                } else if (e.ctrlKey && e.keyCode === 67 && copy) {
                    e.preventDefault();
                    this.handlers.copy();
                } else if (e.ctrlKey && e.keyCode === 86 && paste && !clipboard) {
                    e.preventDefault();
                    this.handlers.paste();
                } else if (e.keyCode === 90 && transaction) {
                    e.preventDefault();
                    this.transactionHandlers.undo();
                } else if (e.keyCode === 88 && transaction) {
                    e.preventDefault();
                    this.transactionHandlers.redo();
                }
                return false;
            }
        },
        keyup: (e) => {
            if (this.keyCode !== 87) {
                this.canvas.defaultCursor = 'default';
                if (this.workarea.hoverCursor) {
                    this.workarea.hoverCursor = 'default';
                }
                this.modeHandlers.selection();
            }
        },
        contextmenu: (e) => {
            e.preventDefault();
            const { editable, onContext } = this.props;
            if (editable && onContext) {
                const target = this.canvas.findTarget(e);
                if (target && target.type !== 'activeSelection') {
                    this.handlers.select(target);
                }
                this.contextmenuHandlers.show(e, target);
            }
        },
        onmousedown: (e) => {
            this.contextmenuHandlers.hide();
        },
    }

    transactionHandlers = {
        /**
         * Transaction init function
         *
         */
        init: () => {
            this.redos = [];
            this.undos = [];
        },
        /**
         * Transaction save function
         * 
         * @param {fabric.Object} target
         * @param {'add' | 'remove' | 'moved' | 'scaled' | 'rotated' | 'skewed'} type
         * @returns {boolean}
         */
        save: (target, type) => {
            if (!type) {
                console.warn('Must enter the transaction type');
                return false;
            }
            const { propertiesToInclude } = this.props;
            const undo = { type };
            if (target.superType === 'node') {
                undo.target = {
                    id: target.id,
                    name: target.name,
                    description: target.description,
                    superType: target.superType,
                    type: target.type,
                    nodeClazz: target.nodeClazz,
                    configuration: target.configuration,
                    properties: {
                        left: target.left || 0,
                        top: target.top || 0,
                        iconName: target.descriptor.icon,
                    },
                };
            } else if (target.superType === 'link') {
                undo.target = {
                    id: target.id,
                    type: target.type,
                    superType: target.superType,
                    fromNode: target.fromNode.id,
                    fromPort: target.fromPort,
                    toNode: target.toNode.id,
                };
            } else if (target.type === 'activeSelection') {

            } else {

            }
            this.undos.push(undo);
        },
        /**
         * Transaction undo function
         * @returns {any}
         */
        undo: () => {
            const undo = this.undos.pop();
            if (!undo) {
                return false;
            }
            const { target, type } = undo;
            if (type === 'add') {
                if (target.superType === 'link') {
                    const findObject = this.handlers.findById(target.id);
                    this.linkHandlers.remove(findObject);
                } else {
                    this.handlers.removeById(target.id);
                }
            } else if (type === 'remove') {
                if (target.superType === 'node') {
                    target.left = target.properties.left;
                    target.top = target.properties.top;
                }
                this.handlers.add({ ...target, id: null }, false, true);
            } else if (type === 'moved') {
                
            } else if (type === 'scaled') {
                
            } else if (type === 'rotated') {
                
            } else if (type === 'skewed') {
                
            }
            this.redos.push(undo);
            return undo;
        },
        /**
         * Transaction redo function
         * @returns {any}
         */
        redo: () => {
            const redo = this.redos.pop();
            if (!redo) {
                return false;
            }
            const { target, type } = redo;
            if (type === 'add') {
                if (target.superType === 'link') {
                    this.linkHandlers.remove(target);
                } else {
                    this.handlers.removeById(target.id);
                }
                this.redos.push({
                    target,
                    type: 'remove',
                });
            } else if (type === 'remove') {
                if (target.superType === 'link') {
                    
                } else {
                    
                }
            } else if (type === 'moved') {
                
            } else if (type === 'scaled') {
                
            } else if (type === 'rotated') {
                
            } else if (type === 'skewed') {
                
            }
            this.undos.push(redo);
            return redo;
        },
    }

    render() {
        const { id } = this.state;
        return (
            <div
                ref={this.container}
                id="rde-canvas"
                className="rde-canvas"
                style={{ width: '100%', height: '100%' }}
            >
                <canvas id={`canvas_${id}`} />
            </div>
        );
    }
}

export default Canvas;
