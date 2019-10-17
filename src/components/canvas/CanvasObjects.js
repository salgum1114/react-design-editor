import { fabric } from 'fabric';

import { Arrow, Gif, Chart, Element, IFrame, Video } from './objects';

export default (mergedObjects, defaultOptions) => {
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
            create: ({ element = new Image(), ...option }) => new fabric.Image(element, {
                ...defaultOptions,
                ...option,
                crossOrigin: true,
            }),
        },
        polygon: {
            create: ({ points, ...option }) => new fabric.Polygon(points, {
                ...defaultOptions,
                ...option,
                perPixelTargetFind: true,
            }),
        },
        line: {
            create: ({ points, ...option }) => new fabric.Line(points, {
                ...defaultOptions,
                ...option,
                points,
            }),
        },
        arrow: {
            create: ({ points, ...option }) => new Arrow(points, {
                ...defaultOptions,
                ...option,
                points,
            }),
        },
        chart: {
            create: ({ chartOption = {
                xAxis: {},
                yAxis: {},
                series: [
                    {
                        type: 'line',
                        data: [
                            [1, 2],
                            [2, 3],
                        ],
                    },
                ],
            }, ...option }) => {
                return new Chart(chartOption, Object.assign({}, defaultOptions, option));
            },
        },
        element: {
            create: ({ code, ...option }) => new Element(code, Object.assign({}, defaultOptions, option)),
        },
        iframe: {
            create: ({ src, ...option }) => new IFrame(src, Object.assign({}, defaultOptions, option)),
        },
        video: {
            create: ({ src, file, ...option }) => new Video(src || file, Object.assign({}, defaultOptions, option)),
        },
        gif: {
            create: (option) => new Gif({
                ...defaultOptions,
                ...option,
            }),
        },
    };
    if (mergedObjects) {
        Object.assign(fabricObjects, mergedObjects);
    }
    return fabricObjects;
};
