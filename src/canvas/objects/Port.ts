import { fabric } from 'fabric';

import { FabricObject } from '../models';
import { LinkObject } from './Link';

export interface PortObject extends FabricObject<fabric.Rect> {
	links?: LinkObject[];
	nodeId?: string;
	enabled?: boolean;
	hoverFill?: string;
	selectFill?: string;
}

const Port = fabric.util.createClass(fabric.Rect, {
	type: 'port',
	superType: 'port',
	initialize(options: any) {
		options = options || {};
		this.callSuper('initialize', options);
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
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
		if (this.label) {
			ctx.save();
			ctx.font = `${this.fontSize || 12}px ${this.fontFamily || 'Helvetica'}`;
			ctx.fillStyle = this.color || '#000';
			const { width } = ctx.measureText(this.label);
			ctx.rotate((360 - this.angle) * (Math.PI / 180));
			ctx.fillText(this.label, -width / 2, this.height + 14);
			ctx.restore();
		}
	},
});

Port.fromObject = (options: PortObject, callback: (obj: PortObject) => any) => {
	return callback(new Port(options));
};

// @ts-ignore
window.fabric.Port = Port;

export default Port;
