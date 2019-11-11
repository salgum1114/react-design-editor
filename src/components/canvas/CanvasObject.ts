import { fabric } from 'fabric';

import {
    Arrow,
    Gif,
    Chart,
    Element,
    IFrame,
    Video,
    Node,
    Link,
    CurvedLink,
    OrthogonalLink,
} from './objects';
import { FabricObject } from './utils';
import { Code } from './objects/Element';

export interface ObjectSchema {
    create: (...option: any) => fabric.Object;
}

export interface CanvasObjectSchema {
    [key: string]: ObjectSchema;
}

export const createCanvasObject = (objectSchema: CanvasObjectSchema) => objectSchema;

const CanvasObject: CanvasObjectSchema = {
    group: {
        create: ({ objects, ...option }: { objects: FabricObject[] }) => new fabric.Group(objects, option),
    },
    'i-text': {
        create: ({ text, ...option }: { text: string }) => new fabric.IText(text, option),
    },
    textbox: {
        create: ({ text, ...option }: { text: string }) => new fabric.Textbox(text, option),
    },
    triangle: {
        create: (option: any) => new fabric.Triangle(option),
    },
    circle: {
        create: (option: any) => new fabric.Circle(option),
    },
    rect: {
        create: (option: any) => new fabric.Rect(option),
    },
    image: {
        create: ({ element = new Image(), ...option }) => new fabric.Image(element, {
            ...option,
            crossOrigin: 'anonymous',
        }),
    },
    polygon: {
        create: ({ points, ...option }: { points: any }) => new fabric.Polygon(points, {
            ...option,
            perPixelTargetFind: true,
        }),
    },
    line: {
        create: ({ points, ...option }: { points: any }) => new fabric.Line(points, option),
    },
    arrow: {
        create: ({ points, ...option }: { points: any }) => new Arrow(points, option),
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
            return new Chart(chartOption, option);
        },
    },
    element: {
        create: ({ code, ...option }: { code: Code }) => new Element(code, option),
    },
    iframe: {
        create: ({ src, ...option }: { src: string }) => new IFrame(src, option),
    },
    video: {
        create: ({ src, file, ...option }: { src: string, file: File }) => new Video(src || file, option),
    },
    gif: {
        create: (option: any) => new Gif(option),
    },
    node: {
        create: (option: any) => new Node(option),
    },
    link: {
        create: (fromNode, fromPort, toNode, toPort, option) => new Link(fromNode, fromPort, toNode, toPort, option),
    },
    curvedLink: {
        create: (fromNode, fromPort, toNode, toPort, option) => new CurvedLink(fromNode, fromPort, toNode, toPort, option),
    },
    orthogonalLink: {
        create: (fromNode, fromPort, toNode, toPort, option) => new OrthogonalLink(fromNode, fromPort, toNode, toPort, option),
    },
};

export default CanvasObject;
