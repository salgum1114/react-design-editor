import { v4 as uuid } from 'uuid';

import { registerFabricClass, resolveFromObject } from '../../../../canvas/utils';
import LogicNode from './LogicNode';

type NodeOptions = Record<string, any>;

class FilterNode extends LogicNode {
	static type = 'FilterNode';

	constructor(options: NodeOptions = {}) {
		super({ ...options, nodeClazz: options.nodeClazz || FilterNode.type });
	}

	duplicate(): any {
		const options = this.toObject() as NodeOptions;
		options.id = uuid();
		options.name = `${options.name}_clone`;
		return new FilterNode(options);
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new FilterNode(options), callback as any) as Promise<any>;
	}
}

registerFabricClass('FilterNode', FilterNode);

export default FilterNode;
