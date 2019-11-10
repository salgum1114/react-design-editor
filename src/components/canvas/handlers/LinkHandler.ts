import Handler from './Handler';
import { FabricObject } from '../utils';
import { CurvedLink } from '../objects';
import { PortObject } from '../objects/Node';

export interface LinkHandlerOptions {
    onAdd?: (object: FabricObject) => void;
}

class LinkHandler {
    handler: Handler;
    onAdd?: (object: FabricObject) => void;

    constructor(handler: Handler, options: LinkHandlerOptions) {
        this.handler = handler;
        this.onAdd = options.onAdd;
    }

    init = (target) => {
        if (!target.enabled) {
            console.warn('A connected node already exists.');
            return;
        }
        this.handler.interactionMode = 'link';
        const { left, top } = target;
        // const points = [left, top, left, top];
        const fromPort = { left, top };
        const toPort = { left, top };
        this.handler.activeLine = new CurvedLink(target.nodeId, fromPort, null, toPort, {
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
            fromNode: target.nodeId,
            fromPort: target.id,
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
            fromNode: this.handler.activeLine.fromNode,
            fromPort: this.handler.activeLine.fromPort,
            toNode: target.nodeId,
            toPort: target.id,
        };
        this.create(link, true);
        this.finish();
    }

    create = (link, init = false) => {
        const fromNode = this.handler.findById(link.fromNode);
        const fromPort = fromNode.fromPort.filter(port => port.id === link.fromPort || !port.id)[0];
        const toNode = this.handler.findById(link.toNode);
        const { toPort } = toNode;
        const createdObj = this.handler.fabricObjects[link.type].create(fromNode, fromPort, toNode, toPort, { ...link });
        this.handler.canvas.add(createdObj);
        this.handler.objects = this.handler.getObjects();
        const { editable } = this.handler;
        if (this.onAdd && editable && init) {
            this.onAdd(createdObj);
        }
        this.handler.canvas.renderAll();
        createdObj.setPort(fromNode, fromPort, toNode, toPort);
        this.handler.portHandler.setCoords(fromNode);
        this.handler.portHandler.setCoords(toNode);
        this.handler.canvas.requestRenderAll();
        return createdObj;
    }

    setCoords = (x1, y1, x2, y2, link) => {
        link.set({
            x1,
            y1,
            x2,
            y2,
        });
        link.setCoords();
    }

    removeFrom = (link) => {
        if (link.fromNode.fromPort.length) {
            let index = -1;
            link.fromNode.fromPort.forEach((port) => {
                if (port.links.length) {
                    port.links.some((portLink, i) => {
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

    removeTo = (link) => {
        if (link.toNode.toPort.links.length) {
            let index = -1;
            link.toNode.toPort.links.some((portLink, i) => {
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

    removeAll = (link) => {
        this.removeFrom(link);
        this.removeTo(link);
    }

    remove = (link, type?: string) => {
        if (type === 'from') {
            this.removeFrom(link);
        } else if (type === 'to') {
            this.removeTo(link);
        } else {
            this.removeAll(link);
        }
        this.handler.canvas.remove(link);
        this.handler.removeOriginById(link.id);
    }

    alreadyConnect = (target) => {
        if (!target.enabled) {
            console.warn('A connected node already exists.');
            return;
        }
    }

    duplicate = (target) => {
        if (target.links.some(link => link.fromNode.id === this.handler.activeLine.fromNode)) {
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
