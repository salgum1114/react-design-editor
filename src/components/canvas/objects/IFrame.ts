import { fabric } from 'fabric';

import { toObject, FabricElement } from '../utils';

export interface IFrameObject extends FabricElement {
    setSource: (source: string) => void;
    setSrc: (src: string) => void;
    src: string;
    iframeElement: HTMLIFrameElement;
}

const IFrame = fabric.util.createClass(fabric.Rect, {
    type: 'iframe',
    superType: 'element',
    hasRotatingPoint: false,
    initialize(src: string = '', options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        this.set({
            src,
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(255, 255, 255, 0)',
        });
    },
    setSource(source: any) {
        this.setSrc(source);
    },
    setSrc(src: string) {
        this.set({
            src,
        });
        this.iframeElement.src = src;
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            src: this.get('src'),
            container: this.get('container'),
            editable: this.get('editable'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const { id, scaleX, scaleY, width, height, angle, editable, src } = this;
            const zoom = this.canvas.getZoom();
            const left = this.calcCoords().tl.x;
            const top = this.calcCoords().tl.y;
            const padLeft = ((width * scaleX * zoom) - width) / 2;
            const padTop = ((height * scaleY * zoom) - height) / 2;
            this.iframeElement = fabric.util.makeElement('iframe', {
                id,
                src,
                width: '100%',
                height: '100%',
            });
            this.element = fabric.util.wrapElement(this.iframeElement, 'div', {
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
            const container = document.getElementById(this.container);
            container.appendChild(this.element);
        }
    },
});

IFrame.fromObject = (options: IFrameObject, callback: (obj: IFrameObject) => any) => {
    return callback(new IFrame(options.src, options));
};

window.fabric.IFrame = IFrame;

export default IFrame;
