import { fabric } from 'fabric';

import { FabricObject } from '../utils';
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
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

Port.fromObject = (options: PortObject, callback: (obj: PortObject) => any) => {
	return callback(new Port(options));
};

// @ts-ignore
window.fabric.Port = Port;

export default Port;
