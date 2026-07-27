import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class LogicNode extends Node {
	static type = 'LogicNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || LogicNode.type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new LogicNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('LogicNode', LogicNode, 'DelayNode', 'FunctionNode', 'BroadcastNode');

export default LogicNode;
