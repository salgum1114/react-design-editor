import { fabric } from 'fabric';

import { NODE_COLORS } from '../../constant/constants';
import Node from '../Node';

const ActionNode = fabric.util.createClass(Node, {
    initialize(options) {
        options = options || {};
        options.fill = NODE_COLORS.ACTION.fill;
        options.stroke = NODE_COLORS.ACTION.border;
        
        this.callSuper('initialize', options);
    },
});

ActionNode.fromObject = function (options, callback) {
    return callback(new ActionNode(options));
};

export default ActionNode;
