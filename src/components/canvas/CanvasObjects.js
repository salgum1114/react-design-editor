import { fabric } from 'fabric';

import { Arrow, Gif, Chart, Element, IFrame, Video } from './objects';

export default (mergedObjects, defaultOption) => {
    const fabricObjects = {
        group: {
            create: ({ objects, ...option }) => new fabric.Group(objects, {
                ...defaultOption,
                ...option,
            }),
        },
        'i-text': {
            create: ({ text, ...option }) => new fabric.IText(text, {
                ...defaultOption,
                ...option,
            }),
        },
        textbox: {
            create: ({ text, ...option }) => new fabric.Textbox(text, {
                ...defaultOption,
                ...option,
            }),
        },
        triangle: {
            create: option => new fabric.Triangle({
                ...defaultOption,
                ...option,
            }),
        },
        circle: {
            create: option => new fabric.Circle({
                ...defaultOption,
                ...option,
            }),
        },
        rect: {
            create: option => new fabric.Rect({
                ...defaultOption,
                ...option,
            }),
        },
        image: {
            create: ({ element = new Image(), ...option }) => new fabric.Image(element, {
                ...defaultOption,
                ...option,
                crossOrigin: true,
            }),
        },
        polygon: {
            create: ({ points, ...option }) => new fabric.Polygon(points, {
                ...defaultOption,
                ...option,
                perPixelTargetFind: true,
            }),
        },
        line: {
            create: ({ points, ...option }) => new fabric.Line(points, {
                ...defaultOption,
                ...option,
                points,
            }),
        },
        arrow: {
            create: ({ points, ...option }) => new Arrow(points, {
                ...defaultOption,
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
                return new Chart(chartOption, Object.assign({}, defaultOption, option));
            },
        },
        element: {
            create: ({ code, ...option }) => new Element(code, Object.assign({}, defaultOption, option)),
        },
        iframe: {
            create: ({ src, ...option }) => new IFrame(src, Object.assign({}, defaultOption, option)),
        },
        video: {
            create: ({ src, file, ...option }) => new Video(src || file, Object.assign({}, defaultOption, option)),
        },
        gif: {
            create: (option) => new Gif({
                ...defaultOption,
                ...option,
            }),
        },
    };
    if (mergedObjects) {
        Object.assign(fabricObjects, mergedObjects);
    }
    return fabricObjects;
};
