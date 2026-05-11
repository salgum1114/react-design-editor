import Color from 'color';
import * as fabric from 'fabric';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { fitTextToRect, registerFabricClass, resolveFromObject, toObject } from '../utils';
import { CustomControlObject } from './CustomControl';
import FromPort from './FromPort';
import { LinkObject } from './Link';
import { PortObject } from './Port';
import Spinner from './Spinner';
import ToPort from './ToPort';

export const OUT_PORT_TYPE = {
	SINGLE: 'SINGLE',
	STATIC: 'STATIC',
	DYNAMIC: 'DYNAMIC',
	BROADCAST: 'BROADCAST',
	NONE: 'NONE',
};

export type NodeObject = FabricObject<fabric.Group> & {
	errorFlag?: fabric.IText;
	label?: fabric.Text;
	color?: string;
	errors?: any;
	toPort?: PortObject;
	fromPort?: PortObject[];
	descriptor?: Record<string, any>;
	ports?: PortObject[];
	nodeClazz?: string;
	configuration?: Record<string, any>;
	handlers?: PortObject[];
	customControls?: CustomControlObject[];
	defaultPortOption?: () => Partial<PortObject>;
	toPortOption?: () => Partial<PortObject>;
	fromPortOption?: () => Partial<PortObject>;
	createCustomControls?: (left: number, top: number) => CustomControlObject[];
	createToPort?: (left: number, top: number) => PortObject;
	createFromPort?: (left: number, top: number) => PortObject[];
	setErrors?: (errors: any) => void;
	setName?: (name: string) => void;
	select?: () => void;
	unselect?: () => void;
	duplicate?: () => NodeObject;
};

class Node extends fabric.Group {
	static type = 'node';
	superType = 'node';
	declare id: string;
	declare label: fabric.Text;
	declare rect: fabric.Rect;
	declare nodeIcon: fabric.Group;
	declare errorFlag: fabric.Group;
	declare button?: fabric.Group;
	declare color?: string;
	declare descriptor: Record<string, any>;
	declare customControls?: CustomControlObject[];
	declare toPort?: PortObject;
	declare fromPort?: PortObject[];
	declare originStroke?: string;
	declare fontSize?: number;
	declare fontFamily?: string;

	private static createIconBoxPath(options: any, radius: number) {
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
	}

	private static createNodeIcon(options: any) {
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
	}

