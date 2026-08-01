import type * as fabric from 'fabric';

import { ChartObject } from '../objects/Chart';
import { ElementObject } from '../objects/Element';
import { IframeObject } from '../objects/Iframe';
import { VideoObject } from '../objects/Video';
import { getCanvasElementPosition } from '../utils';
import Handler from './Handler';

export type ElementType = 'container' | 'script' | 'style';

export type ElementObjectType = VideoObject | ChartObject | IframeObject | ElementObject;

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
	 * Set element by id
	 * @param {string} id
	 * @param {*} source
	 * @returns {void}
	 */
	public setById = (id: string, source: any): void => {
		const obj = this.handler.findById(id) as unknown as ElementObjectType;
		if (!obj) {
			return;
		}
		this.set(obj, source);
	};

	/**
	 * Set element
	 * @param {ElementObjectType} obj
	 * @param {*} source
	 */
	public set = (obj: ElementObjectType, source: any) => {
		obj.setSource(source);
	};

	/**
	 * Find element by id with type
	 * @param {string} id
	 * @param {ElementType} [type='container']
	 * @returns
	 */
	public findById = (id: string, type: ElementType = 'container') => {
		return document.getElementById(`${id}_${type}`);
	};

	/**
	 * Remove element
	 * @param {HTMLElement} el
	 * @returns
	 */
	public remove = (el: HTMLElement) => {
		if (!el) {
			return;
		}
		this.handler.container.removeChild(el);
	};

	/**
	 * Remove element by id
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
	};

	/**
	 * Remove element by ids
	 * @param {string[]} ids
	 */
	public removeByIds = (ids: string[]) => {
		ids.forEach(id => {
			this.removeById(id);
		});
	};

	/**
	 * Set position
	 * @param {HTMLElement} el
	 * @param {number} left
	 * @param {number} top
	 * @returns
	 */
	public setPosition = (el: HTMLElement, obj: fabric.FabricObject) => {
		if (!el) {
			return;
		}
		const { left, top } = getCanvasElementPosition(obj, this.handler.canvas);
		el.style.left = `${left}px`;
		el.style.top = `${top}px`;
	};

	/**
	 * Set size
	 * @param {HTMLElement} el
	 * @param {number} width
	 * @param {number} height
	 * @returns
	 */
	public setSize = (el: HTMLElement, obj: fabric.FabricObject) => {
		if (!el) {
			return;
		}
		const { width, height } = obj;
		el.style.width = `${width}px`;
		el.style.height = `${height}px`;
	};

	/**
	 * Set scale or angle
	 * @param {HTMLElement} el
	 * @param {number} scaleX
	 * @param {number} scaleY
	 * @param {number} angle
	 * @returns
	 */
	public setScaleOrAngle = (el: HTMLElement, obj: fabric.FabricObject) => {
		if (!el) {
			return;
		}
		const zoom = this.handler.canvas.getZoom();
		const { scaleX, scaleY, angle } = obj;
		el.style.transform = `rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom})`;
	};
}

export default ElementHandler;
