import { fabric } from 'fabric';

import { Node } from '../../../../canvas/objects';

const TriggerNode = fabric.util.createClass(Node, {
	initialize(options) {
		options = options || {};
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
