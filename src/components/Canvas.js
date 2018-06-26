import React, { Component } from 'react';
import difference from 'lodash/difference';
import { fabric } from 'fabric';

import { FlexBox } from './flex';


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

class Canvas extends Component {
    componentDidMount() {
        console.log(this.container);
        console.log(this.container.clientWidth, this.container.clientHeight);
        this.canvas = new fabric.Canvas('c', {
            preserveObjectStacking: true,
            width: this.container.clientWidth,
            height: this.container.clientHeight,
            backgroundColor: '#f3f3f3',
        });
        const circle = new fabric.Circle({
            radius: 20, fill: 'gree', left: 100, top: 100,
        });
        const triangle = new fabric.Triangle({
            width: 20, height: 30, fill: 'blue', left: 50, top: 50,
        });
        this.canvas.add(circle, triangle);
    }

    componentWillReceiveProps(nextProps) {
        const prevKeys = Object.keys(this.props.items);
        const nextKeys = Object.keys(nextProps.items);
        const differenceKeys = difference(nextKeys, prevKeys);
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
                ref={(c) => { this.container = c; }}
                className="rde-canvas"
            >
                <canvas id="c" />
            </div>
        );
    }
}

export default Canvas;
