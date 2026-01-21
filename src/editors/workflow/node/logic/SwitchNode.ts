import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { fitTextToRect } from '../../../../canvas';
import { FromPort, PortObject } from '../../../../canvas/objects';
import LogicNode from './LogicNode';

const SwitchNode = fabric.util.createClass(LogicNode, {
	portWidth: 80,
	portHeight: 40,
	defaultRouteLength: 3,
	initialize(options: any) {
		options = options || {};
		const routeLength = options.configuration.routes.length;

		if (options.__baseLeft == null) {
			options.__baseLeft = options.left ?? 0;
		}

		if (routeLength > 3) {
			const shift = ((routeLength - this.defaultRouteLength) * this.portWidth) / 2;
			options.left = options.__baseLeft + shift;
		}

		this.callSuper('initialize', options);
	},
	createFromPort(x: number, y: number) {
		const isEven = this.configuration.routes.length % 2 === 0;
		const calcOdd = (port: PortObject, i: number) => {
			const centerIndex = Math.ceil(this.configuration.routes.length / 2);
			const index = i + 1;
			let left;
			let leftDiff;
			const width = port.width ?? 0;
			if (centerIndex === index) {
				left = x;
			} else if (centerIndex > index) {
				left = x - width * (centerIndex - index);
				leftDiff = -width * (centerIndex - index);
			} else {
				left = x + width * (index - centerIndex);
				leftDiff = width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		const calcEven = (port: PortObject, i: number) => {
			const centerIndex = this.configuration.routes.length / 2;
			const index = i + 1;
			let left;
			let leftDiff;
			const width = port.width ?? 0;
			if (centerIndex >= index) {
				left = x - width / 2 - width * (centerIndex - index);
				leftDiff = -(width / 2) - width * (centerIndex - index);
			} else {
				left = x - width / 2 + width * (index - centerIndex);
				leftDiff = -(width / 2) + width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d')!;
		this.ports = this.configuration.routes.map((outPort: string, i: number) => {
			const rect = new fabric.Rect({
				width: this.portWidth,
				height: this.portHeight,
				fill: '#272e38',
				// @ts-ignore
				originFill: '#272e38',
				stroke: '#5f646b',
				rx: 12,
				ry: 12,
			});
			const { text, fontSize, height } = fitTextToRect(context, outPort, this.fontSize, this.fontFamily, 72, 32);
			const label = new fabric.Text(text, {
				fontSize,
				fontFamily: 'Noto Sans',
				fontWeight: 400,
				fill: '#fff',
			});
			let coords;
			if (isEven) {
				coords = calcEven(rect, i);
			} else {
				coords = calcOdd(rect, i);
			}
			const portLabel = new fabric.Group([rect, label], {
				// @ts-ignore
				id: outPort,
				width: this.portWidth,
				height: this.portHeight,
				rx: 7,
				ry: 7,
				left: coords.left,
				top: y + 20,
				leftDiff: coords.leftDiff,
				topDiff: 20,
				fill: '#2c2d3a',
				originX: 'center',
				originY: 'center',
			});
			label.set({ fontSize, top: -height / 2, left: (rect.center() as any).x });
			return portLabel;
		});
		this.ports.forEach((port: PortObject) => {
			this.addWithUpdate(port);
			port.setCoords();
		});
		this.fromPort = this.ports.map((port: PortObject, i: number) => {
			let coords;
			if (isEven) {
				coords = calcEven(port, i);
			} else {
				coords = calcOdd(port, i);
			}
			const height = port.height ?? 0;
			const top = y + height;
			port.fromPort = new FromPort({
				id: port.id,
				type: 'fromPort',
				left: coords.left,
				top,
				leftDiff: coords.leftDiff,
				...this.fromPortOption(),
				radius: 12,
			});
			port.fromPort.setPosition(coords.left, top);
			return port.fromPort;
		});
		return this.fromPort;
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		options.__baseLeft = options.left ?? 0;
		const clonedObj = new SwitchNode(options);
		return clonedObj;
	},
});

SwitchNode.fromObject = function (options: any, callback: any) {
	return callback(new SwitchNode(options));
};

// @ts-ignore
window.fabric.SwitchNode = SwitchNode;

export default SwitchNode;
