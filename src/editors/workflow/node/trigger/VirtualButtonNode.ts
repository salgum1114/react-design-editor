import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

import TriggerNode from './TriggerNode';

type NodeOptions = Record<string, any>;

class VirtualButtonNode extends TriggerNode {
	static type = 'VirtualButtonNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || VirtualButtonNode.type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new VirtualButtonNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('VirtualButtonNode', VirtualButtonNode);

export default VirtualButtonNode;
