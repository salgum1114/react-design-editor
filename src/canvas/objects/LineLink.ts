import * as fabric from 'fabric';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';
import { NodeObject, OUT_PORT_TYPE } from './Node';
import { PortObject } from './Port';

export interface LineLinkObject extends FabricObject<fabric.Line> {
	fromNode?: NodeObject;
	toNode?: NodeObject;
	fromPort?: PortObject;
	toPort?: PortObject;
	fromPortIndex?: number;
	setPort?: (fromNode: NodeObject, fromPort: PortObject, toNode: NodeObject, toPort: PortObject) => void;
	setPortEnabled?: (node: NodeObject, port: PortObject, enabled: boolean) => void;
}

class LineLink extends fabric.Line {
	static type = 'lineLink';
	superType = 'link';
	declare fromNode: Partial<NodeObject>;
	declare fromPort: Partial<PortObject>;
	declare toNode: Partial<NodeObject>;
	declare toPort: Partial<PortObject>;

	constructor(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		options: Partial<LineLinkObject> = {},
	) {
		const coords: [number, number, number, number] = [
			fromPort.left ?? 0,
			fromPort.top ?? 0,
			toPort.left ?? 0,
			toPort.top ?? 0,
		];
		const nextOptions = {
			...options,
			strokeWidth: 4,
			id: options.id || uuid(),
			originX: 'center' as const,
			originY: 'center' as const,
			lockScalingX: true,
			lockScalingY: true,
			lockRotation: true,
			hasRotatingPoint: false,
			hasControls: false,
			hasBorders: false,
			perPixelTargetFind: true,
			lockMovementX: true,
			lockMovementY: true,
			selectable: false,
			fromNode,
			fromPort,
			toNode,
			toPort,
			hoverCursor: 'pointer',
		};
		super(coords, nextOptions);
		this.fromNode = fromNode;
		this.fromPort = fromPort;
		this.toNode = toNode;
		this.toPort = toPort;
	}

	setPort(fromNode: NodeObject, fromPort: PortObject, _toNode: NodeObject, toPort: PortObject) {
		const resolvedPort = fromNode.type === 'BroadcastNode' ? fromNode.fromPort[0] : fromPort;
		resolvedPort.links.push(this as any);
		toPort.links.push(this as any);
		this.setPortEnabled(fromNode, resolvedPort, false);
	}

	setPortEnabled(node: NodeObject, port: PortObject, enabled: boolean) {
		if (node.descriptor.outPortType !== OUT_PORT_TYPE.BROADCAST) {
			port.set({ enabled, fill: port.originFill });
		} else {
			if (node.toPort.id === port.id) {
				return;
			}
			port.links.forEach((link, index) => {
				link.set({ fromPort: port, fromPortIndex: index });
			});
			node.set({ configuration: { outputCount: port.links.length } });
		}
	}

	toObject(propertiesToInclude: any[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			id: this.get('id'),
			name: this.get('name'),
			superType: this.get('superType'),
			configuration: this.get('configuration'),
			fromNode: this.get('fromNode'),
			fromPort: this.get('fromPort'),
			toNode: this.get('toNode'),
			toPort: this.get('toPort'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		ctx.save();
		const xDiff = this.x2 - this.x1;
		const yDiff = this.y2 - this.y1;
		const angle = Math.atan2(yDiff, xDiff);
		ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
		ctx.rotate(angle);
		ctx.beginPath();
		if ((this as any).arrow) {
			ctx.moveTo(5, 0);
			ctx.lineTo(-5, 5);
			ctx.lineTo(-5, -5);
		}
		ctx.closePath();
		ctx.lineWidth = this.strokeWidth;
		ctx.fillStyle = this.stroke as string;
		ctx.fill();
		ctx.restore();
	}

	static fromObject(options: any, _abortable?: any) {
		return resolveFromObject(
			new LineLink(options.fromNode, options.fromPort, options.toNode, options.toPort, options),
		);
	}
}

registerFabricClass('LineLink', LineLink);

export default LineLink;
