import { fabric } from 'fabric';
import uuid from 'uuid';

import { FabricObject } from '../utils';
import { OUT_PORT_TYPE, NodeObject } from './Node';

export interface LinkObject extends FabricObject<fabric.Line> {
    fromNode?: NodeObject;
    toNode?: NodeObject;
}

const Link = fabric.util.createClass(fabric.Line, {
    type: 'link',
    superType: 'link',
    initialize(fromNode: any, fromPort: any, toNode: any, toPort: any, options: any) {
        options = options || {};
        if (fromNode.type === 'BroadcastNode') {
            fromPort = fromNode.fromPort[0];
        }
        const coords = [fromPort.left, fromPort.top, toPort.left, toPort.top];
        this.callSuper('initialize', coords, options);
        this.set({
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
            fromNode,
            toNode,
            selectable: false,
        });
    },
    setPort(fromNode: any, fromPort: any, _toNode: any, toPort: any) {
        if (fromNode.type === 'BroadcastNode') {
            fromPort = fromNode.fromPort[0];
        }
        fromPort.links.push(this);
        toPort.links.push(this);
        this.setPortEnabled(fromNode, fromPort, false);
    },
    setPortEnabled(node: any, port: any, enabled: any) {
        if (node.descriptor.outPortType !== OUT_PORT_TYPE.BROADCAST) {
            port.set({
                enabled,
            });
        } else {
            if (node.toPort.id === port.id) {
                return;
            }
            port.links.forEach((link: any, index: any) => {
                link.set({
                    fromPort: 'broadcastFromPort',
                    fromPortIndex: index,
                });
            });
            node.set({
                configuration: {
                    outputCount: port.links.length,
                },
            });
        }
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
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        ctx.save();
        const xDiff = this.x2 - this.x1;
        const yDiff = this.y2 - this.y1;
        const angle = Math.atan2(yDiff, xDiff);
        ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
        ctx.rotate(angle);
        ctx.beginPath();
        // Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
        ctx.moveTo(5, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();
        ctx.restore();
    },
});

Link.fromObject = (options: LinkObject, callback: (obj: LinkObject) => any) => {
    return callback(new Link(options));
};

export default Link;
