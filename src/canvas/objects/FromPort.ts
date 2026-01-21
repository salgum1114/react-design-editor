import { fabric } from 'fabric';
import { PortObject } from './Port';

const FromPort = fabric.util.createClass(fabric.Path, {
	type: 'port',
	superType: 'port',
	initialize(options: any = {}) {
		const { radius = 12, connected } = options;
		const path = connected
			? [
					['M', -radius, 0],
					['A', radius, radius, 0, 1, 0, radius, 0],
					['A', radius, radius, 0, 1, 0, -radius, 0],
					['Z'],
				]
			: [['M', -radius, 0], ['A', radius, radius * 0.75, 0, 0, 0, radius, 0], ['L', 0, 0], ['Z']];
		this.callSuper('initialize', path, options);
	},
	setPosition(left: number, top: number) {
		this.set({ left, top: top + (this.connected ? 0 : this.height + (this.strokeWidth ?? 0)) });
	},
	setConnected(connected?: boolean) {
		const radius = connected ? 4 : 12;
		const strokeWidth = connected ? 0 : 2;
		const fill = connected ? this.connectedFill : this.originFill;
		this.initialize({ ...this.toObject(), connected, radius, strokeWidth, fill });
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
			connected: this.get('connected'),
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

FromPort.fromObject = (options: PortObject, callback: (obj: PortObject) => any) => {
	return callback(new FromPort(options));
};

// @ts-ignore
window.fabric.FromPort = FromPort;

export default FromPort;
