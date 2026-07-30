export type EditorTheme = 'light' | 'dark';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface EditorThemePalette {
	accent: string;
	appBackground: string;
	border: string;
	canvas: string;
	error: string;
	gridDot: string;
	info: string;
	mutedText: string;
	panel: string;
	primary: string;
	primaryText: string;
	secondaryPanel: string;
	selection: string;
	softAccent: string;
	subtleText: string;
	warning: string;
	workflowActionButton: string;
	workflowLink: string;
	workflowNode: string;
	workflowNodeBorder: string;
	workflowNodeText: string;
	workflowPort: string;
	workflowRoute: string;
}

export interface EditorCanvasTheme {
	backgroundColor: string;
	dotColor: string;
	rulerBackgroundColor: string;
	rulerLineColor: string;
	rulerTextColor: string;
	selectionColor: string;
}

export interface WorkflowCanvasTheme {
	actionButtonColor: string;
	actionButtonIconColor: string;
	linkColor: string;
	nodeFill: string;
	nodeStroke: string;
	nodeTextColor: string;
	portFill: string;
	routeFill: string;
	routeStroke: string;
	routeTextColor: string;
	selectionBorderColor: string;
}

export const EDITOR_THEME_STORAGE_KEY = 'react-design-editor-theme';

export const editorThemePalettes: Record<EditorTheme, EditorThemePalette> = {
	light: {
		accent: '#2BC9A5',
		appBackground: '#F4F7FA',
		border: '#D7E0E7',
		canvas: '#EEF3F7',
		error: '#D95252',
		gridDot: '#C9D4DE',
		info: '#3D73D9',
		mutedText: '#64748B',
		panel: '#FFFFFF',
		primary: '#0F8F77',
		primaryText: '#172A2D',
		secondaryPanel: '#F7FAFC',
		selection: 'rgba(15, 143, 119, 0.2)',
		softAccent: '#DDF7EF',
		subtleText: '#8A99A6',
		warning: '#C98724',
		workflowActionButton: '#E8F0F4',
		workflowLink: '#8A99A6',
		workflowNode: '#FFFFFF',
		workflowNodeBorder: '#D7E0E7',
		workflowNodeText: '#172A2D',
		workflowPort: '#8A99A6',
		workflowRoute: '#F7FAFC',
	},
	dark: {
		accent: '#5EE0BD',
		appBackground: '#0D1413',
		border: '#34413E',
		canvas: '#1C2128',
		error: '#EF6A5B',
		gridDot: '#5F646B',
		info: '#4E82F1',
		mutedText: '#91A09A',
		panel: '#111918',
		primary: '#32C9A3',
		primaryText: '#EDF4F1',
		secondaryPanel: '#151E1C',
		selection: 'rgba(94, 224, 189, 0.2)',
		softAccent: 'rgba(94, 224, 189, 0.14)',
		subtleText: '#64716C',
		warning: '#F0AC4C',
		workflowActionButton: '#5F646B',
		workflowLink: '#C3C9D5',
		workflowNode: '#20262E',
		workflowNodeBorder: '#5F646B',
		workflowNodeText: '#FFFFFF',
		workflowPort: '#5F646B',
		workflowRoute: '#272E38',
	},
};

export const getEditorCanvasTheme = (theme: EditorTheme): EditorCanvasTheme => {
	const palette = editorThemePalettes[theme];
	return {
		backgroundColor: palette.canvas,
		dotColor: palette.gridDot,
		rulerBackgroundColor: palette.panel,
		rulerLineColor: palette.border,
		rulerTextColor: palette.mutedText,
		selectionColor: palette.selection,
	};
};

export const getWorkflowCanvasTheme = (theme: EditorTheme): WorkflowCanvasTheme => {
	const palette = editorThemePalettes[theme];
	return {
		actionButtonColor: palette.workflowActionButton,
		actionButtonIconColor: palette.primary,
		linkColor: palette.workflowLink,
		nodeFill: palette.workflowNode,
		nodeStroke: palette.workflowNodeBorder,
		nodeTextColor: palette.workflowNodeText,
		portFill: palette.workflowPort,
		routeFill: palette.workflowRoute,
		routeStroke: palette.workflowNodeBorder,
		routeTextColor: palette.workflowNodeText,
		selectionBorderColor: palette.info,
	};
};

