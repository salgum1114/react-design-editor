import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class ActionNode extends Node {
	constructor(options: NodeOptions = {}) {
		const type = options.type || 'ActionNode';
		super({ ...options, type, nodeClazz: options.nodeClazz || type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new ActionNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('ActionNode', ActionNode, 'DebugNode', 'EmailNode');

if (typeof window !== 'undefined') {
	(window as any).fabric.DebugNode = ActionNode;
	(window as any).fabric.EmailNode = ActionNode;
}

export default ActionNode;
