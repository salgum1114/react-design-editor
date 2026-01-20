import { fabric } from 'fabric';
import { PortObject } from './Port';

const ToPort = fabric.util.createClass(fabric.Path, {
	type: 'port',
	superType: 'port',
	initialize(options: any = {}) {
		const { width, height, connected, radius = 10 } = options;
		const path = connected
			? [
					['M', -radius, 0],
					['A', radius, radius, 0, 1, 0, radius, 0],
					['A', radius, radius, 0, 1, 0, -radius, 0],
					['Z'],
				]
			: [['M', 0, 0], ['H', width], ['V', height], ['H', 0], ['Z']];
		this.callSuper('initialize', path, options);
	},
	setPosition(left: number, top: number) {
		this.set({
			left: left - this.width / 2,
			top: top - (this.connected ? this.height / 2 : this.height + this.strokeWidth + 2),
		});
	},
	setConnected(connected?: boolean) {
		const radius = connected ? 4 : 0;
		const strokeWidth = connected ? 0 : 2;
		const fill = connected ? this.connectedFill : this.originFill;
		const width = connected ? undefined : 24;
		const height = connected ? undefined : 6;
		this.initialize({ ...this.toObject(), connected, radius, strokeWidth, fill, width, height });
		this.setCoords();
		this.canvas.requestRenderAll();
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

ToPort.fromObject = (options: PortObject, callback: (obj: PortObject) => any) => {
	return callback(new ToPort(options));
};

// @ts-ignore
window.fabric.ToPort = ToPort;

export default ToPort;
