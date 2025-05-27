import { fabric } from 'fabric';
import { svgPathProperties } from 'svg-path-properties';
import { uuid } from 'uuidv4';
import { FabricObject } from '../utils';
import { NodeObject, OUT_PORT_TYPE } from './Node';
import { PortObject } from './Port';

export interface LinkedNodePropeties {
	left: number;
	top: number;
	width?: number;
	height?: number;
}

export interface NewLinkObject extends FabricObject<fabric.Path> {
	fromNode?: NodeObject;
	toNode?: NodeObject;
	fromPort?: PortObject;
	toPort?: PortObject;
	fromPortIndex?: number;
	setPort?: (fromNode: NodeObject, fromPort: PortObject, toNode: NodeObject, toPort: PortObject) => void;
	setPortEnabled?: (node: NodeObject, port: PortObject, enabled: boolean) => void;
}

const NewLink = fabric.util.createClass(fabric.Group, {
	type: 'newLink',
	superType: 'link',
	initialize(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		options: Partial<NewLinkObject>,
	) {
		options = options || {};
		const { line, arrow } = this.draw(fromNode, toNode);
		this.line = line;
		this.arrow = arrow;
		Object.assign(options, {
			strokeWidth: 4,
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
		this.callSuper('initialize', [line, arrow], options);
	},
	setPort(fromNode: NodeObject, fromPort: PortObject, _toNode: NodeObject, toPort: PortObject) {
		if (fromNode.type === 'BroadcastNode') {
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
			port.links.forEach((link, index) => {
				link.set({ fromPort: port, fromPortIndex: index });
			});
			node.set({ configuration: { outputCount: port.links.length } });
		}
	},
	/**
	 * fabric.Path용 setPath 헬퍼 (FabricJS v4.6.0)
	 * @param {fabric.Path} pathObj - 업데이트할 fabric.Path 객체
	 * @param {string} pathStr - 새로운 SVG path 문자열
	 * @param {fabric.Canvas} canvas - 소속된 fabric.Canvas 객체
	 */
	parsePath(pathStr: string) {
		// 임시 Path 객체 생성해서 파싱된 path 배열 추출
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
				return { x: width ? left + width / 2 : left, y: height ? top + height : top };
			default:
				return { x: 0, y: 0 };
		}
	},
	draw(from: LinkedNodePropeties, to: LinkedNodePropeties) {
		const { path, midX, midY, angle } = this.calculateEdgePath(from, to);

		const line = new fabric.Path(path, {
			stroke: 'blue',
			fill: '',
			selectable: false,
			evented: false,
			strokeWidth: 3,
			strokeLineJoin: 'round',
			objectCaching: false,
		});

		const arrow = new fabric.Triangle({
			left: midX,
			top: midY,
			originX: 'center',
			originY: 'center',
			angle: angle,
			width: 15,
			height: 15,
			fill: 'blue',
			selectable: false,
			evented: false,
			objectCaching: false,
		});

		// line.sendToBack();
		// arrow.sendToBack();

		return { line, arrow };
	},
	update(from: LinkedNodePropeties, to: LinkedNodePropeties) {
		const { path, midX, midY, angle } = this.calculateEdgePath(from, to);
		this.line.set({ path: this.parsePath(path) });
		this.line.setCoords();
		this.arrow.set({
			left: midX,
			top: midY,
			angle: angle,
		});
		this.arrow.setCoords();
	},
	calculateEdgePath(from: LinkedNodePropeties, to: LinkedNodePropeties) {
		const p1 = this.getPortPosition(from, 'B');
		const p2 = this.getPortPosition(to, 'T');

		const width = 120;
		const height = 60;
		const offset = 80;
		let x1 = p1.x;
		let y1 = p1.y;
		let x2 = x1;
		let y2 = y1 + height / 2;
		let x3 = x2 - width;
		let y3 = p2.y - height / 2;
		let x4 = p2.x;
		let y4 = p2.y;
		const useCurve = p2.y > p1.y;
		let path;
		if (useCurve) {
			path = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + 40}, ${p2.x} ${p2.y - 40}, ${p2.x} ${p2.y}`;
		} else {
			const baseRadius = 10;
			const dx = p1.x - p2.x;
			const isUpward = width <= dx && dx >= 0;
			const distance = Math.abs(width - dx);
			let ratio = Math.min(1, distance / offset);
			let radius = baseRadius * ratio;

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
		}

		let midX = x3;
		let midY = (y3 + y2) / 2;
		let angle = 0;
		if (useCurve) {
			// svg-path-properties 객체 생성
			const properties = new svgPathProperties(path);

			// 전체 길이
			const totalLength = properties.getTotalLength();
			// 중간 점 좌표
			const midPoint = properties.getPointAtLength(totalLength / 2);
			// 접선 각도 계산 (중간 위치에서 앞뒤 좌표 차이로)
			const delta = 1; // 미세 구간
			const ahead = properties.getPointAtLength(totalLength / 2 + delta);
			const behind = properties.getPointAtLength(totalLength / 2 - delta);

			const dx = ahead.x - behind.x;
			const dy = ahead.y - behind.y;
			midX = midPoint.x;
			midY = midPoint.y;
			angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		}
		return { path, midX, midY, angle };
	},
	toObject() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			id: this.get('id'),
			name: this.get('name'),
			superType: this.get('superType'),
			configuration: this.get('configuration'),
			fromNode: this.get('fromNode'),
			fromPort: this.get('fromPort'),
			toNode: this.get('toNode'),
			toPort: this.get('toPort'),
		});
	},
});

NewLink.fromObject = (options: NewLinkObject, callback: (obj: NewLinkObject) => any) => {
	const { fromNode, fromPort, toNode, toPort } = options;
	return callback(new NewLink(fromNode, fromPort, toNode, toPort, options));
};

// @ts-ignore
window.fabric.NewLink = NewLink;

export default NewLink;
