import Color from 'color';
import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { fitTextToRect } from '../utils';
import FromPort from './FromPort';
import { LinkObject } from './Link';
import Port, { PortObject } from './Port';
import Spinner from './Spinner';
import ToPort from './ToPort';

export const OUT_PORT_TYPE = {
	SINGLE: 'SINGLE',
	STATIC: 'STATIC',
	DYNAMIC: 'DYNAMIC',
	BROADCAST: 'BROADCAST',
	NONE: 'NONE',
};

export interface NodeObject extends FabricObject<fabric.Group> {
	errorFlag?: fabric.IText;
	label?: fabric.Text;
	color?: string;
	errors?: any;
	toPort?: PortObject;
	fromPort?: PortObject[];
	descriptor?: Record<string, any>;
	nodeClazz?: string;
	configuration?: Record<string, any>;
	ports?: PortObject[];
	defaultPortOption?: () => Partial<PortObject>;
	toPortOption?: () => Partial<PortObject>;
	fromPortOption?: () => Partial<PortObject>;
	createPorts?: (left: number, top: number) => PortObject[];
	createToPort?: (left: number, top: number) => PortObject;
	createFromPort?: (left: number, top: number) => PortObject[];
	setErrors?: (errors: any) => void;
	setName?: (name: string) => void;
	select?: () => void;
	unselect?: () => void;
	duplicate?: () => NodeObject;
}

