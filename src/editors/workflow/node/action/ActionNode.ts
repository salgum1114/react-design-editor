import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class ActionNode extends Node {
	static type = 'ActionNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || ActionNode.type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new ActionNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('ActionNode', ActionNode, 'DebugNode', 'EmailNode');

export default ActionNode;
