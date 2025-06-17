import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { Port } from '../../../../canvas/objects';
import LogicNode from './LogicNode';

const FilterNode = fabric.util.createClass(LogicNode, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
	},
	createFromPort(left, top) {
		this.fromPort = this.descriptor.outPorts.map((outPort, i) => {
			const fill = i === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)';
			return new Port({
				id: outPort,
				type: 'fromPort',
				left: i === 0 ? left - 40 : left + 40,
				top,
				leftDiff: i === 0 ? -40 : 40,
				...this.fromPortOption(),
				fill,
				originFill: fill,
				hoverFill: fill,
				selectFill: fill,
				label: outPort,
				color: fill,
				fontSize: 14,
				fontFamily: 'Noto Sans',
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

FilterNode.fromObject = function (options, callback) {
	return callback(new FilterNode(options));
};

window.fabric.FilterNode = FilterNode;

export default FilterNode;
