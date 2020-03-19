import { fabric } from 'fabric';

import Handler from './Handler';
import { FabricObject } from '../utils';
import { NodeObject } from '../objects/Node';
import { LinkObject } from '../objects/Link';

class NodeHandler {
    handler: Handler;
    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * Get the node path by target object
     * @param {NodeObject} target
     * @param {NodeObject[]} [nodes=[]]
     * @param {string} [direction='init']
     */
    getNodePath = (target: NodeObject, nodes: NodeObject[] = [], direction = 'init') => {
        if (target) {
            if (direction === 'to' || direction === 'init') {
                if (target.toPort) {
                    target.toPort.links.forEach(link => {
                        if (link.fromNode) {
                            nodes.push(link.fromNode);
                            this.getNodePath(link.fromNode, nodes, 'to');
                        }
                    });
                }
                if (direction === 'init') {
                    nodes.push(target);
                }
            }
            if (direction === 'from' || direction === 'init') {
                target.fromPort.forEach(port => {
                    port.links.forEach(link => {
                        if (link.toNode) {
                            nodes.push(link.toNode);
                            this.getNodePath(link.toNode, nodes, 'from');
                        }
                    });
                });
            }
        }
    }

    /**
     * Select the node path
     * @param {string[]} [path]
     */
    selectByPath = (path?: string[]) => {
        if (!path || !path.length) {
            return;
        }
        const targetObjects = this.handler.objects.filter(object => path.some(id => id === object.id));
        const nonTargetObjects = this.handler.objects.filter(object => path.some(id => id !== object.id));
        nonTargetObjects.forEach((object: any) => {
            if (object.superType === 'link') {
                const { fromNode, toNode } = object as LinkObject;
                if (fromNode && toNode) {
                    const fromIndex = targetObjects.findIndex(obj => obj.id === fromNode.id);
                    const toIndex = targetObjects.findIndex(obj => obj.id === toNode.id);
                    if ((fromIndex >= 0 && targetObjects[fromIndex]) && (toIndex >= 0 && targetObjects[toIndex])) {
                        object.set({
                            opacity: 1,
                        });
                        object.setShadow({
                            color: object.stroke,
                        });
                        this.highlightingNode(object, 300);
                        this.handler.canvas.requestRenderAll();
                        return;
                    }
                }
            }
            object.set({
                opacity: 0.2,
            });
            if (object.superType === 'node') {
                if (object.toPort) {
                    object.toPort.set({
                        opacity: 0.2,
                    });
                }
                object.fromPort.forEach((port: any) => {
                    port.set({
                        opacity: 0.2,
                    });
                });
            }
            if (!object.animating) {
                object.setShadow({
                    blur: 0,
                });
            }
        });
        targetObjects.forEach((object: any) => {
            object.set({
                opacity: 1,
            });
            object.setShadow({
                color: object.fill,
            });
            this.highlightingNode(object, 300);
            if (object.toPort) {
                object.toPort.set({
                    opacity: 1,
                });
            }
            if (object.fromPort) {
                object.fromPort.forEach((port: any) => {
                    port.set({
                        opacity: 1,
                    });
                });
            }
        });
        this.handler.canvas.requestRenderAll();
    }

    /**
     * Select node by id
     * @param {string} id
     */
    selectById = (id: string) => {
        this.handler.objects.forEach((object: any) => {
            if (id === object.id) {
                object.setShadow({
                    color: object.fill,
                    blur: 50,
                });
                return;
            } else if (id === object.nodeId) {
                return;
            }
            object.setShadow({
                blur: 0,
            });
        });
        this.handler.canvas.requestRenderAll();
    }

    /**
     * Deselect nodes
     */
    deselect = () => {
        this.handler.objects.forEach((object: FabricObject) => {
            object.set({
                opacity: 1,
            });
            if (object.superType === 'node') {
                const node = object as NodeObject;
                if (node.toPort) {
                    node.toPort.set({
                        opacity: 1,
                    });
                }
                node.fromPort.forEach(port => {
                    port.set({
                        opacity: 1,
                    });
                });
            }
            if (!object.animating) {
                const node = object as any;
                node.setShadow({
                    blur: 0,
                });
            }
        });
        this.handler.canvas.renderAll();
    }

    /**
     * Highlight node path
     * @param {string[]} [path]
     */
    highlightingByPath = (path?: string[]) => {
        if (!path || !path.length) {
            return;
        }
        const targetObjects = this.handler.objects.filter((obj: FabricObject) => path.some(id => id === obj.id));
        const nonTargetObjects = this.handler.objects.filter((obj: FabricObject) => path.some(id => id !== obj.id));
        const lastObject = targetObjects.filter((obj: FabricObject) => obj.id === path[path.length - 1])[0];
        targetObjects.forEach((object: any) => {
            if (lastObject) {
                object.setShadow({
                    color: lastObject.fill,
                });
            } else {
                object.setShadow({
                    color: object.fill,
                });
            }
            this.highlightingNode(object);
            this.handler.canvas.requestRenderAll();
        });
        nonTargetObjects.forEach((object: any) => {
            if (object.superType === 'link') {
                const { fromNode, toNode } = object;
                if (fromNode && toNode) {
                    const fromIndex = targetObjects.findIndex((obj: FabricObject) => obj.id === fromNode.id);
                    const toIndex = targetObjects.findIndex((obj: FabricObject) => obj.id === toNode.id);
                    if ((fromIndex >= 0 && targetObjects[fromIndex]) && (toIndex >= 0 && targetObjects[toIndex])) {
                        if (lastObject) {
                            object.setShadow({
                                color: lastObject.stroke,
                            });
                        } else {
                            object.setShadow({
                                color: object.stroke,
                            });
                        }
                        this.highlightingNode(object);
                        this.highlightingLink(object, lastObject);
                        return;
                    }
                }
            }
        });
        this.handler.canvas.requestRenderAll();
    }

    /**
     * Highlight link
     * @param {FabricObject} object
     * @param {FabricObject} targetObject
     * @param {number} [duration=500]
     */
    highlightingLink = (object: FabricObject, targetObject: FabricObject, duration = 500) => {
        object.animation = {
            duration,
            type: 'flash',
            stroke: targetObject ? targetObject.stroke : object.stroke,
            loop: 1,
            delay: 0,
        };
        this.handler.animationHandler.play(object.id, false);
    }

    /**
     * Highlight node
     * @param {*} object
     * @param {number} [duration=500]
     */
    highlightingNode = (object: any, duration = 500) => {
        const maxBlur = 50;
        const minBlur = 0;
        const onComplete = () => {
            if (object.shadow.blur === maxBlur) {
                object.animating = true;
                object.animate('shadow.blur', minBlur, {
                    easing: fabric.util.ease.easeInOutQuad,
                    onChange: (value: number) => {
                        object.shadow.blur = value;
                        this.handler.canvas.requestRenderAll();
                    },
                    onComplete: () => {
                        object.animating = false;
                        if (object.superType === 'link') {
                            object.set({
                                stroke: object.originStroke,
                            });
                        }
                    },
                });
            }
        };
        object.animating = true;
        object.animate('shadow.blur', maxBlur, {
            easing: fabric.util.ease.easeInOutQuad,
            duration,
            onChange: (value: number) => {
                object.shadow.blur = value;
                this.handler.canvas.requestRenderAll();
            },
            onComplete,
        });
    }
}

export default NodeHandler;
