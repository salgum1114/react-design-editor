import * as fabric from 'fabric';
import { svgPathProperties } from 'svg-path-properties';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';
import { NodeObject, OUT_PORT_TYPE } from './Node';
import { PortObject } from './Port';

export interface LinkedNodePropeties {
	left: number;
	top: number;
	width?: number;
	height?: number;
}

export type LinkObject = FabricObject<fabric.Group> & {
	fromNode?: NodeObject;
	toNode?: NodeObject;
	fromPort?: PortObject;
	toPort?: PortObject;
	fromPortIndex?: number;
	isPointNear: (pointer: fabric.Point, tolerance?: number) => boolean;
	setPort?: (fromNode: NodeObject, fromPort: PortObject, toNode: NodeObject, toPort: PortObject) => void;
	setPortEnabled?: (node: NodeObject, port: PortObject, enabled: boolean) => void;
	update?: (fromPort: Partial<PortObject>, toPort: Partial<PortObject>) => void;
};
class Link extends fabric.Group {
	static type = 'link';
	superType = 'link';
	declare fromNode: Partial<NodeObject>;
	declare fromPort: Partial<PortObject>;
	declare toNode: Partial<NodeObject>;
	declare toPort: Partial<PortObject>;
	declare line: fabric.Path;
	declare arrow: fabric.Triangle;
	declare pathProperties: any;
	declare samplePoints: Array<{ x: number; y: number }>;
	declare onlyLeft?: boolean;

	private static getPortPosition(port: Partial<PortObject>, direction: string) {
		const { left = 0, top = 0, width = 0, height = 0, strokeWidth = 0 } = port || {};
		switch (direction) {
			case 'R':
				return { x: left + width / 2, y: top };
			case 'L':
				return { x: left - width / 2, y: top };
			case 'T':
				return { x: left, y: top - height / 2 - strokeWidth / 2 };
			case 'B':
				return { x: left, y: top + height / 2 + strokeWidth / 2 };
			default:
				return { x: left, y: top };
		}
	}

