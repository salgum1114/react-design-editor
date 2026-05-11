import 'fabric';

type FabricModule = typeof import('fabric');

declare module 'fabric' {
	interface FabricObjectProps {
		id?: string;
		parentId?: string;
		originOpacity?: number;
		originTop?: number;
		originLeft?: number;
		originScaleX?: number;
		originScaleY?: number;
		originAngle?: number;
		originFill?: string | import('fabric').Pattern | import('fabric').Gradient;
		originStroke?: string;
		originRotation?: number;
		editable?: boolean;
		superType?: string;
		description?: string;
		animation?: any;
		anime?: any;
		tooltip?: any;
		link?: any;
		animating?: boolean;
		class?: string;
		deletable?: boolean;
		dblclick?: boolean;
		cloneable?: boolean;
		locked?: boolean;
		rotation?: number;
		clickable?: boolean;
		name?: string;
		icon?: string;
		color?: string;
		configuration?: any;
		nodeClazz?: string;
		descriptor?: any;
		fromNode?: any;
		toNode?: any;
		fromPort?: any;
		toPort?: any;
		fromNodeId?: string;
		toNodeId?: string;
		fromPortIndex?: number;
		enabled?: boolean;
		nodeId?: string;
		label?: string;
		fontSize?: number;
		fontFamily?: string;
		connected?: boolean;
		connectedFill?: string;
		file?: File | null;
		src?: string | null;
		code?: any;
		chartOption?: any;
		container?: string;
		autoplay?: boolean;
		muted?: boolean;
		loop?: boolean;
		errors?: any[];
		onlyLeft?: boolean;
		[key: string]: any;
	}

	interface SerializedObjectProps {
		id?: string;
		parentId?: string;
		editable?: boolean;
		superType?: string;
		description?: string;
		animation?: any;
		tooltip?: any;
		link?: any;
		class?: string;
		deletable?: boolean;
		dblclick?: boolean;
		cloneable?: boolean;
		locked?: boolean;
		rotation?: number;
		clickable?: boolean;
		name?: string;
		icon?: string;
		color?: string;
		configuration?: any;
		nodeClazz?: string;
		descriptor?: any;
		fromNode?: any;
		toNode?: any;
		fromPort?: any;
		toPort?: any;
		enabled?: boolean;
		nodeId?: string;
		label?: string;
		fontSize?: number;
		fontFamily?: string;
		connected?: boolean;
		file?: File | null;
		src?: string | null;
		code?: any;
		chartOption?: any;
		container?: string;
		autoplay?: boolean;
		muted?: boolean;
		loop?: boolean;
		errors?: any[];
		[key: string]: any;
	}

	interface IEvent<E extends Event = TPointerEvent> extends TEvent<E> {
		target?: FabricObject;
		transform?: Transform;
		[key: string]: any;
	}

	interface IShadowOptions extends SerializedShadowOptions {
		[key: string]: any;
	}

	interface IImageOptions extends Partial<ImageProps> {
		[key: string]: any;
	}

	interface IBaseFilter extends BaseFilter<string, Record<string, any>> {}
}

declare module '*.css';
declare module 'i18next-browser-languagedetector';

declare global {
	interface ImportMetaEnv {
		readonly PROD: boolean;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}

	namespace fabric {
		const ActiveSelection: any;
		const Canvas: any;
		const Circle: any;
		const Gradient: any;
		const Group: any;
		const Image: any;
		const IText: any;
		const Line: any;
		const Object: any;
		const Path: any;
		const Pattern: any;
		const Point: any;
		const Polygon: any;
		const Rect: any;
		const Shadow: any;
		const Text: any;
		const Textbox: any;
		const Triangle: any;
		const loadSVGFromString: any;
		const loadSVGFromURL: any;
		const util: FabricModule['util'];

		interface ICanvasOptions {
			backgroundColor?: any;
			defaultCursor?: string;
			height?: number;
			hoverCursor?: string;
			preserveObjectStacking?: boolean;
			selection?: boolean;
			width?: number;
			[key: string]: any;
		}

		interface IObjectOptions extends Partial<import('fabric').TFabricObjectProps> {
			[key: string]: any;
		}

		type ActiveSelection = import('fabric').ActiveSelection;
		type Canvas = import('fabric').Canvas;
		type Circle = import('fabric').Circle;
		type Gradient = import('fabric').Gradient;
		type Group = import('fabric').Group;
		type IBaseFilter = any;
		type IEvent = any;
		type IImageOptions = import('fabric').ImageProps & Record<string, any>;
		type IPathOptions = import('fabric').PathProps & Record<string, any>;
		type IShadowOptions = import('fabric').SerializedShadowOptions & Record<string, any>;
		type IText = import('fabric').IText;
		type IUtil = FabricModule['util'];
		type Image = import('fabric').FabricImage;
		type Line = import('fabric').Line;
		type Object = import('fabric').FabricObject;
		type Path = import('fabric').Path;
		type Pattern = import('fabric').Pattern;
		type Point = import('fabric').Point;
		type Polygon = import('fabric').Polygon;
		type Rect = import('fabric').Rect;
		type Shadow = import('fabric').Shadow;
		type Text = import('fabric').FabricText;
		type Textbox = import('fabric').Textbox;
		type Triangle = import('fabric').Triangle;

		class Gif {}
		class Arrow {}
		class Iframe {}
		class Chart {}
		class Element {}
		class Video {}
		class Node {}
		class Link {}
		class CurvedLink {}
		class OrthogonalLink {}
		class Cube {}
		class Svg {}
		class Spinner {}
	}

	var fabric: any;

	interface Window {
		fabric: any;
		gifler: any;
		adsbygoogle: any;
	}

	class MediaElementPlayer {
		constructor(
			id: string,
			options: {
				pauseOtherPlayers: boolean;
				videoWidth: string;
				videoHeight: string;
				success: (mediaeElement: any, originalNode: any, instance: any) => void;
			},
		);
	}
}

export {};
