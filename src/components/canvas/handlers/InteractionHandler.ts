import { fabric } from 'fabric';

import Handler from './Handler';
import { FabricObject, InteractionMode } from '../utils';

class InteractionHandler {
    handler: Handler;
    constructor(handler: Handler) {
        this.handler = handler;
    }

    public selection = (callback?: (obj: FabricObject) => any) => {
        if (this.handler.interactionMode === 'selection') {
            return;
        }
        this.handler.interactionMode = 'selection';
        if (typeof this.handler.canvasOption.selection === 'undefined') {
            this.handler.canvas.selection = true;
        } else {
            this.handler.canvas.selection = this.handler.canvasOption.selection;
        }
        this.handler.canvas.defaultCursor = 'default';
        this.handler.workarea.hoverCursor = 'default';
        this.handler.canvas.getObjects().forEach((obj: any) => {
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
        this.handler.canvas.renderAll();
    }

    public grab = (callback?: (obj: FabricObject) => any) => {
        if (this.handler.interactionMode === 'grab') {
            return;
        }
        this.handler.interactionMode = 'grab';
        this.handler.canvas.selection = false;
        this.handler.canvas.defaultCursor = 'grab';
        this.handler.workarea.hoverCursor = 'grab';
        this.handler.canvas.getObjects().forEach((obj: any) => {
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
                    obj.evented = this.handler.editable ? false : true;
                }
            }
        });
        this.handler.canvas.renderAll();
    }

    public drawing = (type?: InteractionMode, callback?: (obj: FabricObject) => any) => {
        if (this.isDrawingMode()) {
            return;
        }
        this.handler.interactionMode = type;
        this.handler.canvas.selection = false;
        this.handler.canvas.defaultCursor = 'pointer';
        this.handler.workarea.hoverCursor = 'pointer';
        this.handler.canvas.getObjects().forEach((obj: any) => {
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
                    obj.evented = this.handler.editable ? false : true;
                }
            }
        });
        this.handler.canvas.renderAll();
    }

    public moving = (e: any) => {
        if (this.isDrawingMode()) {
            return;
        }
        const delta = new fabric.Point(e.movementX, e.movementY);
        this.handler.getObjects().forEach(obj => {
            if (obj.superType === 'element') {
                const { id } = obj;
                const el = this.handler.elementHandler.findById(id);
                // update the element
                this.handler.elementHandler.setPosition(el, obj);
            }
        });
        this.handler.canvas.relativePan(delta);
    }

    /**
     * @description Whether is drawing mode
     * @returns
     */
    public isDrawingMode = () => {
        return this.handler.interactionMode === 'link'
        || this.handler.interactionMode === 'arrow'
        || this.handler.interactionMode === 'line'
        || this.handler.interactionMode === 'polygon';
    }
}

export default InteractionHandler;
