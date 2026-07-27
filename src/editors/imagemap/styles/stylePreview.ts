import type { Canvas, FabricObject } from 'fabric';

type PreviewHandler = {
	add: (...args: any[]) => FabricObject;
	setById: (id: string, key: string, value: any) => void;
};

const previewOption = {
	type: 'i-text',
	text: '\uf3c5',
	fontFamily: 'Font Awesome 5 Free',
	fontWeight: 900,
	fontSize: 60,
	width: 30,
	height: 30,
	editable: false,
	name: 'New marker',
	tooltip: {
		enabled: false,
	},
	id: 'styles',
};

export function initializeStylePreview(
	handler: PreviewHandler,
	canvas: Pick<Canvas, 'centerObject' | 'requestRenderAll'>,
	style: Record<string, any>,
) {
	const preview = handler.add(previewOption as any, false, false, false, false);
	canvas.centerObject(preview);
	preview.setCoords();

	Object.entries(style).forEach(([key, value]) => {
		handler.setById('styles', key, value);
	});

	canvas.requestRenderAll();
}
