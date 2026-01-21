import { fabric } from 'fabric';
import { FabricObject, NodeHighlightOptions } from '../models';
import { LinkObject } from '../objects/Link';
import { NodeObject } from '../objects/Node';
import AbstractHandler from './AbstractHandler';

const parseColor = (color: string) => {
	const m = color?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
	if (m) {
		return {
			r: Number(m[1]),
			g: Number(m[2]),
			b: Number(m[3]),
			a: m[4] == null ? 1 : Number(m[4]),
		};
	}
	let hex = (color || '').replace('#', '').trim();
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map(c => c + c)
			.join('');
	}
	if (hex.length !== 6) {
		// 파싱 실패 시 흰색 fallback
		return { r: 255, g: 255, b: 255, a: 1 };
	}
	const n = parseInt(hex, 16);
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpColor = (from: string, to: string, t: number) => {
	t = clamp01(t);
	const A = parseColor(from);
	const B = parseColor(to);
	const r = Math.round(lerp(A.r, B.r, t));
	const g = Math.round(lerp(A.g, B.g, t));
	const b = Math.round(lerp(A.b, B.b, t));
	const a = clamp01(lerp(A.a, B.a, t));
	return `rgba(${r},${g},${b},${a})`;
};

class NodeHandler extends AbstractHandler {
	/**
	 * Get the node path by target object
	 * @param {NodeObject} target
	 * @param {NodeObject[]} [nodes=[]]
	 * @param {string} [direction='init']
	 */
	getNodePath = (
		target: NodeObject,
		nodes: NodeObject[] = [],
		direction: 'to' | 'from' | 'init' = 'init',
		visited = new Set<NodeObject>(),
	) => {
		if (!target || visited.has(target)) return;
		visited.add(target);
		if (direction === 'to' || direction === 'init') {
			if (target.toPort) {
				target.toPort.links.forEach(link => {
					if (link.fromNode && !visited.has(link.fromNode)) {
						nodes.push(link.fromNode);
						this.getNodePath(link.fromNode, nodes, 'to', visited);
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
					if (link.toNode && !visited.has(link.toNode)) {
						nodes.push(link.toNode);
						this.getNodePath(link.toNode, nodes, 'from', visited);
					}
				});
			});
		}
	};

	/**
	 * Select the node path
	 * @param {string[]} [path]
	 * @param {NodeHighlightOptions} options
	 */
	selectByPath = (path?: string[], options?: NodeHighlightOptions) => {
		if (!path || !path.length) {
			return;
		}
		const targetObjects = this.handler.objects.filter(obj => path.some(id => id === obj.id));
		const nonTargetObjects = this.handler.objects.filter(obj => path.some(id => id !== obj.id));
		nonTargetObjects.forEach((obj: any) => {
			if (obj.superType === 'link') {
				const { fromNode, toNode } = obj as LinkObject;
				if (fromNode && toNode) {
					const fromIndex = targetObjects.findIndex(obj => obj.id === fromNode.id);
					const toIndex = targetObjects.findIndex(obj => obj.id === toNode.id);
					if (fromIndex >= 0 && targetObjects[fromIndex] && toIndex >= 0 && targetObjects[toIndex]) {
						obj.set({ opacity: 1, shadow: { color: obj.color || obj.fill } });
						this.highlightingNode(obj, options);
						this.handler.canvas.requestRenderAll();
						return;
					}
				}
			}
			obj.set({ opacity: 0.2 });
			if (obj.superType === 'node') {
				if (obj.toPort) {
					obj.toPort.set({ opacity: 0.2 });
				}
				obj.fromPort.forEach((port: any) => port.set({ opacity: 0.2 }));
			}
			if (!obj.animating) {
				obj.set('shadow', { blur: 0 });
			}
		});
		targetObjects.forEach((obj: any) => {
			obj.set({ opacity: 1, shadow: { color: obj.color || obj.fill } });
			this.highlightingNode(obj, options);
			if (obj.toPort) {
				obj.toPort.set({ opacity: 1 });
			}
			if (obj.fromPort) {
				obj.fromPort.forEach((port: any) => port.set({ opacity: 1 }));
			}
		});
		this.handler.canvas.requestRenderAll();
	};

