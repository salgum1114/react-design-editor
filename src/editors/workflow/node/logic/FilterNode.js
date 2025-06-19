import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import LogicNode from './LogicNode';

const FilterNode = fabric.util.createClass(LogicNode, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
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
