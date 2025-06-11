import { fabric } from 'fabric';

import { Node } from '../../../../canvas/objects';

const ActionNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		this.callSuper('initialize', options);
	},
});

ActionNode.fromObject = function (options, callback) {
	return callback(new ActionNode(options));
};

window.fabric.ActionNode = ActionNode;

window.fabric.DebugNode = ActionNode;

window.fabric.EmailNode = ActionNode;

export default ActionNode;
