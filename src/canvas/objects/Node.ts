import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { FabricObject } from '../models';
import { fitTextToRect } from '../utils';
import { LinkObject } from './Link';
import Port, { PortObject } from './Port';

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
	toPort?: PortObject;
	errors?: any;
	fromPort?: PortObject[];
	descriptor?: Record<string, any>;
	nodeClazz?: string;
	configuration?: Record<string, any>;
	defaultPortOption?: () => Partial<PortObject>;
	toPortOption?: () => Partial<PortObject>;
	fromPortOption?: () => Partial<PortObject>;
	createToPort?: (left: number, top: number) => PortObject;
	createFromPort?: (left: number, top: number) => PortObject[];
	singlePort?: (portOption: Partial<PortObject>) => PortObject[];
	staticPort?: (portOption: Partial<PortObject>) => PortObject[];
	dynamicPort?: (portOption: Partial<PortObject>) => PortObject[];
	broadcastPort?: (portOption: Partial<PortObject>) => PortObject[];
	setErrors?: (errors: any) => void;
	setName?: (name: string) => void;
	duplicate?: () => NodeObject;
}

const Node = fabric.util.createClass(fabric.Group, {
	type: 'node',
	superType: 'node',
	initialize(options: any) {
		options = options || {};
		const icon = new fabric.IText(options.icon || '\uE174', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 20,
			fill: options.color || '#fff',
		});
		let name = options.name || 'Default Node';
		let fontSize = options.fontSize || 16;
		const fontFamily = options.fontFamily || 'Noto Sans';
		if (options.name) {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const { text, fontSize: size } = fitTextToRect(ctx!, options.name, fontSize, fontFamily, 150, 32);
			name = text;
			fontSize = size;
		}
		this.label = new fabric.Text(name || 'Default Node', {
			fontSize,
			fontFamily,
			fontWeight: 400,
			fill: '#fff',
		});
		const rect = new fabric.Rect({
			rx: 10,
			ry: 10,
			width: 200,
			height: 40,
			fill: options.fill,
			stroke: options.stroke,
			strokeWidth: 2,
		});
		this.errorFlag = new fabric.IText('\uf071', {
			fontFamily: 'Font Awesome 5 Free',
			fontWeight: 900,
			fontSize: 14,
			fill: 'red',
			visible: options.errors,
		});
		const node = [rect, icon, this.label, this.errorFlag];
		const option = Object.assign({}, options, {
			id: options.id || uuid(),
			width: 200,
			height: 40,
			originX: 'left',
			originY: 'top',
			hasRotatingPoint: false,
			hasControls: false,
			fontSize,
			fontFamily,
			color: options.color,
		});
		this.callSuper('initialize', node, option);
		icon.set({
			top: icon.top! + 10,
			left: icon.left! + 10,
		});
		this.label.set({
			top: this.label.top + this.label.height / 2 + 4,
			left: this.label.left + 35,
		});
		this.errorFlag.set({
			left: rect.left,
			top: rect.top,
			visible: options.errors,
		});
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
			originFill: this.fill,
			hoverFill: this.fill,
			selectFill: this.fill,
			fill: this.fill,
			hoverCursor: 'pointer',
			strokeWidth: 2,
			stroke: this.stroke,
			width: 10,
			height: 10,
			links: [] as LinkObject[],
			enabled: true,
		};
	},
	toPortOption() {
		return {
			...this.defaultPortOption(),
		};
	},
	fromPortOption() {
		return {
			...this.defaultPortOption(),
			angle: 45,
		};
	},
	createToPort(left: number, top: number) {
		if (this.descriptor.inEnabled) {
			this.toPort = new Port({
				id: 'defaultInPort',
				type: 'toPort',
				...this.toPortOption(),
				left,
				top,
			});
		}
		return this.toPort;
	},
	createFromPort(left: number, top: number) {
		if (this.descriptor.outPortType === OUT_PORT_TYPE.BROADCAST) {
			this.fromPort = this.broadcastPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.STATIC) {
			this.fromPort = this.staticPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC) {
			this.fromPort = this.dynamicPort({ ...this.fromPortOption(), left, top });
		} else if (this.descriptor.outPortType === OUT_PORT_TYPE.NONE) {
			this.fromPort = [];
		} else {
			this.fromPort = this.singlePort({ ...this.fromPortOption(), left, top });
		}
		return this.fromPort;
	},
	singlePort(portOption: any) {
		const fromPort = new Port({
			id: 'defaultFromPort',
			type: 'fromPort',
			...portOption,
		});
		return [fromPort];
	},
	staticPort(portOption: any) {
		return this.descriptor.outPorts.map((outPort: any, i: number) => {
			return new Port({
				id: outPort,
				type: 'fromPort',
				...portOption,
				left: i === 0 ? portOption.left - 20 : portOption.left + 20,
				top: portOption.top,
				leftDiff: i === 0 ? -20 : 20,
				fill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
				originFill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
				hoverFill: i === 0 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)',
			});
		});
	},
	dynamicPort(_portOption: any): any[] {
		return [];
	},
	broadcastPort(portOption: any) {
		return this.singlePort(portOption);
	},
	setErrors(errors: any) {
		this.set({ errors });
		if (errors) {
			this.errorFlag.set({ visible: true });
		} else {
			this.errorFlag.set({ visible: false });
		}
	},
	setName(name: string) {
		const context = this.canvas.getContext('2d');
		const { text, fontSize, height } = fitTextToRect(context, name, this.fontSize, this.fontFamily, 150, 32);
		this.label.set({
			fontSize,
			text,
			// -19 magic constant
			top: this.height > 60 ? -height / 2 - 19 : -height / 2,
		});
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		return new Node(options);
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
