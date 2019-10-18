import { fabric } from 'fabric';

import Handler from './Handler';
import { VideoObject } from '../objects/Video';
import { ChartObject } from '../objects/Chart';
import { IFrameObject } from '../objects/IFrame';
import { ElementObject } from '../objects/Element';

export type ElementType = 'container' | 'script' | 'style';

export type ElementObjectType = VideoObject | ChartObject | IFrameObject | ElementObject;

export interface ElementCode {
    html?: string;
    css?: string;
    js?: string;
}

class ElementHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * @description Set element by id
     * @param {string} id
     * @param {*} source
     * @returns {void}
     */
    public setById = (id: string, source: any): void => {
        const obj = this.handler.findById(id) as ElementObjectType;
        if (!obj) {
            return;
        }
        this.set(obj, source);
    }

    /**
     * @description Set element
     * @param {ElementObjectType} obj
     * @param {*} source
     */
    public set = (obj: ElementObjectType, source: any) => {
        obj.setSource(source);
    }

    /**
     * @description Find element by id with type
     * @param {string} id
     * @param {ElementType} [type='container']
     * @returns
     */
    public findById = (id: string, type: ElementType = 'container') => {
        return document.getElementById(`${id}_${type}`);
    }

    /**
     * @description Remove element
     * @param {HTMLElement} el
     * @returns
     */
    public remove = (el: HTMLElement) => {
        if (!el) {
            return;
        }
        this.handler.container.removeChild(el);
    }

    /**
     * @description Remove element by id
     * @param {string} id
     */
    public removeById = (id: string) => {
        const el = this.findById(id);
        const scriptEl = this.findById(id, 'script');
        const styleEl = this.findById(id, 'style');
        if (el) {
            if (el.remove) {
                el.remove();
            } else {
                this.remove(el);
            }
        }
        if (scriptEl) {
            if (scriptEl.remove) {
                scriptEl.remove();
            } else {
                document.head.removeChild(scriptEl);
            }
        }
        if (styleEl) {
            if (styleEl.remove) {
                styleEl.remove();
            } else {
                document.head.removeChild(styleEl);
            }
        }
    }

    /**
     * @description Remove element by ids
     * @param {string[]} ids
     */
    public removeByIds = (ids: string[]) => {
        ids.forEach(id => {
            this.removeById(id);
        });
    }

    /**
     * @description Set position
     * @param {HTMLElement} el
     * @param {number} left
     * @param {number} top
     * @returns
     */
    public setPosition = (el: HTMLElement, obj: fabric.Object) => {
        if (!el) {
            return;
        }
        obj.setCoords();
        const zoom = this.handler.canvas.getZoom();
        const { scaleX, scaleY, width, height } = obj;
        const { left, top } = obj.getBoundingRect(false);
        const padLeft = ((width * scaleX * zoom) - width) / 2;
        const padTop = ((height * scaleY * zoom) - height) / 2;
        el.style.left = `${left + padLeft}px`;
        el.style.top = `${top + padTop}px`;
    }

    /**
     * @description Set size
     * @param {HTMLElement} el
     * @param {number} width
     * @param {number} height
     * @returns
     */
    public setSize = (el: HTMLElement, obj: fabric.Object) => {
        if (!el) {
            return;
        }
        const { width, height } = obj;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
    }

    /**
     * @description Set scale or angle
     * @param {HTMLElement} el
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} angle
     * @returns
     */
    public setScaleOrAngle = (el: HTMLElement, obj: fabric.Object) => {
        if (!el) {
            return;
        }
        const zoom = this.handler.canvas.getZoom();
        const { scaleX, scaleY, angle } = obj;
        el.style.transform = `rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom})`;
    }
}

export default ElementHandler;
