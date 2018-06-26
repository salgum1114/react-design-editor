import React, { Component } from 'react';
import difference from 'lodash/difference';
import { fabric } from 'fabric';

import { FlexBox, FlexItem } from './flex';


const MARKER = {
    default: {
        item: new fabric.IText('\uf041', {
            color: 'black',
            fontSize: 60,
            fontFamily: 'FontAwesome',
        }),
    },
};

const TEXT = {
    
};

const IMAGE = {
    
};

const DRAWING = {
    triangle: {
        item: new fabric.Triangle({
            width: 30,
            height: 30,
        }),
    },
    circle: {
        item: new fabric.Circle({
            radius: 40,
        }),
    },
    rect: {
        item: new fabric.Rect({
            width: 40,
            height: 40,
        }),
    },
};

const ITEM_TEMPLATE = {
    MARKER,
    TEXT,
    IMAGE,
    DRAWING,
};

const topToolbarHeight = 40;
const bottomToolbarHeight = 60;

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }
    
    componentDidMount() {
        setTimeout(() => {
            this.canvas = new fabric.Canvas('c', {
                preserveObjectStacking: true,
                width: this.container.current.clientWidth,
                height: this.container.current.clientHeight - topToolbarHeight - bottomToolbarHeight,
                backgroundColor: '#f3f3f3',
            });
            const circle = new fabric.Circle({
                radius: 20, fill: 'gree', left: 100, top: 100,
            });
            const triangle = new fabric.Triangle({
                width: 20, height: 30, fill: 'blue', left: 50, top: 50,
            });
            this.canvas.add(circle, triangle);
            console.log(this.container.current);
            console.log(this.container.current.clientWidth, this.container.current.clientHeight);
        }, 500);
    }

    componentWillReceiveProps(nextProps) {
        const prevKeys = Object.keys(this.props.items);
        const nextKeys = Object.keys(nextProps.items);
        const differenceKeys = difference(nextKeys, prevKeys);
        console.log(this.container.current.getBoundingClientRect());
        if (differenceKeys.length) {
            const { add } = this.handlers;
            const key = differenceKeys[0];
            add(key, nextProps.items[key]);
        }
    }

    handlers = {
        add: (key, item) => {
            const newItem = ITEM_TEMPLATE[item.type][item.key].item;
            this.canvas.add(newItem);
            console.log(key, item);
        },
        delete: (key) => {

        },
        duplicate: (key) => {

        },
    }

    render() {
        return (
            <div
                style={{ height: '100%' }}
                ref={this.container} 
            >
                <FlexBox style={{ height: '100%' }} flexWrap="wrap" flexDirection="column">
                    <FlexItem flex="0">
                        <div style={{ height: topToolbarHeight }}>top toolbar</div>
                    </FlexItem>
                    <FlexItem flex="1 auto">
                        <canvas id="c" />
                    </FlexItem>
                    <FlexItem flex="0">
                        <div style={{ height: bottomToolbarHeight }}>bottom toolbar</div>
                    </FlexItem>
                </FlexBox>
            </div>
        );
    }
}

export default Canvas;
