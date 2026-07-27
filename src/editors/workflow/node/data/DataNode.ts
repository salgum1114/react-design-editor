import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class DataNode extends Node {
	static type = 'DataNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || DataNode.type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new DataNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('DataNode', DataNode, 'CounterSetNode', 'CounterGetNode');

export default DataNode;
