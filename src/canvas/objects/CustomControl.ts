import { fabric } from 'fabric';
import { FabricObject } from '../models';

export interface CustomControlObject extends FabricObject<fabric.Rect> {
	nodeId?: string;
	enabled?: boolean;
	transaction?: boolean;
	setPosition: (left: number, top: number) => void;
}

const CustomControl = fabric.util.createClass(fabric.Group, {
	type: 'CustomControl',
	superType: 'control',
	initialize(options: any = {}) {
		this.callSuper('initialize', [], {
			originX: 'center',
			originY: 'center',
			selectable: false,
			evented: false,
			visible: false,
			...options,
		});
	},

	setPosition(left: number, top: number) {
		this.set({ left, top });
		this.setCoords();
	},

	setVisibility(visible: boolean) {
		this.set('visible', visible);
		this.set('dirty', true);
		this.canvas?.requestRenderAll();
	},

	toObject() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			id: this.get('id'),
			superType: this.get('superType'),
			enabled: this.get('enabled'),
			nodeId: this.get('nodeId'),
			label: this.get('label'),
			fontSize: this.get('fontSize'),
			fontFamily: this.get('fontFamily'),
			color: this.get('color'),
		});
	},
});

CustomControl.fromObject = (options: any, callback: (obj: any) => any) => {
	return callback(new CustomControl(options));
};

// @ts-ignore
window.fabric.CustomControl = CustomControl;

export default CustomControl;
