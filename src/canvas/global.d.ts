type FabricModule = typeof import('fabric/es');

declare module '*.css';
declare module 'i18next-browser-languagedetector';

interface ImportMetaEnv {
	readonly PROD: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace fabric {
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

	interface IObjectOptions extends Partial<import('fabric/es').TFabricObjectProps> {
		[key: string]: any;
	}

	type ActiveSelection = import('fabric/es').ActiveSelection;
	type Canvas = import('fabric/es').Canvas;
	type Circle = import('fabric/es').Circle;
	type Gradient = import('fabric/es').Gradient;
	type Group = import('fabric/es').Group;
	type IBaseFilter = any;
	type IEvent = any;
	type IImageOptions = import('fabric/es').ImageProps & Record<string, any>;
	type IPathOptions = import('fabric/es').PathProps & Record<string, any>;
	type IShadowOptions = import('fabric/es').SerializedShadowOptions & Record<string, any>;
	type IText = import('fabric/es').IText;
	type IUtil = FabricModule['util'];
	type Image = import('fabric/es').FabricImage;
	type Line = import('fabric/es').Line;
	type Object = import('fabric/es').FabricObject;
	type Path = import('fabric/es').Path;
	type Pattern = import('fabric/es').Pattern;
	type Point = import('fabric/es').Point;
	type Polygon = import('fabric/es').Polygon;
	type Rect = import('fabric/es').Rect;
	type Shadow = import('fabric/es').Shadow;
	type Text = import('fabric/es').FabricText;
	type Textbox = import('fabric/es').Textbox;
	type Triangle = import('fabric/es').Triangle;

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
}

declare var fabric: any;

interface Window {
	fabric: any;
	gifler: any;
	adsbygoogle: any;
}

declare module 'fabric' {
	export * from 'fabric/es';

	export namespace fabric {
		export const ActiveSelection: any;
		export const Canvas: any;
		export const Circle: any;
		export const Gradient: any;
		export const Group: any;
		export const Image: any;
		export const IText: any;
		export const Line: any;
		export const Object: any;
		export const Path: any;
		export const Pattern: any;
		export const Point: any;
		export const Polygon: any;
		export const Rect: any;
		export const Shadow: any;
		export const Text: any;
		export const Textbox: any;
		export const Triangle: any;
		export const loadSVGFromString: any;
		export const loadSVGFromURL: any;
		export const util: any;

		export interface ICanvasOptions extends globalThis.fabric.ICanvasOptions {}
		export interface IObjectOptions extends globalThis.fabric.IObjectOptions {}
		export type ActiveSelection = globalThis.fabric.ActiveSelection;
		export type Canvas = globalThis.fabric.Canvas;
		export type Circle = globalThis.fabric.Circle;
		export type Gradient = globalThis.fabric.Gradient;
		export type Group = globalThis.fabric.Group;
		export type IBaseFilter = globalThis.fabric.IBaseFilter;
		export type IEvent = globalThis.fabric.IEvent;
		export type IImageOptions = globalThis.fabric.IImageOptions;
		export type IPathOptions = globalThis.fabric.IPathOptions;
		export type IShadowOptions = globalThis.fabric.IShadowOptions;
		export type IText = globalThis.fabric.IText;
		export type IUtil = globalThis.fabric.IUtil;
		export type Image = globalThis.fabric.Image;
		export type Line = globalThis.fabric.Line;
		export type Object = globalThis.fabric.Object;
		export type Path = globalThis.fabric.Path;
		export type Pattern = globalThis.fabric.Pattern;
		export type Point = globalThis.fabric.Point;
		export type Polygon = globalThis.fabric.Polygon;
		export type Rect = globalThis.fabric.Rect;
		export type Shadow = globalThis.fabric.Shadow;
		export type Text = globalThis.fabric.Text;
		export type Textbox = globalThis.fabric.Textbox;
		export type Triangle = globalThis.fabric.Triangle;
		export class Gif extends globalThis.fabric.Gif {}
		export class Arrow extends globalThis.fabric.Arrow {}
		export class Iframe extends globalThis.fabric.Iframe {}
		export class Chart extends globalThis.fabric.Chart {}
		export class Element extends globalThis.fabric.Element {}
		export class Video extends globalThis.fabric.Video {}
		export class Node extends globalThis.fabric.Node {}
		export class Link extends globalThis.fabric.Link {}
		export class CurvedLink extends globalThis.fabric.CurvedLink {}
		export class OrthogonalLink extends globalThis.fabric.OrthogonalLink {}
		export class Cube extends globalThis.fabric.Cube {}
		export class Svg extends globalThis.fabric.Svg {}
	}

	export const fabric: FabricModule;
}

declare class MediaElementPlayer {
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