	private static createErrorFlag() {
		const icon = new fabric.IText('\uf071', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 12,
			fill: '#fff',
			left: 2,
			top: 2,
		});
		const box = Node.createIconBoxPath({ width: 20, height: 20, fill: 'red', strokeWidth: 0 }, 12);
		return new fabric.Group([box, icon], { left: 0, top: 0 });
	}

	private static createActionButton() {
		const width = 24;
		const height = 60;
		const radius = 12;
		const r = Math.min(radius, height / 2, width / 2);
		const path = [
			'M 0 0',
			`L ${width - r} 0`,
			`A ${r} ${r} 0 0 1 ${width} ${r}`,
			`L ${width} ${height - r}`,
			`A ${r} ${r} 0 0 1 ${width - r} ${height}`,
			`L 0 ${height}`,
			'Z',
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
	}

	constructor(options: any = {}) {
		let name = options.name || 'Default Node';
		let fontSize = options.fontSize || 16;
		const fontFamily = options.fontFamily || 'Noto Sans';
		if (options.name) {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const fitted = fitTextToRect(
				ctx!,
				options.name,
				fontSize,
				fontFamily,
				options.descriptor?.actionButton ? 142 : 168,
				48,
			);
			name = fitted.text;
			fontSize = fitted.fontSize;
		}
		const label = new fabric.Text(name || 'Default Node', {
			fontSize,
			fontFamily,
			fontWeight: 400,
			fill: '#fff',
		});
		const rect = new fabric.Rect({
			rx: 12,
			ry: 12,
			width: 240,
			height: 60,
			strokeWidth: 1,
			fill: options.fill,
			stroke: options.stroke,
		});
		const nodeIcon = Node.createNodeIcon(options);
		const errorFlag = Node.createErrorFlag();
		const node = [rect, nodeIcon, label, errorFlag];
		const button = options.descriptor?.actionButton ? Node.createActionButton() : undefined;
		if (button) {
			node.push(button);
		}
		const nextOptions = Object.assign({}, options, {
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
			subTargetCheck: !!options.descriptor?.actionButton,
			originStroke: options.stroke,
		});
		super(node, nextOptions);
		this.label = label;
		this.rect = rect;
		this.nodeIcon = nodeIcon;
		this.errorFlag = errorFlag;
		this.button = button;
		this.label.set({
			left: this.nodeIcon.left + this.nodeIcon.width + 10,
			top: this.nodeIcon.top + this.nodeIcon.height / 2 - this.label.height / 2,
		});
		this.setErrors(options.errors);
		if (this.button) {
			this.button.set({
				left: this.rect.left + this.rect.width - this.button.width + 1,
				top: this.rect.top + this.rect.height - this.button.height + 1,
			});
			this.button.setCoords();
		}
	}

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
	}

	toPortOption() {
		return {
			...this.defaultPortOption(),
			height: 6,
			width: 24,
		};
	}

	fromPortOption() {
		return {
			...this.defaultPortOption(),
			radius: 12,
		};
	}

	createCustomControls(left: number, top: number) {
		const spinner = new Spinner({
			left,
			top,
			radius: 12,
			fill: '#FFD700',
			transaciton: false,
		});
		this.customControls = [spinner as unknown as CustomControlObject];
		spinner.setPosition(left, top);
		return this.customControls;
	}

	createToPort(left: number, top: number) {
		if (this.descriptor.inEnabled) {
			this.toPort = new ToPort({
				id: 'defaultInPort',
				type: 'toPort',
				...this.toPortOption(),
				left,
				top,
			}) as unknown as PortObject;
			this.toPort.setPosition(left, top);
		}
		return this.toPort;
	}

	createFromPort(left: number, top: number) {
		if (this.descriptor.outPortType === OUT_PORT_TYPE.STATIC) {
			const offset = 60;
			this.fromPort = this.descriptor.outPorts.map((outPort: string, index: number) => {
				const fill = index === 0 ? '#ff3030' : '#15cc08';
				const targetLeft = index === 0 ? left - offset : left + offset;
				const port = new FromPort({
					id: outPort,
					type: 'fromPort',
					left: targetLeft,
					top,
					leftDiff: index === 0 ? -offset : offset,
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
		} else if (
			this.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC ||
			this.descriptor.outPortType === OUT_PORT_TYPE.NONE
		) {
			this.fromPort = [];
		} else {
			const port = new FromPort({
				id: 'defaultFromPort',
				type: 'fromPort',
				...this.fromPortOption(),
				left,
				top,
			}) as unknown as PortObject;
			port.setPosition(left, top);
			this.fromPort = [port];
		}
		return this.fromPort;
	}

	setErrors(errors: any) {
		this.set({ errors });
		if (errors) {
			this.errorFlag.set({ visible: true });
			this.rect.set({ stroke: 'red' });
		} else {
			this.errorFlag.set({ visible: false });
			this.rect.set({ stroke: this.originStroke });
		}
	}

	setName(name: string) {
		const context = this.canvas?.getContext();
		if (!context) {
			return;
		}
		const fitted = fitTextToRect(
			context,
			name,
			this.fontSize,
			this.fontFamily,
			this.descriptor.actionButton ? 142 : 168,
			48,
		);
		this.label.set({
			fontSize: fitted.fontSize,
			text: fitted.text,
			top: this.height > 60 ? -fitted.height / 2 - 19 : -fitted.height / 2,
		});
	}

	select() {
		this.rect.set({ strokeDashArray: [3, 3], strokeWidth: 2 });
		this.canvas?.requestRenderAll();
	}

	unselect() {
		this.rect.set({ strokeDashArray: null, strokeWidth: 1 });
		this.canvas?.requestRenderAll();
	}

	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		return new Node(options) as unknown as NodeObject;
	}

	toObject(propertiesToInclude: any[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
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
			errors: this.get('errors'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new Node(options) as unknown as NodeObject, callback);
	}
}

registerFabricClass('Node', Node);

export default Node;
