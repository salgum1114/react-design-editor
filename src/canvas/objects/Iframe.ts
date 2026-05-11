import * as fabric from 'fabric';
import { FabricElement } from '../models';
import { createDOMElement, registerFabricClass, resolveFromObject, toObject, wrapDOMElement } from '../utils';

export interface IframeObject extends FabricElement {
	setSource: (source: string) => void;
	setSrc: (src: string) => void;
	src: string;
	iframeElement: HTMLIFrameElement;
}

class Iframe extends fabric.Rect {
	static type = 'iframe';
	superType = 'element';
	hasRotatingPoint = false;
	declare element: HTMLDivElement;
	declare container: string;
	declare iframeElement: HTMLIFrameElement;
	declare src: string;

	constructor(src = '', options: any = {}) {
		super(options);
		this.set({
			src,
			fill: 'rgba(255, 255, 255, 0)',
			stroke: 'rgba(255, 255, 255, 0)',
		});
	}

	setSource(source: any) {
		this.setSrc(source);
	}

	setSrc(src: string) {
		this.set({ src });
		if (this.iframeElement) {
			this.iframeElement.src = src;
		}
	}

	toObject(propertiesToInclude: any[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			src: this.get('src'),
			container: this.get('container'),
			editable: this.get('editable'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		if (!this.element) {
			const id = this.get('id') as string;
			const editable = this.get('editable') as boolean;
			const { scaleX, scaleY, width, height, angle, src } = this;
			const zoom = this.canvas.getZoom();
			const { tl } = this.calcOCoords();
			const left = tl.x;
			const top = tl.y;
			const padLeft = (width * scaleX * zoom - width) / 2;
			const padTop = (height * scaleY * zoom - height) / 2;
			this.iframeElement = createDOMElement('iframe', {
				id,
				src,
				width: '100%',
				height: '100%',
			});
			this.element = wrapDOMElement(this.iframeElement, 'div', {
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
			document.getElementById(this.container)?.appendChild(this.element);
		}
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new Iframe(options.src, options), callback);
	}
}

registerFabricClass('Iframe', Iframe);

export default Iframe;
