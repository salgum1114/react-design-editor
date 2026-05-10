import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class LogicNode extends Node {
	constructor(options: NodeOptions = {}) {
		const type = options.type || 'LogicNode';
		super({ ...options, type, nodeClazz: options.nodeClazz || type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new LogicNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('LogicNode', LogicNode, 'DelayNode', 'FunctionNode', 'BroadcastNode');

if (typeof window !== 'undefined') {
	(window as any).fabric.DelayNode = LogicNode;
	(window as any).fabric.FunctionNode = LogicNode;
	(window as any).fabric.BroadcastNode = LogicNode;
}

export default LogicNode;
