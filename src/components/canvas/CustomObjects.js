import { fabric } from 'fabric';

const Node = fabric.util.createClass(fabric.Group, {
    type: 'node',
    initialize(options) {
        options = options || {};
        const icon = new fabric.IText('\uf3c5', {
            fontFamily: 'Font Awesome 5 Free',
            fontWeight: 900,
            fontSize: 30,
        });
        const label = new fabric.Text('Node', {
            fontSize: 30,
        });
        const rect = new fabric.Rect({
            rx: 10,
            ry: 10,
            width: 200,
            height: 60,
            fill: 'rgba(0, 0, 0, 0.3)',
        });
        const node = [rect, icon, label];
        this.callSuper('initialize', node, options);
        this.set({
            width: 200,
            height: 60,
            originX: 'left',
            originY: 'top',
            hasRotatingPoint: false,
            hasControls: false,
        });
        icon.set({
            top: icon.top + (icon.height / 2),
            left: icon.left + 5,
        });
        label.set({
            top: label.top + (label.height / 2),
            left: label.left + 40,
        });
        // this.setControlsVisibility({
        //     mt: false,
        //     mb: false,
        //     ml: false,
        //     mr: false,
        // });
    },
});

export {
    Node,
};
