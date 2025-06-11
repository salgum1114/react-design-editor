import { CanvasOption, FabricObjectOption, GridOption, WorkareaObject } from '../models';

export const canvasOption: CanvasOption = {
	preserveObjectStacking: true,
	width: 300,
	height: 150,
	selection: true,
	defaultCursor: 'default',
	backgroundColor: '#f3f3f3',
};

export const keyEvent = {
	move: true,
	all: true,
	copy: true,
	paste: true,
	esc: true,
	del: true,
	clipboard: false,
	transaction: true,
	zoom: true,
	cut: true,
	grab: true,
};

export const gridOption: GridOption = {
	type: 'line',
	enabled: false,
	grid: 10,
	snapToGrid: false,
	lineColor: '#ebebeb',
	borderColor: '#cccccc',
};

export const workareaOption: Partial<WorkareaObject> = {
	width: 600,
	height: 400,
	workareaWidth: 600,
	workareaHeight: 400,
	lockScalingX: true,
	lockScalingY: true,
	scaleX: 1,
	scaleY: 1,
	backgroundColor: '#fff',
	hasBorders: false,
	hasControls: false,
	selectable: false,
	lockMovementX: true,
	lockMovementY: true,
	hoverCursor: 'default',
	name: '',
	id: 'workarea',
	type: 'image',
	layout: 'fixed', // fixed, responsive, fullscreen
	link: {},
	tooltip: {
		enabled: false,
	},
	isElement: false,
};

export const objectOption: Partial<FabricObjectOption> = {
	rotation: 0,
	centeredRotation: true,
	strokeUniform: true,
};

export const guidelineOption = {
	enabled: true,
};

export const activeSelectionOption = {
	hasControls: true,
};

export const propertiesToInclude = ['id', 'name', 'locked', 'editable'];
