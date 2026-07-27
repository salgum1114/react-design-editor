import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class TriggerNode extends Node {
	static type = 'TriggerNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || TriggerNode.type });
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new TriggerNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('TriggerNode', TriggerNode, 'TimerNode');

export default TriggerNode;
