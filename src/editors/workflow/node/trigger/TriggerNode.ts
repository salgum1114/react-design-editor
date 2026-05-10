import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class TriggerNode extends Node {
	constructor(options: NodeOptions = {}) {
		const type = options.type || 'TriggerNode';
		super({ ...options, type, nodeClazz: options.nodeClazz || type });
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new TriggerNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('TriggerNode', TriggerNode, 'TimerNode');

if (typeof window !== 'undefined') {
	(window as any).fabric.TimerNode = TriggerNode;
}

export default TriggerNode;
