import * as fabric from 'fabric';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';

class FromPort extends fabric.Path {
	static type = 'fromPort';
	superType = 'port';

	private static createPath(options: any = {}) {
		const { radius = 12, connected } = options;
		return connected
			? [
					['M', -radius, 0],
					['A', radius, radius, 0, 1, 0, radius, 0],
					['A', radius, radius, 0, 1, 0, -radius, 0],
					['Z'],
				]
			: [['M', -radius, 0], ['A', radius, radius * 0.75, 0, 0, 0, radius, 0], ['L', 0, 0], ['Z']];
	}

	constructor(options: any = {}) {
		super(FromPort.createPath(options) as any, options);
	}

	private updateShape(options: any = {}) {
		const nextPath = new fabric.Path(FromPort.createPath(options) as any, options);
		this.set({
			...options,
			path: nextPath.path,
			width: nextPath.width,
			height: nextPath.height,
			pathOffset: nextPath.pathOffset,
		});
	}

	setPosition(left: number, top: number) {
		this.set({ left, top: top + ((this as any).connected ? 0 : this.height + (this.strokeWidth ?? 0)) });
	}

	setConnected(connected?: boolean) {
		const radius = connected ? 4 : 12;
		const strokeWidth = connected ? 0 : 2;
		const fill = connected ? (this as any).connectedFill : (this as any).originFill;
		this.updateShape({ ...this.toObject(), connected, radius, strokeWidth, fill });
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

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new FromPort(options), callback);
	}
}

registerFabricClass('FromPort', FromPort, 'FromPort');

export default FromPort;
