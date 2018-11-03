import { fabric } from 'fabric';

import TriggerNode from './TriggerNode';

const VirtualButtonNode = fabric.util.createClass(TriggerNode, {
    initialize(options) {
        options = options || {};
        this.callSuper('initialize', options);
        // this._objects[1].set({
        //     visible: false,
        // });
        // this.iconButton = new fabric.IText(options.icon || '\uE174', {
        //     fontFamily: 'polestar',
        //     fontWeight: 900,
        //     fontSize: 30,
        // });
        // this.iconButton.set({
        //     left: this.left + 5,
        //     top: this.top + 5,
        //     editable: false,
        //     originX: 'left',
        //     originY: 'top',
        //     hasBorders: false,
        //     selectable: false,
        //     hasRotatingPoint: false,
        //     hasControls: false,
        //     hoverCursor: 'pointer',
        // });
        // console.log(this.left, this.top);
        // console.log(this.iconButton.left, this.iconButton.top);
        // this.iconButton.on('mousedown', this.virtualTrigger);
    },
    // virtualTrigger(opt) {
    //     console.log(opt);
    // },
});

VirtualButtonNode.fromObject = function (options, callback) {
    return callback(new VirtualButtonNode(options));
};

export default VirtualButtonNode;