	/**
	 * Select node by id
	 * @param {string} id
	 */
	selectById = (id: string) => {
		this.handler.objects.forEach((obj: FabricObject) => {
			if (id === obj.id) {
				obj.set('shadow', { color: obj.fill, blur: 50 } as fabric.Shadow);
				return;
			} else if (id === obj.nodeId) {
				return;
			}
			obj.set('shadow', { blur: 0 } as fabric.Shadow);
		});
		this.handler.canvas.requestRenderAll();
	};

	/**
	 * Deselect nodes
	 */
	deselect = () => {
		this.handler.objects.forEach((obj: FabricObject) => {
			obj.set({ opacity: 1 });
			if (obj.superType === 'node') {
				const node = obj as NodeObject;
				if (node.toPort) {
					node.toPort.set({ opacity: 1 });
				}
			}
			if (!obj.animating) {
				const node = obj as FabricObject;
				node.set('shadow', { blur: 0 } as fabric.Shadow);
			}
		});
		this.handler.canvas.renderAll();
	};

	/**
	 * Highlight path by ids
	 *
	 * @param {string[]} [path]
	 * @param {NodeHighlightOptions} highlightOptions
	 */
	highlightingByPath = (path?: string[], options?: NodeHighlightOptions) => {
		if (!path || !path.length) {
			return;
		}
		const targetObjects = (this.handler.objects as NodeObject[]).filter(obj => path.some(id => id === obj.id));
		const nonTargetObjects = (this.handler.objects as NodeObject[]).filter(obj => path.some(id => id !== obj.id));
		const lastObj = targetObjects.filter(obj => obj.id === path[path.length - 1])[0];
		targetObjects.forEach(obj => {
			if (lastObj) {
				obj.set('shadow', { color: lastObj.color || lastObj.fill } as fabric.Shadow);
			} else {
				obj.set('shadow', { color: lastObj.color || obj.fill } as fabric.Shadow);
			}
			this.highlightingNode(obj, options);
			this.handler.canvas.requestRenderAll();
		});
		nonTargetObjects.forEach(obj => {
			if (obj.superType === 'link') {
				const { fromNode, toNode } = obj;
				if (fromNode && toNode) {
					const fromIndex = targetObjects.findIndex(obj => obj.id === fromNode.id);
					const toIndex = targetObjects.findIndex(obj => obj.id === toNode.id);
					if (fromIndex >= 0 && targetObjects[fromIndex] && toIndex >= 0 && targetObjects[toIndex]) {
						if (lastObj) {
							obj.set('shadow', { color: lastObj.color || lastObj.fill } as fabric.Shadow);
						} else {
							obj.set('shadow', { color: lastObj.color || obj.fill } as fabric.Shadow);
						}
						this.highlightingNode(obj, options);
						this.highlightingLink(obj, lastObj);
						return;
					}
				}
			}
		});
		this.handler.canvas.requestRenderAll();
	};

