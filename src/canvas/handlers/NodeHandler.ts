import { fabric } from 'fabric';
import { LinkObject } from '../objects/Link';
import { NodeObject } from '../objects/Node';
import { FabricObject } from '../utils';
import AbstractHandler from './AbstractHandler';

class NodeHandler extends AbstractHandler {
	public create = (options: Partial<NodeObject>, loaded?: boolean) => {
		const createdObj = this.handler.fabricObjects[options.type].create(options) as NodeObject;
		createdObj.set('shadow', { color: createdObj.stroke } as fabric.Shadow);
		this.canvas.add(createdObj);
		if (createdObj.iconButton) {
			this.canvas.add(createdObj.iconButton);
		}
		this.handler.portHandler.create(createdObj);
		if (this.handler.editable && !loaded) {
			this.handler.onAdd?.(createdObj);
		}
	};

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
	};

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
					if (fromIndex >= 0 && targetObjects[fromIndex] && toIndex >= 0 && targetObjects[toIndex]) {
						object.set({
							opacity: 1,
							shadow: { color: object.stroke },
						});
						this.highlightingNode(object, 300);
						this.handler.canvas.requestRenderAll();
						return;
					}
				}
			}
			object.set({ opacity: 0.2 });
			if (object.superType === 'node') {
				if (object.toPort) {
					object.toPort.set({ opacity: 0.2 });
				}
				object.fromPort.forEach((port: any) => port.set({ opacity: 0.2 }));
			}
			if (!object.animating) {
				object.set('shadow', { blur: 0 });
			}
		});
		targetObjects.forEach((object: any) => {
			object.set({
				opacity: 1,
				shadow: { color: object.stroke },
			});
			this.highlightingNode(object, 300);
			if (object.toPort) {
				object.toPort.set({ opacity: 1 });
			}
			if (object.fromPort) {
				object.fromPort.forEach((port: any) => port.set({ opacity: 1 }));
			}
		});
		this.handler.canvas.requestRenderAll();
	};

	/**
	 * Select node by id
	 * @param {string} id
	 */
	selectById = (id: string) => {
		this.handler.objects.forEach((object: FabricObject) => {
			if (id === object.id) {
				object.set('shadow', { color: object.stroke, blur: 50 } as fabric.Shadow);
				return;
			} else if (id === object.nodeId) {
				return;
			}
			object.set('shadow', { blur: 0 } as fabric.Shadow);
		});
		this.handler.canvas.requestRenderAll();
	};

	/**
	 * Deselect nodes
	 */
	deselect = () => {
		this.handler.objects.forEach((object: FabricObject) => {
			object.set({ opacity: 1 });
			if (object.superType === 'node') {
				const node = object as NodeObject;
				if (node.toPort) {
					node.toPort.set({ opacity: 1 });
				}
				node.fromPort.forEach(port => port.set({ opacity: 1 }));
			}
			if (!object.animating) {
				const node = object as FabricObject;
				node.set('shadow', { blur: 0 } as fabric.Shadow);
			}
		});
		this.handler.canvas.renderAll();
	};

	/**
	 * Highlight path by ids
	 * @param {string[]} [path]
	 */
	highlightingByPath = (path?: string[]) => {
		if (!path || !path.length) {
			return;
		}
		const targetObjects = this.handler.objects.filter((obj: FabricObject) => path.some(id => id === obj.id));
		const nonTargetObjects = this.handler.objects.filter((obj: FabricObject) => path.some(id => id !== obj.id));
		const lastObject = targetObjects.filter((obj: FabricObject) => obj.id === path[path.length - 1])[0];
		targetObjects.forEach((object: FabricObject) => {
			if (lastObject) {
				object.set('shadow', { color: lastObject.stroke } as fabric.Shadow);
			} else {
				object.set('shadow', { color: object.stroke } as fabric.Shadow);
			}
			this.highlightingNode(object);
			this.handler.canvas.requestRenderAll();
		});
		nonTargetObjects.forEach((object: FabricObject) => {
			if (object.superType === 'link') {
				const { fromNode, toNode } = object;
				if (fromNode && toNode) {
					const fromIndex = targetObjects.findIndex((obj: FabricObject) => obj.id === fromNode.id);
					const toIndex = targetObjects.findIndex((obj: FabricObject) => obj.id === toNode.id);
					if (fromIndex >= 0 && targetObjects[fromIndex] && toIndex >= 0 && targetObjects[toIndex]) {
						if (lastObject) {
							object.set('shadow', { color: lastObject.stroke } as fabric.Shadow);
						} else {
							object.set('shadow', { color: object.stroke } as fabric.Shadow);
						}
						this.highlightingNode(object);
						this.highlightingLink(object, lastObject);
						return;
					}
				}
			}
		});
		this.handler.canvas.requestRenderAll();
	};

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
	};

	/**
	 * Highlight node
	 *
	 * @param {*} object
	 * @param {number} [duration=500]
	 * @param {number} [minBlur=0]
	 * @param {number} [maxBlur=50]
	 */
	highlightingNode = (object: FabricObject, duration = 500, minBlur = 0, maxBlur = 50) => {
		const onComplete = () => {
			if ((object.shadow as fabric.Shadow).blur === maxBlur) {
				object.animating = true;
				object.animate('shadow.blur', minBlur, {
					easing: fabric.util.ease.easeInOutQuad,
					onChange: (value: number) => {
						(object.shadow as fabric.Shadow).blur = value;
						this.handler.canvas.requestRenderAll();
					},
					onComplete: () => {
						object.animating = false;
						if (object.superType === 'link') {
							object.set({
								stroke: object.originStroke || object.stroke,
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
				(object.shadow as fabric.Shadow).blur = value;
				this.handler.canvas.requestRenderAll();
			},
			onComplete,
		});
	};
}

export default NodeHandler;
