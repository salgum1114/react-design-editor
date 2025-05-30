import { fabric } from 'fabric';

import { Node } from '../../../../canvas/objects';
import { NODE_COLORS } from '../../constant/constants';

const LogicNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		options.fill = NODE_COLORS.LOGIC.fill;
		options.stroke = NODE_COLORS.LOGIC.border;
		this.callSuper('initialize', options);
	},
});

LogicNode.fromObject = function(options, callback) {
	return callback(new LogicNode(options));
};

window.fabric.LogicNode = LogicNode;

window.fabric.DelayNode = LogicNode;

window.fabric.FunctionNode = LogicNode;

window.fabric.BroadcastNode = LogicNode;

export default LogicNode;
