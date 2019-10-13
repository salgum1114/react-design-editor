import { fabric } from 'fabric';

import Handler from './Handler';

export type ElementType = 'container' | 'script' | 'style';

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
        const obj = this.handler.findById(id);
        if (!obj) {
            return;
        }
        if (obj.type === 'video') {
            this.handler.videoHandler.set(obj, source);
        } else if (obj.type === 'element') {
            this.set(obj, source);
        } else if (obj.type === 'iframe') {
            this.set(obj, source);
        }
    }

    /**
     * @description Set element
     * @param {fabric.Object} obj
     * @param {*} source
     */
    public set = (obj: fabric.Object, source: any) => {
        if (obj.type === 'iframe') {
            this.createIFrame(obj, source);
        } else {
            this.createElement(obj, source);
        }
    }

    /**
     * @description Create element
     * @param {fabric.Object} obj
     * @param {ElementCode} [code={}]
     */
    createElement = (obj: fabric.Object, code: ElementCode = {}) => {
        obj.set('code', code);
        const { editable } = this.handler;
        const zoom = this.handler.canvas.getZoom();
        const left = obj.calcCoords().tl.x;
        const top = obj.calcCoords().tl.y;
        const { id, scaleX, scaleY, width, height, angle } = obj;
        const padLeft = ((width * scaleX * zoom) - width) / 2;
        const padTop = ((height * scaleY * zoom) - height) / 2;
        if (editable) {
            this.removeById(id);
        }
        const element = fabric.util.makeElement('div', {
            id: `${id}_container`,
            style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                    width: ${width}px;
                    height: ${height}px;
                    left: ${left + padLeft}px;
                    top: ${top + padTop}px;
                    position: absolute;
                    user-select: ${editable ? 'none' : 'auto'};
                    pointer-events: ${editable ? 'none' : 'auto'};`,
        });
        const { html, css, js } = code;
        if (code.css && code.css.length) {
            const styleEl = document.createElement('style');
            styleEl.id = `${id}_style`;
            styleEl.type = 'text/css';
            styleEl.innerHTML = css;
            document.head.appendChild(styleEl);
        }
        this.handler.container.appendChild(element);
        if (code.js && code.js.length) {
            const scriptEl = document.createElement('script');
            scriptEl.id = `${id}_script`;
            scriptEl.type = 'text/javascript';
            scriptEl.innerHTML = js;
            document.head.appendChild(scriptEl);
        }
        element.innerHTML = html;
        obj.setCoords();
    }

    /**
     * @description Create IFrame
     * @param {fabric.Object} obj
     * @param {string} src
     */
    createIFrame = (obj: fabric.Object, src: string) => {
        obj.set('src', src);
        const { editable } = this.handler;
        const zoom = this.handler.canvas.getZoom();
        const left = obj.calcCoords().tl.x;
        const top = obj.calcCoords().tl.y;
        const { id, scaleX, scaleY, width, height, angle } = obj;
        const padLeft = ((width * scaleX * zoom) - width) / 2;
        const padTop = ((height * scaleY * zoom) - height) / 2;
        if (editable) {
            this.removeById(id);
        }
        const iframeElement = fabric.util.makeElement('iframe', {
            id,
            src,
            width: '100%',
            height: '100%',
        });
        const iframe = fabric.util.wrapElement(iframeElement, 'div', {
            id: `${id}_container`,
            style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                    width: ${width}px;
                    height: ${height}px;
                    left: ${left + padLeft}px;
                    top: ${top + padTop}px;
                    position: absolute;
                    user-select: ${editable ? 'none' : 'auto'};
                    pointer-events: ${editable ? 'none' : 'auto'};`,
        });
        this.handler.container.appendChild(iframe);
        obj.setCoords();
    }

    findById = (id: string, type: ElementType = 'container') => document.getElementById(`${id}_${type}`);

    /**
     * @description
     * @param {HTMLElement} el
     * @returns
     */
    remove = (el: HTMLElement) => {
        if (!el) {
            return;
        }
        this.handler.container.removeChild(el);
    }

    /**
     * @description
     * @param {string} id
     */
    removeById = (id: string) => {
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
     * @description
     * @param {string[]} ids
     */
    removeByIds = (ids: string[]) => {
        ids.forEach(id => {
            this.removeById(id);
        });
    }

    /**
     * @description
     * @param {HTMLElement} el
     * @param {number} left
     * @param {number} top
     * @returns
     */
    setPosition = (el: HTMLElement, left: number, top: number) => {
        if (!el) {
            return;
        }
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    /**
     * @description
     * @param {HTMLElement} el
     * @param {number} width
     * @param {number} height
     * @returns
     */
    setSize = (el: HTMLElement, width: number, height: number) => {
        if (!el) {
            return;
        }
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
    }

    /**
     * @description
     * @param {HTMLElement} el
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} angle
     * @returns
     */
    setScaleOrAngle = (el: HTMLElement, scaleX: number, scaleY: number, angle: number) => {
        if (!el) {
            return;
        }
        el.style.transform = `rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
    }
}

export default ElementHandler;
