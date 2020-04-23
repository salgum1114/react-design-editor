import { fabric } from 'fabric';

import Node, { NODE_COLORS } from '../Node';

const TriggerNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
		options.fill = NODE_COLORS.TRIGGER.fill;
		options.stroke = NODE_COLORS.TRIGGER.border;
		this.callSuper('initialize', options);
	},
	_render(ctx) {
		this.callSuper('_render', ctx);
	},
});

TriggerNode.fromObject = (options, callback) => {
	return callback(new TriggerNode(options));
};

window.fabric.TimerNode = TriggerNode;

window.fabric.TriggerNode = TriggerNode;

export default TriggerNode;
