import { fabric } from 'fabric';

import Node, { NODE_COLORS } from '../Node';

const DataNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		options.fill = NODE_COLORS.DATA.fill;
		options.stroke = NODE_COLORS.DATA.border;
		this.callSuper('initialize', options);
	},
});

DataNode.fromObject = function(options, callback) {
	return callback(new DataNode(options));
};

window.fabric.DataNode = DataNode;

window.fabric.CounterSetNode = DataNode;

window.fabric.CounterGetNode = DataNode;

export default DataNode;
