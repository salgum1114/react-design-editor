import { fabric } from 'fabric';

import { Node } from '../../../../canvas/objects';

const LogicNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
	},
});

LogicNode.fromObject = function (options, callback) {
	return callback(new LogicNode(options));
};

window.fabric.LogicNode = LogicNode;

window.fabric.DelayNode = LogicNode;

window.fabric.FunctionNode = LogicNode;

window.fabric.BroadcastNode = LogicNode;

export default LogicNode;
