import { fabric } from 'fabric';

import LogicNode from './LogicNode';

const FilterNode = fabric.util.createClass(LogicNode, {
    initialize(options) {
        options = options || {};
        this.callSuper('initialize', options);
    },
    createFromPort(left, top) {
        this.fromPort = this.descriptor.outPorts.map((outPort, i) => {
            return new fabric.Rect({
                id: outPort,
                type: 'fromPort',
                left: i === 0 ? left - 20 : left + 20,
                top,
                leftDiff: i === 0 ? -20 : 20,
                ...this.fromPortOption(),
                fill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
                originFill: i === 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
                hoverFill: i === 0 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)',
            });
        });
        return this.fromPort;
    },
});

FilterNode.fromObject = function (options, callback) {
    return callback(new FilterNode(options));
};

export default FilterNode;
