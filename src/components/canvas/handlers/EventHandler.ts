import { fabric } from 'fabric';

import Handler from './Handler';
import { FabricObject, FabricEvent } from '../utils';
import { VideoObject } from '../objects/Video';

class EventHandler {
    handler: Handler;
    keyCode: number;
    panning: boolean;
    constructor(handler: Handler) {
        this.handler = handler;
    }

    objectMousedown = (opt: FabricEvent) => {
        const { target }: { target?: FabricObject } = opt;
        if (target && target.link && target.link.enabled) {
            const { onLink } = this.handler;
            if (onLink) {
                onLink(this.handler.canvas, target);
            }
        }
    }

    objectMousedblclick = (opt: FabricEvent) => {
        const { target } = opt;
        if (target) {
            const { onDblClick } = this.handler;
            if (onDblClick) {
                onDblClick(this.handler.canvas, target);
            }
        }
    }

    modified = (opt: FabricEvent) => {
        const { target } = opt;
        if (!target) {
            return;
        }
        if (target.type === 'circle' && target.parentId) {
            return;
        }
        const { onModified } = this.handler;
        if (onModified) {
            onModified(target);
        }
    }

    moving = (opt: FabricEvent) => {
        const { target } = opt;
        if (this.handler.interactionMode === 'crop') {
            this.handler.cropHandler.moving(opt);
        } else {
            if (this.handler.editable && this.handler.guidelineOption.enabled) {
                this.handler.guidelineHandler.movingGuidelines(target);
            }
            if (target.type === 'activeSelection') {
                const activeSelection = target as fabric.ActiveSelection;
                activeSelection.getObjects().forEach((obj: FabricObject) => {
                    const left = target.left + obj.left + (target.width / 2);
                    const top = target.top + obj.top + (target.height / 2);
                    if (obj.superType === 'node') {
                        this.handler.portHandler.setCoords({ ...obj, left, top });
                    } else if (obj.superType === 'element') {
                        const { id } = obj;
                        const el = this.handler.elementHandler.findById(id);
                        // TODO... Element object incorrect position
                        this.handler.elementHandler.setPositionByOrigin(el, obj, left, top);
                    }
                });
                return;
            }
            if (target.superType === 'node') {
                this.handler.portHandler.setCoords(target);
            } else if (target.superType === 'element') {
                const { id } = target;
                const el = this.handler.elementHandler.findById(id);
                this.handler.elementHandler.setPosition(el, target);
            }
        }
    }

    moved = (opt: FabricEvent) => {
        const { target } = opt;
        this.handler.gridHandler.setCoords(target);
        if (target.superType === 'element') {
            const { id } = target;
            const el = this.handler.elementHandler.findById(id);
            this.handler.elementHandler.setPosition(el, target);
        }
    }

    scaling = (opt: FabricEvent) => {
        const { target } = opt;
        if (this.handler.interactionMode === 'crop') {
            this.handler.cropHandler.resize(opt);
        }
        // TODO...this.handler.guidelineHandler.scalingGuidelines(target);
        if (target.superType === 'element') {
            const { id, width, height } = target;
            const el = this.handler.elementHandler.findById(id);
            // update the element
            this.handler.elementHandler.setScaleOrAngle(el, target);
            this.handler.elementHandler.setSize(el, target);
            this.handler.elementHandler.setPosition(el, target);
            const video = target as VideoObject;
            if (video.type === 'video' && video.player) {
                video.player.setPlayerSize(width, height);
            }
        }
    }

    rotating = (opt: FabricEvent) => {
        const { target } = opt;
        if (target.superType === 'element') {
            const { id } = target;
            const el = this.handler.elementHandler.findById(id);
            // update the element
            this.handler.elementHandler.setScaleOrAngle(el, target);
        }
    }

