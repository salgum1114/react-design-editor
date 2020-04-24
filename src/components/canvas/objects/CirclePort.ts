import { fabric } from 'fabric';

import { PortObject } from './Port';

const CirclePort = fabric.util.createClass(fabric.Circle, {
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
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

CirclePort.fromObject = (options: PortObject, callback: (obj: PortObject) => any) => {
	return callback(new CirclePort(options));
};

// @ts-ignore
window.fabric.CirclePort = CirclePort;

export default CirclePort;
