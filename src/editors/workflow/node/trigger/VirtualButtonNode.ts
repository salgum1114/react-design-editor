import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';

import TriggerNode from './TriggerNode';

type NodeOptions = Record<string, any>;

class VirtualButtonNode extends TriggerNode {
	constructor(options: NodeOptions = {}) {
		const type = options.type || 'VirtualButtonNode';
		super({ ...options, type, nodeClazz: options.nodeClazz || type });
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new VirtualButtonNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('VirtualButtonNode', VirtualButtonNode);

export default VirtualButtonNode;
