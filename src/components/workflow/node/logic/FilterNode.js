import { fabric } from 'fabric';
import uuid from 'uuid/v4';

import LogicNode from './LogicNode';
import { Port } from '../../../canvas/objects';

const FilterNode = fabric.util.createClass(LogicNode, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
	},
	createFromPort(left, top) {
		this.fromPort = this.descriptor.outPorts.map((outPort, i) => {
			return new Port({
				id: outPort,
				type: 'fromPort',
				left: i === 0 ? left - 20 : left + 20,
				top,
				leftDiff: i === 0 ? -20 : 20,
				...this.fromPortOption(),
				fill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
				originFill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
				hoverFill: i === 0 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)',
			});
		});
		return this.fromPort;
	},
	duplicate() {
		const options = this.toObject();
		options.id = uuid();
		options.name = `${options.name}_clone`;
		const clonedObj = new FilterNode(options);
		return clonedObj;
	},
});

FilterNode.fromObject = function(options, callback) {
	return callback(new FilterNode(options));
};

window.fabric.FilterNode = FilterNode;

export default FilterNode;
