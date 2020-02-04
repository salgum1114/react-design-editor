import Handler from './Handler';
import { CurvedLink } from '../objects';
import { NodeObject } from '../objects/Node';
import { PortObject } from '../objects/Port';
import { LinkObject } from '../objects/Link';

interface LinkOption {
    type: string;
    fromNode: string;
    fromPort: string;
    toNode: string;
    toPort: string;
}

class LinkHandler {
    handler: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    init = (target: any) => {
        if (!target.enabled) {
            console.warn('A connected node already exists.');
            return;
        }
        this.handler.interactionMode = 'link';
        const { left, top, nodeId, id } = target;
        const fromPort = { left, top, id };
        const toPort = { left, top };
        const fromNode = this.handler.objectMap[nodeId]
        this.handler.activeLine = new CurvedLink(fromNode, fromPort, null, toPort, {
            strokeWidth: 2,
            fill: '#999999',
            stroke: '#999999',
            class: 'line',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false,
        });
        this.handler.canvas.add(this.handler.activeLine);
    }

    finish = () => {
        this.handler.interactionMode = 'selection';
        this.handler.canvas.remove(this.handler.activeLine);
        this.handler.activeLine = null;
        this.handler.canvas.renderAll();
    }

    generate = (target: PortObject) => {
        if (!target) {
            console.warn('Does not exist target.');
            return;
        }
        if (target.nodeId === this.handler.activeLine.fromNode) {
            console.warn('Can not select the same node.');
            return;
        }
        const link = {
            type: 'curvedLink',
            fromNode: this.handler.activeLine.fromNode.id,
            fromPort: this.handler.activeLine.fromPort.id,
            toNode: target.nodeId,
            toPort: target.id,
        };
        this.finish();
        this.create(link);
    }

    create = (link: LinkOption, loaded = false, transaction = true) => {
        const fromNode = this.handler.objectMap[link.fromNode] as NodeObject;
        const fromPort = fromNode.fromPort.filter(port => port.id === link.fromPort || !port.id)[0];
        const toNode = this.handler.objectMap[link.toNode] as NodeObject;
        const { toPort } = toNode;
        const createdObj = this.handler.fabricObjects[link.type].create(fromNode, fromPort, toNode, toPort, { ...link }) as LinkObject;
        this.handler.canvas.add(createdObj);
        this.handler.objects = this.handler.getObjects();
        const { editable } = this.handler;
        if (this.handler.onAdd && editable && !loaded) {
            this.handler.onAdd(createdObj);
        }
        this.handler.canvas.renderAll();
        createdObj.setPort(fromNode, fromPort, toNode, toPort);
        this.handler.portHandler.setCoords(fromNode);
        this.handler.portHandler.setCoords(toNode);
        this.handler.canvas.requestRenderAll();
        if (!this.handler.transactionHandler.active && transaction) {
            this.handler.transactionHandler.save('add');
        }
        return createdObj;
    }

    setCoords = (x1: any, y1: any, x2: any, y2: any, link: any) => {
        link.set({
            x1,
            y1,
            x2,
            y2,
        });
        link.setCoords();
    }

    removeFrom = (link: LinkObject) => {
        if (link.fromNode.fromPort.length) {
            let index = -1;
            link.fromNode.fromPort.forEach((port: any) => {
                if (port.links.length) {
                    port.links.some((portLink: any, i: number) => {
                        if (link.id === portLink.id) {
                            index = i;
                            return true;
                        }
                        return false;
                    });
                    if (index > -1) {
                        port.links.splice(index, 1);
                    }
                }
                link.setPortEnabled(link.fromNode, port, true);
            });
        }
    }

    removeTo = (link: LinkObject) => {
        if (link.toNode.toPort.links.length) {
            let index = -1;
            link.toNode.toPort.links.some((portLink: any, i: number) => {
                if (link.id === portLink.id) {
                    index = i;
                    return true;
                }
                return false;
            });
            if (index > -1) {
                link.toNode.toPort.links.splice(index, 1);
            }
            link.setPortEnabled(link.toNode, link.toNode.toPort, true);
        }
    }

    removeAll = (link: any) => {
        this.removeFrom(link);
        this.removeTo(link);
    }

    remove = (link: any, type?: string) => {
        if (type === 'from') {
            this.removeFrom(link);
        } else if (type === 'to') {
            this.removeTo(link);
        } else {
            this.removeAll(link);
        }
        this.handler.canvas.remove(link);
        this.handler.objects = this.handler.getObjects();
    }

    alreadyConnect = (target: any) => {
        if (!target.enabled) {
            console.warn('A connected node already exists.');
            return;
        }
    }

    duplicate = (target: any) => {
        if (target.links.some((link: any) => link.fromNode === this.handler.activeLine.fromNode)) {
            console.warn('Duplicate connections can not be made.');
            return;
        }
    }

    alreadyDrawing = () => {
        if (this.handler.interactionMode === 'link' && this.handler.activeLine) {
            console.warn('Already drawing links.');
            return;
        }
    }
}

export default LinkHandler;
