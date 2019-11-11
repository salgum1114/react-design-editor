import { fabric } from 'fabric';
import uuid from 'uuid';
import i18next from 'i18next';

import { FabricObject } from '../utils';
import { LinkObject } from './Link';

export type NodeType = 'TRIGGER' | 'LOGIC' | 'DATA' | 'ACTION';

export const NODE_COLORS = {
    TRIGGER: {
        fill: '#48C9B0',
        border: '#1ABC9C',
    },
    LOGIC: {
        fill: '#AF7AC5',
        border: '#9B59B6',
    },
    DATA: {
        fill: '#5DADE2',
        border: '#3498DB',
    },
    ACTION: {
        fill: '#F5B041',
        border: 'rgb(243, 156, 18)',
    },
};

export const OUT_PORT_TYPE = {
    SINGLE: 'SINGLE',
    STATIC: 'STATIC',
    DYNAMIC: 'DYNAMIC',
    BROADCAST: 'BROADCAST',
    NONE: 'NONE',
};

export const DESCRIPTIONS = {
    script: i18next.t('common.name'),
    template: i18next.t('common.name'),
    json: i18next.t('common.name'),
    cron: i18next.t('common.name'),
};

export const getEllipsis = (text: string, length: number) => {
    if (!length) {
        return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text) ? (text.length > 8 ? text.substring(0, 8).concat('...') : text)
        : (text.length > 15 ? text.substring(0, 15).concat('...') : text);
    }
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text) ? (text.length > length / 2 ? text.substring(0, length / 2).concat('...') : text)
    : (text.length > length ? text.substring(0, length).concat('...') : text);
};

export interface PortObject extends FabricObject<fabric.Rect> {
    links?: LinkObject[];
    nodeId?: string;
}

export interface NodeObject extends FabricObject<fabric.Group> {
    errorFlag?: fabric.IText;
    label?: fabric.Text;
    toPort?: PortObject;
    fromPort?: PortObject[];
    descriptor?: {
        type: string;
        icon: string;
    };
    nodeClazz?: string;
    configuration?: object;
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
            fill: 'rgba(255, 255, 255, 0.8)',
        });
        let name = 'Default Node';
        if (options.name) {
            name = getEllipsis(options.name, 18);
        }
        this.label = new fabric.Text(name || 'Default Node', {
            fontSize: 16,
            fontFamily: 'polestar',
            fontWeight: 500,
            fill: 'rgba(255, 255, 255, 0.8)',
        });
        const rect = new fabric.Rect({
            rx: 10,
            ry: 10,
            width: 200,
            height: 40,
            fill: options.fill || 'rgba(0, 0, 0, 0.3)',
            stroke: options.stroke || 'rgba(0, 0, 0, 0)',
            strokeWidth: 2,
        });
        this.errorFlag = new fabric.IText('\uf071', {
            fontFamily: 'Font Awesome 5 Free',
            fontWeight: 900,
            fontSize: 14,
            fill: 'rgba(255, 0, 0, 0.8)',
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
        });
        this.callSuper('initialize', node, option);
        icon.set({
            top: icon.top + 10,
            left: icon.left + 10,
        });
        this.label.set({
            top: this.label.top + (this.label.height / 2) + 4,
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
            description: this.get('description'),
            superType: this.get('superType'),
            configuration: this.get('configuration'),
            nodeClazz: this.get('nodeClazz'),
            descriptor: this.get('descriptor'),
            borderColor: this.get('borderColor'),
            borderScaleFactor: this.get('borderScaleFactor'),
            dblclick: this.get('dblclick'),
            deleted: this.get('deleted'),
            cloneable: this.get('cloneable'),
            fromPort: this.get('fromPort'),
            toPort: this.get('toPort'),
        });
    },
    defaultPortOption() {
        const { type }: { type: NodeType } = this.descriptor as any;
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
            originFill: 'rgba(0, 0, 0, 0.1)',
            hoverFill: 'green',
            errorFill: 'red',
            fill: 'rgba(0, 0, 0, 0.1)',
            hoverCursor: 'pointer',
            strokeWidth: 2,
            stroke: this.descriptor ? NODE_COLORS[type].border : 'rgba(0, 0, 0, 1)',
            width: 10,
            height: 10,
            links: [] as any[],
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
            this.toPort = new fabric.Rect({
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
        const fromPort = new fabric.Rect({
            id: 'defaultFromPort',
            type: 'fromPort',
            ...portOption,
        });
        return [fromPort];
    },
    staticPort(portOption: any) {
        return this.descriptor.outPorts.map((outPort: any, i: number) => {
            return new fabric.Rect({
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
        const fromPort = new fabric.Rect({
            id: 'broadcastFromPort',
            type: 'fromPort',
            ...portOption,
        });
        return [fromPort];
    },
    setErrors(errors: any) {
        if (errors) {
            this.errorFlag.set({
                visible: true,
            });
        } else {
            this.errorFlag.set({
                visible: false,
            });
        }
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

export default Node;