type ThemeableCanvasObject = Record<string, any> & {
	getObjects?: () => ThemeableCanvasObject[];
	set?: (values: Record<string, any>) => void;
	setColor?: (color: string) => void;
};

const setThemeValues = (target: ThemeableCanvasObject | undefined, values: Record<string, any>) => {
	target?.set?.(values);
};

const applyPortTheme = (
	port: ThemeableCanvasObject | undefined,
	portFill: string,
	nodeColor?: string,
) => {
	if (!port) {
		return;
	}
	const connectedFill = nodeColor || port.connectedFill || portFill;
	const currentFill = port.connected ? connectedFill : portFill;
	setThemeValues(port, {
		connectedFill,
		fill: currentFill,
		originFill: portFill,
		stroke: currentFill,
	});
};

export const applyWorkflowCanvasTheme = (
	objects: ThemeableCanvasObject[],
	theme: EditorTheme,
): void => {
	const palette = editorThemePalettes[theme];
	const canvasTheme = getWorkflowCanvasTheme(theme);

	objects.forEach(object => {
		if (object.superType === 'link') {
			object.setColor?.(canvasTheme.linkColor);
			setThemeValues(object, {
				originStroke: canvasTheme.linkColor,
				stroke: canvasTheme.linkColor,
			});
			return;
		}
		if (object.superType !== 'node') {
			return;
		}

		setThemeValues(object, {
			actionButtonColor: canvasTheme.actionButtonColor,
			actionButtonIconColor: canvasTheme.actionButtonIconColor,
			fill: canvasTheme.nodeFill,
			labelColor: canvasTheme.nodeTextColor,
			originStroke: canvasTheme.nodeStroke,
			portFill: canvasTheme.portFill,
			routeFill: canvasTheme.routeFill,
			routeStroke: canvasTheme.routeStroke,
			routeTextColor: canvasTheme.routeTextColor,
			stroke: canvasTheme.nodeStroke,
		});
		setThemeValues(object.rect, {
			fill: canvasTheme.nodeFill,
			stroke: object.errors ? palette.error : canvasTheme.nodeStroke,
		});
		setThemeValues(object.label, { fill: canvasTheme.nodeTextColor });

		const buttonObjects = object.button?.getObjects?.() || [];
		setThemeValues(buttonObjects[0], { fill: canvasTheme.actionButtonColor });
		setThemeValues(buttonObjects[1], { fill: canvasTheme.actionButtonIconColor });

		(object.ports || []).forEach((route: ThemeableCanvasObject) => {
			const routeObjects = route.getObjects?.() || [];
			setThemeValues(route, { fill: canvasTheme.routeFill });
			setThemeValues(routeObjects[0], {
				fill: canvasTheme.routeFill,
				originFill: canvasTheme.routeFill,
				stroke: canvasTheme.routeStroke,
			});
			setThemeValues(routeObjects[1], { fill: canvasTheme.routeTextColor });
		});

		applyPortTheme(object.toPort, canvasTheme.portFill, object.color);
		(object.fromPort || []).forEach((port: ThemeableCanvasObject) =>
			applyPortTheme(port, canvasTheme.portFill, object.color),
		);
	});
};

const resolveBrowserStorage = (): ThemeStorage | undefined => {
	try {
		return typeof window === 'undefined' ? undefined : window.localStorage;
	} catch {
		return undefined;
	}
};

const isEditorTheme = (value: string | null): value is EditorTheme =>
	value === 'light' || value === 'dark';

export const readStoredEditorTheme = (storage?: ThemeStorage): EditorTheme => {
	try {
		const storedTheme = (storage || resolveBrowserStorage())?.getItem(EDITOR_THEME_STORAGE_KEY) || null;
		return isEditorTheme(storedTheme) ? storedTheme : 'light';
	} catch {
		return 'light';
	}
};

export const persistEditorTheme = (theme: EditorTheme, storage?: ThemeStorage): void => {
	try {
		(storage || resolveBrowserStorage())?.setItem(EDITOR_THEME_STORAGE_KEY, theme);
	} catch {
		// Theme switching remains available in memory when storage is blocked.
	}
};
