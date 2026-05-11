import * as fabric from 'fabric';

import { registerFabricClass, resolveFromObject, toObject } from '../utils';

class CirclePort extends fabric.Circle {
	static type = 'port';
	superType = 'port';

	constructor(options: any = {}) {
		super(options);
	}

	setPosition(left: number, top: number) {
		this.set({ left, top });
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
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new CirclePort(options), callback);
	}
}

registerFabricClass('CirclePort', CirclePort, 'circlePort');

export default CirclePort;
