import { Node } from '../../../../canvas/objects';
import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

type NodeOptions = Record<string, any>;

class DataNode extends Node {
	constructor(options: NodeOptions = {}) {
		const type = options.type || 'DataNode';
		super({ ...options, type, nodeClazz: options.nodeClazz || type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new DataNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('DataNode', DataNode, 'CounterSetNode', 'CounterGetNode');

if (typeof window !== 'undefined') {
	(window as any).fabric.CounterSetNode = DataNode;
	(window as any).fabric.CounterGetNode = DataNode;
}

export default DataNode;
