import { fabric } from 'fabric';
import { svgPathProperties } from 'svg-path-properties';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { NodeObject, OUT_PORT_TYPE } from './Node';
import { PortObject } from './Port';

export interface LinkedNodePropeties {
	left: number;
	top: number;
	width?: number;
	height?: number;
}

export interface LinkObject extends FabricObject<fabric.Path> {
	fromNode?: NodeObject;
	toNode?: NodeObject;
	fromPort?: PortObject;
	toPort?: PortObject;
	fromPortIndex?: number;
	isPointNear: (pointer: fabric.Point, tolerance?: number) => boolean;
	setPort?: (fromNode: NodeObject, fromPort: PortObject, toNode: NodeObject, toPort: PortObject) => void;
	setPortEnabled?: (node: NodeObject, port: PortObject, enabled: boolean) => void;
	update?: (fromPort: Partial<PortObject>, toPort: Partial<PortObject>) => void;
}

const Link = fabric.util.createClass(fabric.Group, {
	type: 'link',
	superType: 'link',
	initialize(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		options: Partial<LinkObject>,
	) {
		const { left, top, ...other } = options || {};
		this.fromNode = fromNode;
		this.fromPort = fromPort;
		this.toNode = toNode;
		this.toPort = toPort;
		const { line, arrow } = this.draw(fromPort, toPort, options);
		this.line = line;
		this.arrow = arrow;
		Object.assign(other, {
			id: options.id || uuid(),
			originX: 'center',
			originY: 'center',
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
			objectCaching: false,
		});
		this.callSuper('initialize', [line, arrow], other);
	},
	setPort(fromNode: NodeObject, fromPort: PortObject, _toNode: NodeObject, toPort: PortObject) {
		if (fromNode.outPortType === 'BROADCAST') {
			fromPort = fromNode.fromPort[0];
		}
		fromPort.links.push(this);
		toPort.links.push(this);
		this.setPortEnabled(fromNode, fromPort, false);
	},
	setPortEnabled(node: NodeObject, port: PortObject, enabled: boolean) {
		if (node.descriptor.outPortType !== OUT_PORT_TYPE.BROADCAST) {
			port.set({ enabled, fill: enabled ? port.originFill : port.selectFill });
		} else {
			if (node.toPort.id === port.id) {
				return;
			}
			console.log(port.links);
			port.links.forEach((link, index) => link.set({ fromPort: port, fromPortIndex: index }));
			node.set({ configuration: { outputCount: port.links.length } });
		}
	},
	setColor(color: string) {
		this.line.set({ stroke: color });
		this.arrow.set({ fill: color });
	},
	/**
	 * fabric.Path용 setPath 헬퍼 (FabricJS v4.6.0)
	 * @param {string} pathStr - 새로운 SVG path 문자열
	 */
	parsePath(pathStr: string) {
		const tempPathObj = new fabric.Path(pathStr);
		return tempPathObj.path;
	},
	getPortPosition(node: NodeObject, direction: string) {
		const { left, top, width, height } = node || {};
		switch (direction) {
			case 'R':
				return { x: left + width, y: top + height / 2 };
			case 'L':
				return { x: left, y: top + height / 2 };
			case 'T':
				return { x: width ? left + width / 2 : left, y: top };
			case 'B':
				return { x: left, y: top };
			default:
				return { x: 0, y: 0 };
		}
	},
	draw(fromPort: PortObject, toPort: PortObject, options: any = {}) {
		const { strokeWidth = 2, stroke } = options;
		const { path, midX, midY, angle } = this.calculatePath(fromPort, toPort);
		const line = new fabric.Path(path, {
			strokeWidth: strokeWidth || 2,
			fill: '',
			originX: 'center',
			originY: 'center',
			stroke,
			selectable: false,
			evented: false,
			strokeLineJoin: 'round',
			objectCaching: false,
		});
		const arrow = new fabric.Triangle({
			left: midX,
			top: midY,
			originX: 'center',
			originY: 'center',
			angle: angle,
			width: 9,
			height: 9,
			fill: stroke,
			selectable: false,
			evented: false,
		});
		return { line, arrow };
	},
	update(fromPort: Partial<PortObject>, toPort: Partial<PortObject>) {
		const { path, midX, midY, angle } = this.calculatePath(fromPort, toPort);
		this.removeWithUpdate(this.line);
		this.line = new fabric.Path(path, {
			strokeWidth: 2,
			fill: '',
			originX: 'center',
			originY: 'center',
			stroke: this.stroke,
			selectable: false,
			evented: false,
			strokeLineJoin: 'round',
			objectCaching: false,
		});
		this.addWithUpdate(this.line);
		this.arrow.set({ left: midX - this.left, top: midY - this.top, angle: angle });
		this.arrow.setCoords();
		this.canvas.requestRenderAll();
	},
	calculatePath(fromPort: Partial<PortObject>, toPort: Partial<PortObject>) {
		const p1 = this.getPortPosition(fromPort, 'B');
		const p2 = this.getPortPosition(toPort, 'T');
		// console.log(p1, p2);
		const width = this.fromNode?.width || 200;
		const height = this.fromNode?.height || 40;
		const offset = 40;
		let x1 = p1.x;
		let y1 = p1.y;
		let x2 = x1;
		let y2 = y1 + height / 2;
		let x3 = x2 - fromPort.left + this.fromNode.left - offset;
		let y3 = p2.y - height / 2;
		let x4 = p2.x;
		let y4 = p2.y;
		const useCurve = p2.y > p1.y;
		const diff = x3 - (x2 - width);
		let path;
		if (useCurve) {
			path = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + offset}, ${p2.x} ${p1.y === p2.y ? p2.y : p2.y - offset}, ${p2.x} ${
				p2.y
			}`;
		} else {
			const baseRadius = 10;
			const dx = p1.x - p2.x;
			const isUpward = width - diff <= dx && dx >= 0;
			const distance = Math.abs(width - diff - dx);
			let ratio = Math.min(1, distance / offset);
			let radius = baseRadius * ratio;
			if (this.onlyLeft) {
				path = [
					`M ${x1} ${y1}`,
					`L ${x2} ${y2 - baseRadius}`,
					`Q ${x2} ${y2} ${x2 - baseRadius} ${y2}`,
					`L ${x3 + baseRadius} ${y2}`,
					`Q ${x3} ${y2} ${x3} ${y2 - baseRadius}`,
					`L ${x3} ${y3 + radius}`,
					`Q ${x3} ${y3} ${isUpward ? x3 - radius : x3 + radius} ${y3}`,
					`L ${isUpward ? x4 + radius : x4 - radius} ${y3}`,
					`Q ${x4} ${y3} ${x4} ${y3 + radius}`,
					`L ${x4} ${y4}`,
				].join(' ');
			} else {
				const nodeCenterGap =
					this.fromNode?.left + this.fromNode?.width / 2 - (this.toNode?.left + this.toNode?.width / 2);
				const gap = isNaN(nodeCenterGap) ? x1 - x4 : nodeCenterGap;
				const isNegativeShift = gap <= 0;
				if (!isNegativeShift) {
					x3 = this.fromNode.left + this.fromNode.width + offset;
				}
				path = [
					`M ${x1} ${y1}`,
					`L ${x2} ${y2 - baseRadius}`,
					`Q ${x2} ${y2} ${isNegativeShift ? x2 - baseRadius : x2 + baseRadius} ${y2}`,
					`L ${isNegativeShift ? x3 + baseRadius : x3 - baseRadius} ${y2}`,
					`Q ${x3} ${y2} ${x3} ${y2 - baseRadius}`,
					`L ${x3} ${y3 + baseRadius}`,
					`Q ${x3} ${y3} ${isNegativeShift ? x3 + baseRadius : x3 - baseRadius} ${y3}`,
					`L ${isNegativeShift ? x4 - baseRadius : x4 + baseRadius} ${y3}`,
					`Q ${x4} ${y3} ${x4} ${y3 + baseRadius}`,
					`L ${x4} ${y4}`,
				].join(' ');
			}
		}
		let midX = x3;
		let midY = (y3 + y2) / 2;
		let angle = 0;
		const properties = new svgPathProperties(path);
		const totalLength = properties.getTotalLength();
		if (useCurve) {
			const delta = 1;
			const ahead = properties.getPointAtLength(totalLength / 2 + delta);
			const behind = properties.getPointAtLength(totalLength / 2 - delta);
			const dx = ahead.x - behind.x;
			const dy = ahead.y - behind.y;
			midX = (p1.x + p2.x) / 2;
			midY = (p1.y + p2.y) / 2;
			angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		}
		this.pathProperties = properties;
		this.samplePoints = [];
		const length = properties.getTotalLength();
		const steps = Math.floor(length / 5);
		for (let i = 0; i <= steps; i++) {
			const pt = properties.getPointAtLength((i / steps) * length);
			this.samplePoints.push(pt);
		}
		return { path, midX, midY, angle };
	},
	isPointNear(pointer: fabric.Point, tolerance = 5) {
		if (!this.samplePoints) return false;
		for (const pt of this.samplePoints) {
			const dx = pointer.x - pt.x;
			const dy = pointer.y - pt.y;
			if (Math.sqrt(dx * dx + dy * dy) <= tolerance) {
				return true;
			}
		}
		return false;
	},
	toObject() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			id: this.get('id'),
			name: this.get('name'),
			superType: this.get('superType'),
			configuration: this.get('configuration'),
			fromNode: this.get('fromNode'),
			fromNodeId: this.get('fromNodeId'),
			fromPort: this.get('fromPort'),
			toNode: this.get('toNode'),
			toNodeId: this.get('toNodeId'),
			toPort: this.get('toPort'),
		});
	},
});

Link.fromObject = (options: LinkObject, callback: (obj: LinkObject) => any) => {
	const { fromNode, fromPort, toNode, toPort } = options;
	return callback(new Link(fromNode, fromPort, toNode, toPort, options));
};

// @ts-ignore
window.fabric.Link = Link;

export default Link;
