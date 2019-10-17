import { fabric } from 'fabric';

import { toObject } from '../utils';

export interface Code {
    html: string;
    css: string;
    js: string;
}

export interface ElementObject extends fabric.Rect {
    setSource: (source: Code) => void;
    setCode: (code: Code) => void;
    code: Code;
    container?: HTMLDivElement;
    element: HTMLDivElement;
}

const initialCode: Code = {
    html: '',
    css: '',
    js: '',
};

const Element = fabric.util.createClass(fabric.Rect, {
    type: 'element',
    superType: 'element',
    initialize(code = initialCode, options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        this.set({
            code,
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(255, 255, 255, 0)',
        });
    },
    setSource(source: any) {
        this.setCode(source);
    },
    setCode(code = initialCode) {
        this.set({
            code,
        });
        const { css, js, html } = code;
        this.styleEl.innerHTML = css;
        this.scriptEl.innerHTML = js;
        this.element.innerHTML = html;
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            code: this.get('code'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const { id, scaleX, scaleY, width, height, angle, editable, code } = this;
            const zoom = this.canvas.getZoom();
            const left = this.calcCoords().tl.x;
            const top = this.calcCoords().tl.y;
            const padLeft = ((width * scaleX * zoom) - width) / 2;
            const padTop = ((height * scaleY * zoom) - height) / 2;
            this.element = fabric.util.makeElement('div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left + padLeft}px;
                        top: ${top + padTop}px;
                        position: absolute;
                        user-select: ${editable ? 'none' : 'auto'};
                        pointer-events: ${editable ? 'none' : 'auto'};`,
            }) as HTMLDivElement;
            const { html, css, js } = code;
            this.styleEl = document.createElement('style');
            this.styleEl.id = `${id}_style`;
            this.styleEl.type = 'text/css';
            this.styleEl.innerHTML = css;
            document.head.appendChild(this.styleEl);

            this.scriptEl = document.createElement('script');
            this.scriptEl.id = `${id}_script`;
            this.scriptEl.type = 'text/javascript';
            this.scriptEl.innerHTML = js;
            document.head.appendChild(this.scriptEl);

            this.container.appendChild(this.element);
            this.element.innerHTML = html;
        }
    },
});

export default Element;
