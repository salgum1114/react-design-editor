import { fabric } from 'fabric';

import { NODE_COLORS } from '../../constant/constants';
import Node from '../Node';

const LogicNode = fabric.util.createClass(Node, {
    initialize(options) {
        options = options || {};
        options.fill = NODE_COLORS.LOGIC.fill;
        options.stroke = NODE_COLORS.LOGIC.border;
        this.callSuper('initialize', options);
    },
});

LogicNode.fromObject = function (options, callback) {
    return callback(new LogicNode(options));
};

export default LogicNode;
