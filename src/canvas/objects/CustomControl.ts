import * as fabric from 'fabric';
import { FabricObject } from '../models';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';

export interface CustomControlObject extends FabricObject<fabric.Rect> {
	nodeId?: string;
	enabled?: boolean;
	transaction?: boolean;
	setPosition: (left: number, top: number) => void;
}

class CustomControl extends fabric.Group {
	static type = 'CustomControl';
	superType = 'control';

	constructor(options: any = {}) {
		super([], {
			originX: 'center',
			originY: 'center',
			selectable: false,
			evented: false,
			visible: false,
			...options,
		});
	}

	setPosition(left: number, top: number) {
		this.set({ left, top });
		this.setCoords();
	}

	setVisibility(visible: boolean) {
		this.set('visible', visible);
		this.set('dirty', true);
		this.canvas?.requestRenderAll();
	}

	toObject(propertiesToInclude: any[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			id: this.get('id'),
			superType: this.get('superType'),
			enabled: this.get('enabled'),
			nodeId: this.get('nodeId'),
			label: this.get('label'),
			fontSize: this.get('fontSize'),
			fontFamily: this.get('fontFamily'),
			color: this.get('color'),
		});
	}

	static fromObject(options: any, _abortable?: any) {
		return resolveFromObject(new CustomControl(options));
	}
}

registerFabricClass('CustomControl', CustomControl);

export default CustomControl;