const Node = fabric.util.createClass(fabric.Group, {
	type: 'node',
	superType: 'node',
	initialize(options: any) {
		options = options || {};
		let name = options.name || 'Default Node';
		let fontSize = options.fontSize || 16;
		const fontFamily = options.fontFamily || 'Noto Sans';
		if (options.name) {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const { text, fontSize: size } = fitTextToRect(
				ctx!,
				options.name,
				fontSize,
				fontFamily,
				options.descriptor.actionButton ? 142 : 168,
				48,
			);
			name = text;
			fontSize = size;
		}
		this.label = new fabric.Text(name || 'Default Node', {
			fontSize,
			fontFamily,
			fontWeight: 400,
			fill: '#fff',
		});
		this.rect = new fabric.Rect({
			rx: 12,
			ry: 12,
			width: 240,
			height: 60,
			strokeWidth: 1,
			fill: options.fill,
			stroke: options.stroke,
		});
		this.nodeIcon = this.createNodeIcon(options);
		this.errorFlag = this.createErrorFlag();
		const node = [this.rect, this.nodeIcon, this.label, this.errorFlag];
		if (options.descriptor.actionButton) {
			this.button = this.createActionButton();
			node.push(this.button);
		}
		const option = Object.assign({}, options, {
			id: options.id || uuid(),
			width: 240,
			height: 60,
			originX: 'left',
			originY: 'top',
			hasRotatingPoint: false,
			hasControls: false,
			fontSize,
			fontFamily,
			color: options.color,
			subTargetCheck: !!options.descriptor.actionButton,
			originStroke: options.stroke,
		});
		this.callSuper('initialize', node, option);
		this.label.set({
			left: this.nodeIcon.left + this.nodeIcon.width + 10,
			top: this.nodeIcon.top + this.nodeIcon.height / 2 - this.label.height / 2,
		});
		this.errorFlag.set({ visible: options.errors });
		if (options.descriptor.actionButton) {
			this.button.set({
				left: this.rect.left + this.rect.width - this.button.width + 1,
				top: this.rect.top + this.rect.height - this.button.height + 1,
			});
			this.button.setCoords();
		}
	},
	defaultPortOption() {
		return {
			nodeId: this.id,
			hasBorders: false,
			hasControls: false,
			hasRotatingPoint: false,
			selectable: false,
			originX: 'center',
			originY: 'center',
			lockScalingX: true,
			lockScalingY: true,
			superType: 'port',
			connectedFill: this.color || '#fff',
			disabledFill: 'red',
			enabledFill: 'green',
			originFill: '#5f646b',
			fill: '#5f646b',
			hoverCursor: 'pointer',
			strokeWidth: 2,
			stroke: this.stroke,
			links: [] as LinkObject[],
			enabled: true,
		};
	},
	toPortOption() {
		return {
			...this.defaultPortOption(),
			height: 6,
			width: 24,
		};
	},
	fromPortOption() {
		return {
			...this.defaultPortOption(),
			radius: 12,
		};
	},
	createNodeIcon(options: any) {
		const { h, s, v } = Color(options.color).hsv().object();
		const iconBox = new fabric.Rect({
			width: 48,
			height: 48,
			rx: 10,
			ry: 10,
			left: 8,
			top: 7,
			strokeWidth: 0,
		});
		iconBox.set(
			'fill',
			new fabric.Gradient({
				type: 'linear',
				coords: { x1: 0, y1: 0, x2: 0, y2: 40 },
				colorStops: [
					{ offset: 0, color: options.color },
					{ offset: 1, color: Color.hsv(h, s, v - 60).hex() },
				],
			}),
		);
		const icon = new fabric.IText(options.icon || '\uE174', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 24,
			fill: '#fff',
		});
		icon.set({ left: iconBox.width / 2 - icon.width / 2 + 8, top: icon.height / 2 + 5 });
		return new fabric.Group([iconBox, icon]);
	},
	createErrorFlag() {
		const icon = new fabric.IText('\uf071', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 12,
			fill: '#fff',
			left: 2,
			top: 2,
		});
		const box = this.createIconBoxPath({ width: 20, height: 20, fill: 'red', strokeWidth: 0 }, 12);
		return new fabric.Group([box, icon], { left: 0, top: 0 });
	},
	createActionButton() {
		const width = 24;
		const height = 60;
		const radius = 12;
		const r = Math.min(radius, height / 2, width / 2); // 한계 보정
		const path = [
			`M 0 0`, // 좌상단
			`L ${width - r} 0`, // 우상단 - 라운드 시작 전
			`A ${r} ${r} 0 0 1 ${width} ${r}`, // 오른쪽 위 라운드
			`L ${width} ${height - r}`, // 우하단 - 라운드 시작 전
			`A ${r} ${r} 0 0 1 ${width - r} ${height}`, // 오른쪽 아래 라운드
			`L 0 ${height}`, // 좌하단
			`Z`, // 닫기
		].join(' ');
		const box = new fabric.Path(path, { fill: '#5f646b' });
		const icon = new fabric.IText('\uf04b', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 14,
			fill: '#fff',
		});
		icon.set({ left: box.width / 2 - icon.width / 2, top: box.height / 2 - icon.height / 2 });
		return new fabric.Group([box, icon], { hoverCursor: 'pointer' });
	},
	createIconBoxPath(options: fabric.IPathOptions, radius: number) {
		const { width, height, ...other } = options;
		const path = [
			`M ${radius} 0`,
			`Q 0 0 0 ${radius}`,
			`L 0 ${height}`,
			`L ${width - radius} ${height}`,
			`Q ${width} ${height} ${width} ${height - radius}`,
			`L ${width} 0`,
			`Z`,
		].join(' ');
		return new fabric.Path(path, other);
	},
	createPorts(left: number, top: number) {
		const spinner = new Spinner({
			left,
			top,
			radius: 12,
			fill: '#FFD700',
			transaciton: false,
		});
		this.ports = [spinner];
		spinner.setPosition(left, top);
		return this.ports;
	},
	createToPort(left: number, top: number) {
		if (this.descriptor.inEnabled) {
			this.toPort = new ToPort({
				id: 'defaultInPort',
				type: 'toPort',
				...this.toPortOption(),
				left,
				top,
			});
			this.toPort.setPosition(left, top);
		}
		return this.toPort;
	},
	createFromPort(left: number, top: number) {
		if (this.descriptor.outPortType === OUT_PORT_TYPE.STATIC) {
			const offset = 60;
			this.fromPort = this.descriptor.outPorts.map((outPort: string, i: number) => {
				const fill = i === 0 ? '#ff3030' : '#15cc08';
				const targetLeft = i === 0 ? left - offset : left + offset;
				const port = new FromPort({
					id: outPort,
					type: 'fromPort',
					left: targetLeft,
					top,
					leftDiff: i === 0 ? -offset : offset,
					...this.fromPortOption(),
					fill,
					originFill: fill,
					label: outPort,
					color: fill,
					fontSize: 14,
					fontFamily: 'Noto Sans',
				});
				port.setPosition(targetLeft, top);
				return port;
			});
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC) {
			this.fromPort = [];
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.NONE) {
			this.fromPort = [];
		} else {
			const port = new FromPort({
				id: 'defaultFromPort',
				type: 'fromPort',
				...this.fromPortOption(),
				left,
				top,
			});
			port.setPosition(left, top);
			this.fromPort = [port];
		}
		return this.fromPort;
	},
	setErrors(errors: any) {
		this.set({ errors });
		if (errors) {
			this.errorFlag.set({ visible: true });
			this.rect.set({ stroke: 'red' });
		} else {
			this.errorFlag.set({ visible: false });
			this.rect.set({ stroke: this.originStroke });
		}
	},
	setName(name: string) {
		const context = this.canvas.getContext('2d');
		const { text, fontSize, height } = fitTextToRect(
			context,
			name,
			this.fontSize,
			this.fontFamily,
			this.descriptor.actionButton ? 142 : 168,
			48,
		);
		this.label.set({
			fontSize,
			text,
			// -19 magic constant
			top: this.height > 60 ? -height / 2 - 19 : -height / 2,
		});
	},
	select() {
		this.rect.set({ strokeDashArray: [3, 3], strokeWidth: 2 });
		this.canvas.requestRenderAll();
	},
	unselect() {
		this.rect.set({ strokeDashArray: null, strokeWidth: 1 });
		this.canvas.requestRenderAll();
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		return new Node(options);
	},
	toObject() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			id: this.get('id'),
			name: this.get('name'),
			icon: this.get('icon'),
			color: this.get('color'),
			fontSize: this.get('fontSize'),
			fontFamily: this.get('fontFamily'),
			description: this.get('description'),
			superType: this.get('superType'),
			configuration: this.get('configuration'),
			nodeClazz: this.get('nodeClazz'),
			descriptor: this.get('descriptor'),
			borderColor: this.get('borderColor'),
			borderScaleFactor: this.get('borderScaleFactor'),
			dblclick: this.get('dblclick'),
			deletable: this.get('deletable'),
			cloneable: this.get('cloneable'),
			fromPort: this.get('fromPort'),
			toPort: this.get('toPort'),
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

Node.fromObject = (options: NodeObject, callback: (obj: NodeObject) => any) => {
	return callback(new Node(options));
};

// @ts-ignore
window.fabric.FromPort = Port;

// @ts-ignore
window.fabric.ToPort = Port;

// @ts-ignore
window.fabric.Node = Node;

export default Node;