	/**
	 * Highlight link
	 * @param {FabricObject} obj
	 * @param {FabricObject} targetObj
	 * @param {number} [duration=500]
	 */
	highlightingLink = (obj: FabricObject, targetObj?: NodeObject, duration = 300) => {
		const link: any = obj as any;
		const line: fabric.Path | undefined = link.line;
		const arrow: fabric.Triangle | undefined = link.arrow;
		if (!line) return;
		if (!(obj as any).__baseStroke) {
			(obj as any).__baseStroke =
				(line.stroke as string) || (obj.stroke as string) || (obj.originStroke as string) || '#ffffff';
		}
		const baseStroke = (obj as any).__baseStroke as string;
		const targetStroke = targetObj?.color || (targetObj?.fill as string) || baseStroke;
		if (!baseStroke || baseStroke === targetStroke) return;
		const nextToken = ((obj as any).__linkAnimToken ?? 0) + 1;
		(obj as any).__linkAnimToken = nextToken > 1_000_000 ? 1 : nextToken;
		const token = (obj as any).__linkAnimToken;
		fabric.util.animate({
			startValue: 0,
			endValue: 1,
			duration,
			easing: fabric.util.ease.easeInOutQuad,
			onChange: (t: number) => {
				if ((obj as any).__linkAnimToken !== token) return;
				const c = lerpColor(baseStroke, targetStroke, t);
				line.set('stroke', c);
				if (arrow) arrow.set('fill', c);
				this.handler.canvas.requestRenderAll();
			},
			onComplete: () => {
				if ((obj as any).__linkAnimToken !== token) return;

				fabric.util.animate({
					startValue: 1,
					endValue: 0,
					duration,
					easing: fabric.util.ease.easeInOutQuad,
					onChange: (t: number) => {
						if ((obj as any).__linkAnimToken !== token) return;

						const c = lerpColor(baseStroke, targetStroke, t);
						line.set('stroke', c);
						if (arrow) arrow.set('fill', c);
						this.handler.canvas.requestRenderAll();
					},
					onComplete: () => {
						if ((obj as any).__linkAnimToken !== token) return;

						line.set('stroke', baseStroke);
						if (arrow) arrow.set('fill', baseStroke);
						this.handler.canvas.requestRenderAll();
					},
				});
			},
		});
	};

	/**
	 * Highlight node
	 *
	 * @param {*} obj
	 * @param {NodeHighlightOptions} highlightOptions
	 */
	highlightingNode = (
		obj: NodeObject,
		options: NodeHighlightOptions = { duration: 300, minBlur: 0, maxBlur: 30 },
	) => {
		const { duration, minBlur, maxBlur } = options;
		const nextToken = ((obj as any).__nodeBlurAnimToken ?? 0) + 1;
		(obj as any).__nodeBlurAnimToken = nextToken > 1_000_000 ? 1 : nextToken;
		const token = (obj as any).__nodeBlurAnimToken;

		const currentShadow = obj.shadow as fabric.Shadow | undefined;
		if (!currentShadow) {
			obj.set('shadow', new fabric.Shadow({ color: obj.color as string, blur: minBlur }));
		} else {
			if (!(currentShadow as any).color) {
				(obj.shadow as fabric.Shadow).color = (obj as any).color || (obj as any).stroke;
			}
			(obj.shadow as fabric.Shadow).blur = (obj.shadow as fabric.Shadow).blur ?? minBlur;
		}
		obj.animating = true;

		obj.animate('shadow.blur', maxBlur, {
			easing: fabric.util.ease.easeInOutQuad,
			duration,
			onChange: (value: number) => {
				if ((obj as any).__nodeBlurAnimToken !== token) return;

				(obj.shadow as fabric.Shadow).blur = value;
				this.handler.canvas.requestRenderAll();
			},
			onComplete: () => {
				if ((obj as any).__nodeBlurAnimToken !== token) return;

				obj.animate('shadow.blur', minBlur, {
					easing: fabric.util.ease.easeInOutQuad,
					duration,
					onChange: (value: number) => {
						if ((obj as any).__nodeBlurAnimToken !== token) return;

						(obj.shadow as fabric.Shadow).blur = value;
						this.handler.canvas.requestRenderAll();
					},
					onComplete: () => {
						if ((obj as any).__nodeBlurAnimToken !== token) return;

						obj.animating = false;
						(obj.shadow as fabric.Shadow).blur = minBlur;
						this.handler.canvas.requestRenderAll();
					},
				});
			},
		});
	};
}

export default NodeHandler;
