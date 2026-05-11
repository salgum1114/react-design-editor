import * as fabric from 'fabric';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';

class ToPort extends fabric.Path {
	static type = 'toPort';
	superType = 'port';

	private static createPath(options: any = {}) {
		const { width, height, connected, radius = 10 } = options;
		return connected
			? [
					['M', -radius, 0],
					['A', radius, radius, 0, 1, 0, radius, 0],
					['A', radius, radius, 0, 1, 0, -radius, 0],
					['Z'],
				]
			: [['M', 0, 0], ['H', width], ['V', height], ['H', 0], ['Z']];
	}

	constructor(options: any = {}) {
		super(ToPort.createPath(options) as any, options);
	}

	private updateShape(options: any = {}) {
		const nextPath = new fabric.Path(ToPort.createPath(options) as any, options);
		this.set({
			...options,
			path: nextPath.path,
			width: nextPath.width,
			height: nextPath.height,
			pathOffset: nextPath.pathOffset,
		});
	}

	setPosition(left: number, top: number) {
		this.set({
			left,
			top: top - ((this as any).connected ? 0 : this.height + (this.strokeWidth ?? 0)),
		});
	}

	setConnected(connected?: boolean) {
		const radius = connected ? 4 : 0;
		const strokeWidth = connected ? 0 : 2;
		const fill = connected ? (this as any).connectedFill : (this as any).originFill;
		const width = connected ? undefined : 24;
		const height = connected ? undefined : 6;
		this.updateShape({ ...this.toObject(), connected, radius, strokeWidth, fill, width, height });
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
		});
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new ToPort(options), callback);
	}
}

registerFabricClass('ToPort', ToPort, 'ToPort');

export default ToPort;
