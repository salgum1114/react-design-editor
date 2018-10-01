import { fabric } from 'fabric';
import { Node } from './CustomObjects';

export default (mergeObjects) => {
    const defaultOptions = {
        fill: 'rgba(0, 0, 0, 1)',
        stroke: 'rgba(255, 255, 255, 0)',
        action: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
        },
        animation: {
            type: 'none',
        },
        userProperty: {},
        trigger: {
            enabled: false,
        },
    };
    const fabricObjects = {
        group: {
            create: ({ objects, ...option }) => new fabric.Group(objects, {
                ...defaultOptions,
                ...option,
            }),
        },
        'i-text': {
            create: ({ text, ...option }) => new fabric.IText(text, {
                ...defaultOptions,
                ...option,
            }),
        },
        textbox: {
            create: ({ text, ...option }) => new fabric.Textbox(text, {
                ...defaultOptions,
                ...option,
            }),
        },
        triangle: {
            create: option => new fabric.Triangle({
                ...defaultOptions,
                ...option,
            }),
        },
        circle: {
            create: option => new fabric.Circle({
                ...defaultOptions,
                ...option,
            }),
        },
        rect: {
            create: option => new fabric.Rect({
                ...defaultOptions,
                ...option,
            }),
        },
        image: {
            create: ({ imgElement, ...option }) => new fabric.Image(imgElement, {
                ...defaultOptions,
                ...option,
            }),
        },
        video: {
            create: ({ videoElement, ...option }) => new fabric.Image(videoElement, {
                ...defaultOptions,
                ...option,
            }),
        },
        polygon: {
            create: ({ points, ...option }) => new fabric.Polygon(points, {
                ...defaultOptions,
                ...option,
            }),
        },
        line: {
            create: ({ points, ...option }) => new fabric.Line(points, {
                ...defaultOptions,
                ...option,
            }),
        },
        node: {
            create: option => new Node({
                ...defaultOptions,
                ...option,
            }),
        },
    };
    if (mergeObjects) {
        Object.assign(fabricObjects, defaultOptions, mergeObjects);
    }
    return fabricObjects;
};