    arrowmoving = (e: KeyboardEvent) => {
        const activeObject = this.handler.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return false;
        }
        if (activeObject.id === 'workarea') {
            return false;
        }
        if (e.keyCode === 38) {
            activeObject.set('top', activeObject.top - 2);
            activeObject.setCoords();
            this.handler.canvas.renderAll();
        } else if (e.keyCode === 40) {
            activeObject.set('top', activeObject.top + 2);
            activeObject.setCoords();
            this.handler.canvas.renderAll();
        } else if (e.keyCode === 37) {
            activeObject.set('left', activeObject.left - 2);
            activeObject.setCoords();
            this.handler.canvas.renderAll();
        } else if (e.keyCode === 39) {
            activeObject.set('left', activeObject.left + 2);
            activeObject.setCoords();
            this.handler.canvas.renderAll();
        }
        if (this.handler.onModified) {
            this.handler.onModified(activeObject);
        }
    }

    mousewheel = (opt: FabricEvent) => {
        const { zoomEnabled } = this.handler;
        if (!zoomEnabled) {
            return;
        }
        const delta = opt.e.deltaY;
        let zoomRatio = this.handler.canvas.getZoom();
        if (delta > 0) {
            zoomRatio -= 0.05;
        } else {
            zoomRatio += 0.05;
        }
        this.handler.zoomHandler.zoomToPoint(new fabric.Point(this.handler.canvas.getWidth() / 2, this.handler.canvas.getHeight() / 2), zoomRatio);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    mousedown = (opt: FabricEvent) => {
        if (opt.e.ctrlKey) {
            this.handler.modeHandler.grab();
            this.panning = true;
            return;
        }
        if (this.handler.interactionMode === 'grab') {
            this.panning = true;
            return;
        }
        const { editable } = this.handler;
        const { target } = opt;
        if (editable) {
            if (this.handler.prevTarget && this.handler.prevTarget.superType === 'link') {
                this.handler.prevTarget.set({
                    stroke: this.handler.prevTarget.originStroke,
                });
            }
            if (target && target.type === 'fromPort') {
                if (this.handler.interactionMode === 'link' && this.handler.activeLine) {
                    console.warn('Already drawing links.');
                    return;
                }
                this.handler.linkHandler.init(target);
                return;
            }
            if (target && this.handler.interactionMode === 'link' && (target.type === 'toPort' || target.superType === 'node')) {
                let toPort;
                if (target.superType === 'node') {
                    toPort = target.toPort;
                } else {
                    toPort = target;
                }
                if (toPort && toPort.links.some(link => link.fromNode.id === this.handler.activeLine.fromNode)) {
                    console.warn('Duplicate connections can not be made.');
                    return;
                }
                this.handler.linkHandler.generate(toPort);
                return;
            }
            this.handler.guidelineHandler.viewportTransform = this.handler.canvas.viewportTransform;
            this.handler.guidelineHandler.zoom = this.handler.canvas.getZoom();
            if (this.handler.interactionMode === 'selection') {
                if (target && target.superType === 'link') {
                    target.set({
                        stroke: 'green',
                    });
                }
                this.handler.prevTarget = target;
                return;
            }
            if (this.handler.interactionMode === 'polygon') {
                if (target && this.handler.pointArray.length && target.id === this.handler.pointArray[0].id) {
                    this.handler.drawingHandler.polygon.generate(this.handler.pointArray);
                } else {
                    this.handler.drawingHandler.polygon.addPoint(opt);
                }
            } else if (this.handler.interactionMode === 'line') {
                if (this.handler.pointArray.length && this.handler.activeLine) {
                    this.handler.drawingHandler.line.generate(opt);
                } else {
                    this.handler.drawingHandler.line.addPoint(opt);
                }
            } else if (this.handler.interactionMode === 'arrow') {
                if (this.handler.pointArray.length && this.handler.activeLine) {
                    this.handler.drawingHandler.arrow.generate(opt);
                } else {
                    this.handler.drawingHandler.arrow.addPoint(opt);
                }
            }
        }
    }

    mousemove = (opt) => {
        if (this.handler.interactionMode === 'grab' && this.panning) {
            this.handler.modeHandler.moving(opt.e);
            this.handler.canvas.requestRenderAll();
            return;
        }
        if (!this.handler.editable && opt.target) {
            if (opt.target.superType === 'element') {
                return false;
            }
            if (opt.target.id !== 'workarea') {
                if (opt.target !== this.handler.target) {
                    this.handler.tooltipHandler.show(opt.target);
                }
            } else {
                this.handler.tooltipHandler.hide(opt.target);
            }
        }
        if (this.handler.interactionMode === 'polygon') {
            if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
                const pointer = this.handler.canvas.getPointer(opt.e);
                this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
                const points = this.handler.activeShape.get('points');
                points[this.handler.pointArray.length] = {
                    x: pointer.x,
                    y: pointer.y,
                };
                this.handler.activeShape.set({
                    points,
                });
                this.handler.canvas.requestRenderAll();
            }
        } else if (this.handler.interactionMode === 'line') {
            if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
                const pointer = this.handler.canvas.getPointer(opt.e);
                this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
            }
            this.handler.canvas.requestRenderAll();
        } else if (this.handler.interactionMode === 'arrow') {
            if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
                const pointer = this.handler.canvas.getPointer(opt.e);
                this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
            }
            this.handler.canvas.requestRenderAll();
        } else if (this.handler.interactionMode === 'link') {
            if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
                const pointer = this.handler.canvas.getPointer(opt.e);
                this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
            }
            this.handler.canvas.requestRenderAll();
        }
    }

    mouseup = (opt) => {
        if (this.handler.interactionMode === 'grab') {
            this.panning = false;
            return;
        }
        const { target, e } = opt;
        if (this.handler.interactionMode === 'selection') {
            if (target && e.shiftKey && target.superType === 'node') {
                this.handler.canvas.discardActiveObject();
                const nodes = [];
                this.handler.nodeHandler.getNodePath(target, nodes);
                const activeSelection = new fabric.ActiveSelection(nodes, {
                    canvas: this.handler.canvas,
                    ...this.handler.activeSelection,
                });
                this.canvas.setActiveObject(activeSelection);
                this.canvas.requestRenderAll();
            }
        }
        if (this.props.editable && this.props.guidelineOption.enabled) {
            this.handler.guidelineHandler.verticalLines.length = 0;
            this.handler.guidelineHandler.horizontalLines.length = 0;
        }
        this.canvas.renderAll();
    }

    mouseout = (opt: FabricEvent) => {
        if (!opt.target) {
            this.handler.tooltipHandler.hide();
        }
    }

    selection = (opt: FabricEvent) => {
        const { onSelect, activeSelection } = this.handler;
        const { target } = opt;
        if (target && target.type === 'activeSelection') {
            target.set({
                ...activeSelection,
            });
        }
        if (onSelect) {
            onSelect(target);
        }
    }

    beforeRender = (opt: FabricEvent) => {
        this.handler.canvas.clearContext(this.handler.guidelineHandler.ctx);
    }

    afterRender = (opt: FabricEvent) => {
        for (let i = this.handler.guidelineHandler.verticalLines.length; i--;) {
            this.handler.guidelineHandler.drawVerticalLine(this.handler.guidelineHandler.verticalLines[i]);
        }
        for (let i = this.handler.guidelineHandler.horizontalLines.length; i--;) {
            this.handler.guidelineHandler.drawHorizontalLine(this.handler.guidelineHandler.horizontalLines[i]);
        }
        this.handler.guidelineHandler.verticalLines.length = 0;
        this.handler.guidelineHandler.horizontalLines.length = 0;
    }

    resize = (currentWidth, currentHeight, nextWidth, nextHeight) => {
        this.currentWidth = currentWidth;
        this.canvas.setWidth(nextWidth).setHeight(nextHeight);
        if (!this.handler.workarea) {
            return;
        }
        const diffWidth = (nextWidth / 2) - (currentWidth / 2);
        const diffHeight = (nextHeight / 2) - (currentHeight / 2);
        if (this.handler.workarea.layout === 'fixed') {
            this.handler.canvas.centerObject(this.handler.workarea);
            this.handler.workarea.setCoords();
            if (this.handler.gridOption.enabled) {
                return;
            }
            this.handler.canvas.getObjects().forEach((obj, index) => {
                if (index !== 0) {
                    const left = obj.left + diffWidth;
                    const top = obj.top + diffHeight;
                    obj.set({
                        left,
                        top,
                    });
                    obj.setCoords();
                    if (obj.superType === 'element') {
                        const { id } = obj;
                        const el = this.handler.elementHandler.findById(id);
                        // update the element
                        this.handler.elementHandler.setPosition(el, obj);
                    }
                }
            });
            this.handler.canvas.renderAll();
            return;
        }
        let scaleX = nextWidth / this.handler.workarea.width;
        const scaleY = nextHeight / this.handler.workarea.height;
        if (this.handler.workarea.layout === 'responsive') {
            if (this.handler.workarea.height > this.handler.workarea.width) {
                scaleX = scaleY;
                if (nextWidth < this.handler.workarea.width * scaleX) {
                    scaleX = scaleX * (nextWidth / (this.handler.workarea.width * scaleX));
                }
            } else {
                if (nextHeight < this.handler.workarea.height * scaleX) {
                    scaleX = scaleX * (nextHeight / (this.handler.workarea.height * scaleX));
                }
            }
            const deltaPoint = new fabric.Point(diffWidth, diffHeight);
            this.handler.canvas.relativePan(deltaPoint);
            const center = this.handler.canvas.getCenter();
            this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
            this.handler.canvas.renderAll();
            return;
        }
        const diffScaleX = nextWidth / (this.handler.workarea.width * this.handler.workarea.scaleX);
        const diffScaleY = nextHeight / (this.handler.workarea.height * this.handler.workarea.scaleY);
        this.handler.workarea.set({
            scaleX,
            scaleY,
        });
        this.handler.canvas.getObjects().forEach((obj: FabricObject) => {
            const { id } = obj;
            if (obj.id !== 'workarea') {
                const left = obj.left * diffScaleX;
                const top = obj.top * diffScaleY;
                const newScaleX = obj.scaleX * diffScaleX;
                const newScaleY = obj.scaleY * diffScaleY;
                obj.set({
                    scaleX: newScaleX,
                    scaleY: newScaleY,
                    left,
                    top,
                });
                obj.setCoords();
                if (obj.superType === 'element') {
                    const { width, height } = obj;
                    const el = this.handler.elementHandler.findById(id);
                    this.handler.elementHandler.setSize(el, obj);
                    if (obj.player) {
                        obj.player.setPlayerSize(width, height);
                    }
                    this.handler.elementHandler.setPosition(el, obj);
                }
            }
        });
        this.handler.canvas.renderAll();
    }

    paste = (e) => {
        if (this.handler.canvas.wrapperEl !== document.activeElement) {
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
                        const { gridOption: { grid = 10 } } = this.handler;
                        if (objects && Array.isArray(objects)) {
                            const filteredObjects = objects.filter(obj => obj !== null);
                            if (filteredObjects.length === 1) {
                                const obj = filteredObjects[0];
                                if (typeof obj.cloned !== 'undefined' && !obj.cloned) {
                                    return false;
                                }
                                obj.left = obj.properties.left + grid;
                                obj.top = obj.properties.top + grid;
                                const createdObj = this.handler.add(obj, false, true);
                                this.handler.canvas.setActiveObject(createdObj);
                                this.handler.canvas.requestRenderAll();
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
                                    const createdObj = this.handler.add(obj, false, true);
                                    if (obj.superType === 'node') {
                                        nodes.push(createdObj);
                                    } else {
                                        targets.push(createdObj);
                                    }
                                });
                                const activeSelection = new fabric.ActiveSelection(nodes.length ? nodes : targets, {
                                    canvas: this.handler.canvas,
                                    ...this.handler.activeSelection,
                                });
                                this.handler.canvas.setActiveObject(activeSelection);
                                this.handler.canvas.requestRenderAll();
                            }
                            this.handler.copy();
                        }
                    } catch (error) {
                        console.error(error);
                        // const item = {
                        //     id: uuid(),
                        //     type: 'textbox',
                        //     text: textPlain,
                        // };
                        // this.handler.add(item, true);
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
                    //         this.handler.add(item, true);
                    //     } else {
                    //         console.error('Not supported file type');
                    //     }
                    // });
                }
            });
        }
    }

    /**
     * Document keyboard event
     *
     * @param {KeyboardEvent} e
     * @returns {any}
     */
    keydown = (e: KeyboardEvent) => {
        const { keyEvent } = this.handler;
        if (!Object.keys(keyEvent).length) {
            return false;
        }
        const { editable } = this.handler;
        const { move, all, copy, paste, esc, del, clipboard, transaction } = keyEvent;
        if (e.keyCode === 87) {
            this.keyCode = e.keyCode;
        } else if (e.keyCode === 81) {
            this.keyCode = e.keyCode;
        }
        if (e.ctrlKey) {
            this.handler.canvas.defaultCursor = 'grab';
            if (this.handler.workarea.hoverCursor) {
                this.handler.workarea.hoverCursor = 'grab';
            }
        }
        if (e.keyCode === 27 && esc) {
            if (this.handler.interactionMode === 'selection') {
                this.handler.canvas.discardActiveObject();
                this.handler.canvas.renderAll();
            } else if (this.handler.interactionMode === 'polygon') {
                this.handler.drawingHandler.polygon.finish();
            } else if (this.handler.interactionMode === 'line') {
                this.handler.drawingHandler.line.finish();
            } else if (this.handler.interactionMode === 'arrow') {
                this.handler.drawingHandler.arrow.finish();
            } else if (this.handler.interactionMode === 'link') {
                this.handler.linkHandler.finish();
            }
            this.handler.tooltipHandler.hide();
        }
        if (this.handler.canvas.wrapperEl !== document.activeElement) {
            return false;
        }
        if (editable) {
            if (e.keyCode === 46 && del) {
                this.handler.remove();
            } else if (e.code.includes('Arrow') && move) {
                this.arrowmoving(e);
            } else if (e.ctrlKey && e.keyCode === 65 && all) {
                e.preventDefault();
                this.handler.allSelect();
            } else if (e.ctrlKey && e.keyCode === 67 && copy) {
                e.preventDefault();
                this.handler.copy();
            } else if (e.ctrlKey && e.keyCode === 86 && paste && !clipboard) {
                e.preventDefault();
                this.handler.paste();
            } else if (e.keyCode === 90 && transaction) {
                e.preventDefault();
                this.handler.transactionHandler.undo();
            } else if (e.keyCode === 88 && transaction) {
                e.preventDefault();
                this.handler.transactionHandler.redo();
            }
            return false;
        }
    }

    keyup = (e: KeyboardEvent) => {
        if (this.keyCode !== 87) {
            this.handler.canvas.defaultCursor = 'default';
            if (this.handler.workarea.hoverCursor) {
                this.handler.workarea.hoverCursor = 'default';
            }
            this.handler.modeHandler.selection();
        }
    }

    contextmenu = (e: MouseEvent) => {
        e.preventDefault();
        const { editable, onContext } = this.handler;
        if (editable && onContext) {
            const target = this.handler.canvas.findTarget(e, false);
            if (target && target.type !== 'activeSelection') {
                this.handler.select(target);
            }
            this.handler.contextmenuHandler.show(e, target);
        }
    }

    onmousedown = (e: MouseEvent) => {
        this.handler.contextmenuHandler.hide();
    }
}

export default EventHandler;
