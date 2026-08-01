import { classRegistry } from 'fabric';
import type { Canvas, FabricObject } from 'fabric';

type FabricClass = (new (...args: any[]) => any) & {
	type?: string;
	prototype: any;
};

export const getCanvasElementPosition = (obj: FabricObject, canvas: Canvas) => {
	const center = obj.getCenterPoint().transform(canvas.viewportTransform);
	const wrapperLeft = canvas.wrapperEl?.offsetLeft || 0;
	const wrapperTop = canvas.wrapperEl?.offsetTop || 0;
	return {
		left: center.x + wrapperLeft - obj.width / 2,
		top: center.y + wrapperTop - obj.height / 2,
	};
};

export const toObject = (
	serialized: any,
	obj: any,
	propertiesToInclude: string[] = [],
	properties?: { [key: string]: any },
) => {
	return Object.assign(
		serialized,
		properties ?? {},
		...propertiesToInclude.map(property => ({
			[property]: obj.get(property),
		})),
	);
};

export const resolveFromObject = <T>(instance: T, callback?: any) => {
	if (typeof callback === 'function') {
		callback(instance);
	}
	return Promise.resolve(instance);
};

export const registerFabricClass = <T extends FabricClass>(name: string, ctor: T, ...aliases: string[]) => {
	const types = new Set<string>();
	[name, ctor.type, ...aliases].forEach(type => {
		if (typeof type === 'string' && type) {
			types.add(type);
		}
	});
	types.forEach(type => {
		try {
			classRegistry.setClass(ctor, type);
		} catch (error) {
			// Ignore duplicate registrations for overridden Fabric classes.
		}
	});
	return ctor;
};

export const createDOMElement = <K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	attributes: Record<string, any> = {},
): HTMLElementTagNameMap[K] => {
	const element = document.createElement(tagName);
	Object.entries(attributes).forEach(([key, value]) => {
		if (value === null || typeof value === 'undefined') {
			return;
		}
		if (key === 'class') {
			element.className = String(value);
			return;
		}
		if (key === 'for' && element instanceof HTMLLabelElement) {
			element.htmlFor = String(value);
			return;
		}
		if (key === 'style' && typeof value === 'string') {
			element.setAttribute('style', value);
			return;
		}
		if (key in element) {
			(element as Record<string, any>)[key] = value;
			return;
		}
		element.setAttribute(key, String(value));
	});
	return element;
};

export const wrapDOMElement = <K extends keyof HTMLElementTagNameMap>(
	element: HTMLElement,
	tagName: K,
	attributes: Record<string, any> = {},
) => {
	const wrapper = createDOMElement(tagName, attributes);
	if (element.parentNode) {
		element.parentNode.insertBefore(wrapper, element);
	}
	wrapper.appendChild(element);
	return wrapper;
};
