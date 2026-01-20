import { fabric } from 'fabric';
import { fitTextToRect } from '../../../../canvas';
import { FromPort } from '../../../../canvas/objects';
import LogicNode from './LogicNode';

const SwitchNode = fabric.util.createClass(LogicNode, {
	portWidth: 40,
	defaultRouteLength: 3,
	initialize(options) {
		options = options || {};
		const routeLength = options.configuration.routes.length;
		if (routeLength > 3) {
			// ex) 40 + ((4 - 3) * 80) = 120 / 2 = 60
			// options.left =
			// 	(options.left ?? 0) +
			// 	(this.portWidth + (routeLength - this.defaultRouteLength) * (this.portWidth * 2)) / 2;
		}
		this.callSuper('initialize', options);
	},
	createFromPort(x, y) {
		const isEven = this.configuration.routes.length % 2 === 0;
		const calcOdd = (port, i) => {
			const centerIndex = Math.ceil(this.configuration.routes.length / 2);
			const index = i + 1;
			let left;
			let leftDiff;
			if (centerIndex === index) {
				left = x;
			} else if (centerIndex > index) {
				left = x - port.width * (centerIndex - index);
				leftDiff = -port.width * (centerIndex - index);
			} else {
				left = x + port.width * (index - centerIndex);
				leftDiff = port.width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		const calcEven = (port, i) => {
			const centerIndex = this.configuration.routes.length / 2;
			const index = i + 1;
			let left;
			let leftDiff;
			if (centerIndex >= index) {
				left = x - port.width / 2 - port.width * (centerIndex - index);
				leftDiff = -(port.width / 2) - port.width * (centerIndex - index);
			} else {
				left = x - port.width / 2 + port.width * (index - centerIndex);
				leftDiff = -(port.width / 2) + port.width * (index - centerIndex);
			}
			return {
				left,
				leftDiff,
			};
		};
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		this.ports = this.configuration.routes.map((outPort, i) => {
			const rect = new fabric.Rect({
				width: 80,
				height: 40,
				fill: '#272e38',
				originFill: '#272e38',
				hoverFill: 'green',
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
				id: outPort,
				width: 80,
				height: 40,
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
			label.set({ fontSize, top: -height / 2, left: rect.center().x });
			return portLabel;
		});
		this.ports.forEach(port => {
			this.addWithUpdate(port);
			port.setCoords();
		});
		this.fromPort = this.ports.map((port, i) => {
			let coords;
			if (isEven) {
				coords = calcEven(port, i);
			} else {
				coords = calcOdd(port, i);
			}
			port.fromPort = new FromPort({
				id: port.id,
				type: 'fromPort',
				left: coords.left,
				top: y + port.height,
				leftDiff: coords.leftDiff,
				width: 10,
				height: 10,
				...this.fromPortOption(),
			});
			return port.fromPort;
		});
		return this.fromPort;
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		const clonedObj = new SwitchNode(options);
		return clonedObj;
	},
});

SwitchNode.fromObject = function (options, callback) {
	return callback(new SwitchNode(options));
};

window.fabric.SwitchNode = SwitchNode;

export default SwitchNode;
