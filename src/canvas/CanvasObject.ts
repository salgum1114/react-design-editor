import { fabric } from 'fabric';

import { FabricObject } from './models';
import {
	Arrow,
	Chart,
	Cube,
	CurvedLink,
	Element,
	Gif,
	Iframe,
	Line,
	LineLink,
	Link,
	Node,
	OrthogonalLink,
	Video,
} from './objects';
import { Code } from './objects/Element';
import Svg, { SvgOption } from './objects/Svg';

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
	cube: {
		create: (option: any) => new Cube(option),
	},
	image: {
		create: ({ element = new Image(), ...option }) =>
			new fabric.Image(element, {
				...option,
				crossOrigin: 'anonymous',
			}),
	},
	polygon: {
		create: ({ points, ...option }: { points: any }) =>
			new fabric.Polygon(points, {
				...option,
				perPixelTargetFind: true,
			}),
	},
	line: {
		create: ({ points, ...option }: { points: any }) => new Line(points, option),
	},
	arrow: {
		create: ({ points, ...option }: { points: any }) => new Arrow(points, option),
	},
	chart: {
		create: (option: any) =>
			new Chart(
				option.chartOption || {
					xAxis: {},
					yAxis: {},
					series: [
						{
							type: 'line',
							data: [
								[0, 1],
								[1, 2],
								[2, 3],
								[3, 4],
							],
						},
					],
				},
				option,
			),
	},
	element: {
		create: ({ code, ...option }: { code: Code }) => new Element(code, option),
	},
	iframe: {
		create: ({ src, ...option }: { src: string }) => new Iframe(src, option),
	},
	video: {
		create: ({ src, file, ...option }: { src: string; file: File }) => new Video(src || file, option),
	},
	gif: {
		create: (option: any) => new Gif(option),
	},
	node: {
		create: (option: any) => new Node(option),
	},
	lineLink: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new LineLink(fromNode, fromPort, toNode, toPort, option),
	},
	link: {
		create: (fromNode, fromPort, toNode, toPort, option) => new Link(fromNode, fromPort, toNode, toPort, option),
	},
	curvedLink: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new CurvedLink(fromNode, fromPort, toNode, toPort, option),
	},
	orthogonalLink: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new OrthogonalLink(fromNode, fromPort, toNode, toPort, option),
	},
	svg: {
		create: (option: SvgOption) => new Svg(option),
	},
};

export default CanvasObject;
