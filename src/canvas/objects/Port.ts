import * as fabric from 'fabric';

import { FabricObject } from '../models';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';
import { LinkObject } from './Link';

export type PortObject = FabricObject<fabric.Rect> & {
	links?: LinkObject[];
	nodeId?: string;
	enabled?: boolean;
	connected?: boolean;
	transaction?: boolean;
	setPosition?: (left: number, top: number) => void;
	setConnected?: (connected?: boolean) => void;
};

class Port extends fabric.Rect {
	static type = 'port';
	superType = 'port';

	constructor(options: any = {}) {
		super(options);
	}

	setPosition(left: number, top: number) {
		this.set({ left, top });
		this.setCoords();
	}

	setConnected(connected?: boolean) {
		const fill = connected ? (this as any).connectedFill : (this as any).originFill;
		this.set({ connected, fill });
		this.setCoords();
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
			connected: this.get('connected'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		if ((this as any).label) {
			ctx.save();
			ctx.font = `${(this as any).fontSize || 12}px ${(this as any).fontFamily || 'Helvetica'}`;
			ctx.fillStyle = (this as any).color || '#000';
			const { width } = ctx.measureText((this as any).label);
			ctx.rotate((360 - this.angle) * (Math.PI / 180));
			ctx.fillText((this as any).label, -width / 2, this.height + 14);
			ctx.restore();
		}
	}

	static fromObject(options: any, _abortable?: any) {
		return resolveFromObject(new Port(options));
	}
}

registerFabricClass('Port', Port);

export default Port;