	private static calculateGeometry(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		onlyLeft?: boolean,
	) {
		const p1 = Link.getPortPosition(fromPort, 'B');
		const p2 = Link.getPortPosition(toPort, 'T');
		const width = fromNode?.width || 240;
		const height = fromNode?.height || 60;
		const curvedOffset = Math.floor(p1.x) === Math.floor(p2.x) ? 0 : 40;
		const offset = 40;
		const fromGroup = fromNode.group;
		const toGroup = toNode.group;
		const fromNodeLeft = fromNode.left + (fromGroup ? fromGroup.left + fromGroup.width / 2 : 0);
		const toNodeLeft = toNode.left + (toGroup ? toGroup.left + toGroup.width / 2 : 0);
		const x1 = p1.x;
		const y1 = p1.y;
		const x2 = x1;
		const y2 = y1 + height / 2;
		let x3 = x2 - (fromPort.left || 0) + fromNodeLeft - offset;
		const y3 = p2.y - height / 2;
		const x4 = p2.x;
		const y4 = p2.y;
		const useCurve = p2.y > p1.y;
		const diff = x3 - (x2 - width);
		let path: string;
		if (useCurve) {
			path = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + curvedOffset}, ${p2.x} ${p1.y === p2.y ? p2.y : p2.y - curvedOffset}, ${p2.x} ${p2.y}`;
		} else {
			const baseRadius = 10;
			const dx = p1.x - p2.x;
			const isUpward = width - diff <= dx && dx >= 0;
			const distance = Math.abs(width - diff - dx);
			const ratio = Math.min(1, distance / offset);
			const radius = baseRadius * ratio;
			if (onlyLeft) {
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
					fromNodeLeft + (fromNode?.width || 0) / 2 - (toNodeLeft + (toNode?.width || 0) / 2);
				const gap = isNaN(nodeCenterGap) ? x1 - x4 : nodeCenterGap;
				const isNegativeShift = gap <= 0;
				if (!isNegativeShift) {
					x3 = fromNodeLeft + (fromNode.width || 0) + offset;
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
		const samplePoints = [];
		const length = properties.getTotalLength();
		const steps = Math.max(1, Math.floor(length / 5));
		for (let i = 0; i <= steps; i++) {
			samplePoints.push(properties.getPointAtLength((i / steps) * length));
		}
		return { path, midX, midY, angle, properties, samplePoints };
	}

	private static createObjects(geometry: ReturnType<typeof Link.calculateGeometry>, options: any = {}) {
		const { strokeWidth = 2, stroke } = options;
		return {
			line: new fabric.Path(geometry.path, {
				strokeWidth: strokeWidth || 2,
				fill: '',
				originX: 'center',
				originY: 'center',
				stroke,
				selectable: false,
				evented: false,
				strokeLineJoin: 'round',
				objectCaching: false,
			}),
			arrow: new fabric.Triangle({
				left: geometry.midX,
				top: geometry.midY,
				originX: 'center',
				originY: 'center',
				angle: geometry.angle,
				width: 9,
				height: 9,
				fill: stroke,
				selectable: false,
				evented: false,
			}),
		};
	}

	constructor(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		options: Partial<LinkObject> = {},
	) {
		const { left, top, ...other } = options || {};
		const geometry = Link.calculateGeometry(fromNode, fromPort, toNode, toPort, options.onlyLeft);
		const { line, arrow } = Link.createObjects(geometry, options);
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
		super([line, arrow], other);
		this.fromNode = fromNode;
		this.fromPort = fromPort;
		this.toNode = toNode;
		this.toPort = toPort;
		this.line = line;
		this.arrow = arrow;
		this.pathProperties = geometry.properties;
		this.samplePoints = geometry.samplePoints;
	}

	setPort(fromNode: NodeObject, fromPort: PortObject, _toNode: NodeObject, toPort: PortObject) {
		const resolvedPort = fromNode.outPortType === 'BROADCAST' ? fromNode.fromPort[0] : fromPort;
		resolvedPort.links.push(this as unknown as LinkObject);
		toPort.links.push(this as unknown as LinkObject);
		this.setPortEnabled(fromNode, resolvedPort, false);
	}

	setPortEnabled(node: NodeObject, port: PortObject, enabled: boolean) {
		if (node.descriptor.outPortType !== OUT_PORT_TYPE.BROADCAST) {
			port.set({ enabled, fill: port.originFill });
		} else {
			if (node.toPort.id === port.id) {
				return;
			}
			port.links.forEach((link: LinkObject, index: number) => link.set({ fromPort: port, fromPortIndex: index }));
			node.set({ configuration: { outputCount: port.links.length } });
		}
	}

	setColor(color: string) {
		this.line.set({ stroke: color });
		this.arrow.set({ fill: color });
		this.set({ stroke: color });
	}

	parsePath(pathStr: string) {
		return new fabric.Path(pathStr).path;
	}

	getPortPosition(port: Partial<PortObject>, direction: string) {
		return Link.getPortPosition(port, direction);
	}

	draw(fromPort: PortObject, toPort: PortObject, options: any = {}) {
		const geometry = Link.calculateGeometry(this.fromNode, fromPort, this.toNode, toPort, this.onlyLeft);
		return Link.createObjects(geometry, options);
	}

	update(fromPort: Partial<PortObject>, toPort: Partial<PortObject>) {
		const geometry = Link.calculateGeometry(this.fromNode, fromPort, this.toNode, toPort, this.onlyLeft);
		this.pathProperties = geometry.properties;
		this.samplePoints = geometry.samplePoints;
		this.remove(this.line);
		this.line = new fabric.Path(geometry.path, {
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
		this.insertAt(0, this.line);
		this.arrow.set({ left: geometry.midX - this.left, top: geometry.midY - this.top, angle: geometry.angle });
		this.arrow.setCoords();
		this.canvas?.requestRenderAll();
	}

	calculatePath(fromPort: Partial<PortObject>, toPort: Partial<PortObject>) {
		const geometry = Link.calculateGeometry(this.fromNode, fromPort, this.toNode, toPort, this.onlyLeft);
		this.pathProperties = geometry.properties;
		this.samplePoints = geometry.samplePoints;
		return geometry;
	}

	isPointNear(pointer: fabric.Point, tolerance = 5) {
		if (!this.samplePoints) {
			return false;
		}
		for (const point of this.samplePoints) {
			const dx = pointer.x - point.x;
			const dy = pointer.y - point.y;
			if (Math.sqrt(dx * dx + dy * dy) <= tolerance) {
				return true;
			}
		}
		return false;
	}

	toObject(propertiesToInclude: any[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
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
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(
			new Link(options.fromNode, options.fromPort, options.toNode, options.toPort, options),
			callback,
		);
	}
}

registerFabricClass('Link', Link);

export default Link;
