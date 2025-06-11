import { fabric } from 'fabric';

import { Node } from '../../../../canvas/objects';

const DataNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
	},
});

DataNode.fromObject = function (options, callback) {
	return callback(new DataNode(options));
};

window.fabric.DataNode = DataNode;

window.fabric.CounterSetNode = DataNode;

window.fabric.CounterGetNode = DataNode;

export default DataNode;
