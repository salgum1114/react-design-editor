import 'fabric';

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

	interface Window {
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
