import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import anime from 'animejs';

import CanvasObjects from './CanvasObjects';
import OrthogonalLink from '../workflow/link/OrthogonalLink';
import CurvedLink from '../workflow/link/CurvedLink';
import { Arrow } from './objects';
import { Handler } from './handlers';

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
        defaultOption: PropTypes.object,
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
        id: uuid(),
        editable: true,
        canvasOption: {
            selection: true,
        },
        defaultOption: {},
        activeSelection: {
            hasControls: true,
        },
        tooltip: null,
        zoomEnabled: true,
        minZoom: 30,
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
        this.fabricObjects = CanvasObjects(props.fabricObjects, props.defaultOption);
        this.container = React.createRef();
        this.objects = [];
        this.keyEvent = Object.assign({}, defaultKeyboardEvent, props.keyEvent);
        this.request = null;
    }

    state = {
        id: uuid(),
        clipboard: null,
    }

    componentDidMount() {
        const { id } = this.state;
        const { editable, canvasOption, guidelineOption, fabricObjects, defaultOption } = this.props;
        const mergedCanvasOption = Object.assign({}, defaultCanvasOption, canvasOption);
        this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
        this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        this.canvas.renderAll();
        this.handler = new Handler({
            id,
            canvas: this.canvas,
            objects: this.objects,
            container: this.container.current,
            fabricObjects: this.fabricObjects,
            ...this.props,
        });
        this.handler.gridHandler.init();
        const { modified, moving, moved, scaling, rotating, mousewheel, mousedown, mousemove, mouseup, mouseout, selection, beforeRender, afterRender } = this.handler.eventHandler;
        if (editable) {
            this.handler.transactionHandler.init();
            this.handler.interactionMode = 'selection';
            this.panning = false;
            if (guidelineOption.enabled) {
                this.handler.guidelineHandler.init();
            }
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
                this.handler.eventHandler.resize(prevWidth, prevHeight, currentWidth, currentHeight);
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
            this.handler.fabricObjects = CanvasObjects(this.props.fabricObjects);
        } else if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption)) {
            this.workarea.set({
                ...this.props.workareaOption,
            });
        } else if (JSON.stringify(this.props.guidelineOption) !== JSON.stringify(prevProps.guidelineOption)) {
            if (this.props.guidelineOption.enabled) {
                this.canvas.on({
                    'before:render': this.handler.eventHandler.beforeRender,
                    'after:render': this.handler.eventHandler.afterRender,
                });
            } else {
                this.canvas.off({
                    'before:render': this.handler.eventHandler.beforeRender,
                    'after:render': this.handler.eventHandler.afterRender,
                });
            }
        }
    }

    componentWillUnmount() {
        this.detachEventListener();
        const { editable } = this.props;
        const { modified, moving, moved, scaling, rotating, mousewheel, mousedown, mousemove, mouseup, mouseout, selection, beforeRender, afterRender } = this.handler.eventHandler;
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
                object.off('mousedown', this.handler.eventHandler.objectMousedown);
                if (object.anime) {
                    anime.remove(object);
                }
            });
        }
        this.handlers.clear(true);
        if (this.handler.tooltipHandler.tooltipEl) {
            document.body.removeChild(this.handler.tooltipHandler.tooltipEl);
        }
        if (this.handler.contextmenuHandler.contextmenuEl) {
            document.body.removeChild(this.handler.contextmenuHandler.contextmenuEl);
        }
    }

    attachEventListener = () => {
        // if add canvas wrapper element event, tabIndex = 1000;
        this.canvas.wrapperEl.tabIndex = 1000;
        document.addEventListener('keydown', this.handler.eventHandler.keydown, false);
        document.addEventListener('keyup', this.handler.eventHandler.keyup, false);
        document.addEventListener('mousedown', this.handler.eventHandler.onmousedown, false);
        this.canvas.wrapperEl.addEventListener('contextmenu', this.handler.eventHandler.contextmenu, false);
        if (this.keyEvent.clipboard) {
            document.addEventListener('paste', this.handler.eventHandler.paste, false);
        }
    }

    detachEventListener = () => {
        document.removeEventListener('keydown', this.handler.eventHandler.keydown);
        document.removeEventListener('keyup', this.handler.eventHandler.keyup);
        document.removeEventListener('mousedown', this.handler.eventHandler.onmousedown);
        this.canvas.wrapperEl.removeEventListener('contextmenu', this.handler.eventHandler.contextmenu);
        if (this.keyEvent.clipboard) {
            document.removeEventListener('paste', this.handler.eventHandler.paste);
        }
    }

    /* eslint-disable react/sort-comp, react/prop-types */
    handlers = {
        /**
         * Remove object
         *
         * @param {fabric.Object} target
         * @returns {any}
         */
        remove: (target) => {
            const activeObject = target || this.canvas.getActiveObject();
            if (this.handler.prevTarget && this.handler.prevTarget.superType === 'link') {
                this.handler.linkHandler.remove(this.handler.prevTarget);
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
                if (activeObject.superType === 'element') {
                    this.handler.elementHandler.removeById(activeObject.id);
                }
                if (activeObject.superType === 'link') {
                    this.handler.linkHandler.remove(activeObject);
                } else if (activeObject.superType === 'node') {
                    if (activeObject.toPort) {
                        if (activeObject.toPort.links.length) {
                            activeObject.toPort.links.forEach((link) => {
                                this.handler.linkHandler.remove(link, 'from');
                            });
                        }
                        this.canvas.remove(activeObject.toPort);
                    }
                    if (activeObject.fromPort && activeObject.fromPort.length) {
                        activeObject.fromPort.forEach((port) => {
                            if (port.links.length) {
                                port.links.forEach((link) => {
                                    this.handler.linkHandler.remove(link, 'to');
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
                    if (obj.superType === 'element') {
                        this.handler.elementHandler.removeById(obj.id);
                    } else if (obj.superType === 'node') {
                        if (obj.toPort) {
                            if (obj.toPort.links.length) {
                                obj.toPort.links.forEach((link) => {
                                    this.handler.linkHandler.remove(link, 'from');
                                });
                            }
                            this.canvas.remove(obj.toPort);
                        }
                        if (obj.fromPort && obj.fromPort.length) {
                            obj.fromPort.forEach((port) => {
                                if (port.links.length) {
                                    port.links.forEach((link) => {
                                        this.handler.linkHandler.remove(link, 'to');
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
                            obj.on('mousedblclick', this.handler.eventHandler.objectMousedblclick);
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
                        clonedObj.on('mousedblclick', this.handler.eventHandler.objectMousedblclick);
                    }
                    if (onAdd) {
                        onAdd(clonedObj);
                    }
                }
                this.canvas.setActiveObject(clonedObj);
                this.handler.portHandler.create(clonedObj);
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
                        cloned.on('mousedblclick', this.handler.eventHandler.objectMousedblclick);
                    }
                    this.canvas.setActiveObject(cloned);
                    this.handler.portHandler.create(cloned);
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
                                                    type: 'curvedLink',
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
                        this.handlers.copyToClipboard(JSON.stringify(cloned.toObject(propertiesToInclude), null, '\t'));
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
                            clonedObj.on('mousedblclick', this.handler.eventHandler.objectMousedblclick);
                        }
                        this.canvas.add(clonedObj);
                        this.objects = this.handlers.getObjects();
                        this.handler.portHandler.create(clonedObj);
                        objects.push(clonedObj);
                    });
                    if (linkObjects.length) {
                        linkObjects.forEach((linkObject) => {
                            const { fromNode, fromPort, toNodeIndex } = linkObject;
                            const toNode = objects[toNodeIndex];
                            const link = {
                                type: 'curvedLink',
                                fromNode,
                                fromPort,
                                toNode: toNode.id,
                                toPort: toNode.toPort.id,
                            };
                            this.handler.linkHandler.create(link);
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
                            obj.on('mousedblclick', this.handler.eventHandler.objectMousedblclick);
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
                        clonedObj.on('mousedblclick', this.handler.eventHandler.obj);
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
                this.handler.portHandler.create(clonedObj);
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
            const { id, superType, type, player, width, height } = activeObject;
            if (superType === 'element') {
                if (key === 'visible') {
                    if (value) {
                        activeObject.element.style.display = 'block';
                    } else {
                        activeObject.element.style.display = 'none';
                    }
                }
                const el = this.handler.elementHandler.findById(id);
                // update the element
                this.handler.elementHandler.setScaleOrAngle(el, activeObject);
                this.handler.elementHandler.setSize(el, activeObject);
                this.handler.elementHandler.setPosition(el, activeObject);
                if (type === 'video' && player) {
                    player.setPlayerSize(width, height);
                }
            }
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
            const { id, superType, type, player, width, height } = activeObject;
            if (superType === 'element') {
                if ('visible' in option) {
                    if (option.visible) {
                        activeObject.element.style.display = 'block';
                    } else {
                        activeObject.element.style.display = 'none';
                    }
                }
                const el = this.handler.elementHandler.findById(id);
                // update the element
                this.handler.elementHandler.setScaleOrAngle(el, activeObject);
                this.handler.elementHandler.setSize(el, activeObject);
                this.handler.elementHandler.setPosition(el, activeObject);
                if (type === 'video' && player) {
                    player.setPlayerSize(width, height);
                }
            }
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
            const { id, superType, type, player, width, height } = obj;
            if (superType === 'element') {
                if (key === 'visible') {
                    if (value) {
                        obj.element.style.display = 'block';
                    } else {
                        obj.element.style.display = 'none';
                    }
                }
                const el = this.handler.elementHandler.findById(id);
                // update the element
                this.handler.elementHandler.setScaleOrAngle(el, obj);
                this.handler.elementHandler.setSize(el, obj);
                this.handler.elementHandler.setPosition(el, obj);
                if (type === 'video' && player) {
                    player.setPlayerSize(width, height);
                }
            }
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
         * @param {fabric.Object} obj
         * @param {*} option
         */
        setByPartial: (obj, option) => {
            if (!obj) {
                return;
            }
            obj.set(option);
            obj.setCoords();
            this.canvas.renderAll();
            const { id, superType, type, player, width, height } = obj;
            if (superType === 'element') {
                if ('visible' in option) {
                    if (option.visible) {
                        obj.element.style.display = 'block';
                    } else {
                        obj.element.style.display = 'none';
                    }
                }
                const el = this.handler.elementHandler.findById(id);
                // update the element
                this.handler.elementHandler.setScaleOrAngle(el, obj);
                this.handler.elementHandler.setSize(el, obj);
                this.handler.elementHandler.setPosition(el, obj);
                if (type === 'video' && player) {
                    player.setPlayerSize(width, height);
                }
            }
        },
        setShadow: (option) => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return false;
            }
            activeObject.setShadow(option);
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
        setVisible: (visible) => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject) {
                return;
            }
            if (activeObject.superType === 'element') {
                if (visible) {
                    activeObject.element.style.display = 'block';
                } else {
                    activeObject.element.style.display = 'none';
                }
            }
            activeObject.set({
                visible,
            });
            this.canvas.renderAll();
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
                } else if (obj.superType === 'element') {
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
            const { id } = activeObject;
            const obj = {
                id,
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
            if (!this.handler.workarea) {
                this.handler.workareaHandler.init();
            }
            if (!workareaExist.length) {
                this.canvas.centerObject(this.handler.workarea);
                this.handler.workarea.setCoords();
                prevLeft = this.handler.workarea.left;
                prevTop = this.handler.workarea.top;
            } else {
                const workarea = workareaExist[0];
                prevLeft = workarea.left;
                prevTop = workarea.top;
                this.handler.workarea.set(workarea);
                this.canvas.centerObject(this.handler.workarea);
                this.handler.workareaHandler.setImage(workarea.src, true);
                this.handler.workarea.setCoords();
            }
            setTimeout(() => {
                json.forEach((obj) => {
                    if (obj.id === 'workarea') {
                        return;
                    }
                    const canvasWidth = this.canvas.getWidth();
                    const canvasHeight = this.canvas.getHeight();
                    const { width, height, scaleX, scaleY, layout, left, top } = this.handler.workarea;
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
                    if (obj.superType === 'element') {
                        obj.id = uuid();
                    }
                    this.handler.add(obj, false, true);
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
                if (curr.superType === 'element') {
                    prev.push(curr.id);
                    return prev;
                }
                return prev;
            }, []);
            this.handler.elementHandler.removeByIds(ids);
            if (workarea) {
                canvas.clear();
                this.handler.workarea = null;
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
                ...this.props.defaultOption,
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

    drawingHandlers = {
        polygon: {
            init: () => {
                this.handler.modeHandler.drawing(null, 'polygon');
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
                this.handler.modeHandler.selection();
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
                this.handler.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.activeShape = null;
                this.handler.modeHandler.selection();
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
                this.handler.modeHandler.drawing(null, 'line');
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
                this.handler.modeHandler.selection();
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
                this.handler.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.handler.modeHandler.selection();
            },
        },
        arrow: {
            init: () => {
                this.handler.modeHandler.drawing(null, 'arrow');
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
                this.handler.modeHandler.selection();
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
                this.handler.add(option, false);
                this.pointArray = [];
                this.activeLine = null;
                this.handler.modeHandler.selection();
            },
        },
        orthogonal: {

        },
        curve: {

        },
    }

    render() {
        const { id } = this.state;
        return (
            <div
                ref={this.container}
                id={id}
                className="rde-canvas"
                style={{ width: '100%', height: '100%' }}
            >
                <canvas id={`canvas_${id}`} />
            </div>
        );
    }
}

export default Canvas;
