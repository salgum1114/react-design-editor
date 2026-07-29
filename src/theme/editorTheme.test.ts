import { describe, expect, it } from 'vitest';
import * as editorThemeModule from './editorTheme';
import {
	EDITOR_THEME_STORAGE_KEY,
	editorThemePalettes,
	getEditorCanvasTheme,
	persistEditorTheme,
	readStoredEditorTheme,
} from './editorTheme';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const createStorage = (storedValue: string | null): ThemeStorage & { value: string | null } => ({
	value: storedValue,
	getItem(key: string) {
		expect(key).toBe(EDITOR_THEME_STORAGE_KEY);
		return this.value;
	},
	setItem(key: string, value: string) {
		expect(key).toBe(EDITOR_THEME_STORAGE_KEY);
		this.value = value;
	},
});

describe('editor theme persistence', () => {
	it('defaults to light when no saved theme exists', () => {
		expect(readStoredEditorTheme(createStorage(null))).toBe('light');
	});

	it('restores a valid saved theme', () => {
		expect(readStoredEditorTheme(createStorage('dark'))).toBe('dark');
	});

	it('defaults to light when the saved value is invalid', () => {
		expect(readStoredEditorTheme(createStorage('system'))).toBe('light');
	});

	it('continues with light when storage reads fail', () => {
		const storage: ThemeStorage = {
			getItem: () => {
				throw new Error('Storage is unavailable');
			},
			setItem: () => undefined,
		};

		expect(readStoredEditorTheme(storage)).toBe('light');
	});

	it('persists explicit theme selections', () => {
		const storage = createStorage(null);

		persistEditorTheme('dark', storage);

		expect(storage.value).toBe('dark');
	});

	it('does not throw when storage writes fail', () => {
		const storage: ThemeStorage = {
			getItem: () => null,
			setItem: () => {
				throw new Error('Storage is unavailable');
			},
		};

		expect(() => persistEditorTheme('dark', storage)).not.toThrow();
	});
});

describe('editor canvas theme', () => {
	it('uses the approved light canvas and grid colors', () => {
		expect(getEditorCanvasTheme('light')).toEqual({
			backgroundColor: '#EEF3F7',
			dotColor: '#C9D4DE',
			selectionColor: 'rgba(15, 143, 119, 0.2)',
		});
	});

	it('keeps the existing dark canvas and grid colors', () => {
		expect(getEditorCanvasTheme('dark')).toEqual({
			backgroundColor: '#1C2128',
			dotColor: '#5F646B',
			selectionColor: 'rgba(94, 224, 189, 0.2)',
		});
	});
});

describe('workflow canvas theme', () => {
	it('defines theme-aware workflow surfaces while preserving category accents', () => {
		expect(editorThemePalettes.light).toMatchObject({
			workflowActionButton: '#E8F0F4',
			workflowLink: '#8A99A6',
			workflowNode: '#FFFFFF',
			workflowNodeBorder: '#D7E0E7',
			workflowNodeText: '#172A2D',
			workflowPort: '#8A99A6',
			workflowRoute: '#F7FAFC',
		});
		expect(editorThemePalettes.dark).toMatchObject({
			workflowActionButton: '#5F646B',
			workflowLink: '#C3C9D5',
			workflowNode: '#20262E',
			workflowNodeBorder: '#5F646B',
			workflowNodeText: '#FFFFFF',
			workflowPort: '#5F646B',
			workflowRoute: '#272E38',
		});
	});

	it('updates existing workflow object presentation without replacing objects', () => {
		const applyWorkflowCanvasTheme = (
			editorThemeModule as typeof editorThemeModule & {
				applyWorkflowCanvasTheme?: (objects: any[], theme: 'light' | 'dark') => void;
			}
		).applyWorkflowCanvasTheme;
		expect(applyWorkflowCanvasTheme).toBeTypeOf('function');
		if (!applyWorkflowCanvasTheme) {
			return;
		}

		const createTarget = (
			values: Record<string, any> = {},
		): Record<string, any> & { set(nextValues: Record<string, any>): void } => {
			const target = {
				...values,
				set(nextValues: Record<string, any>) {
					Object.assign(target, nextValues);
				},
			};
			return target;
		};
		const rect = createTarget();
		const label = createTarget();
		const buttonSurface = createTarget();
		const buttonIcon = createTarget();
		const routeSurface = createTarget();
		const routeLabel = createTarget();
		const route = createTarget({
			getObjects: () => [routeSurface, routeLabel],
		});
		const nodeColor = '#2BD99F';
		const freePort = createTarget({
			connected: false,
			connectedFill: nodeColor,
			fill: '#5F646B',
		});
		const connectedPort = createTarget({
			connected: true,
			connectedFill: nodeColor,
			fill: nodeColor,
		});
		const node = createTarget({
			button: createTarget({ getObjects: () => [buttonSurface, buttonIcon] }),
			color: nodeColor,
			errors: false,
			fromPort: [freePort],
			label,
			ports: [route],
			rect,
			superType: 'node',
			toPort: connectedPort,
		});
		const link = createTarget({
			stroke: '',
			setColor(color: string) {
				link.stroke = color;
			},
			superType: 'link',
		});

		applyWorkflowCanvasTheme([node, link], 'light');

		expect(rect).toMatchObject({ fill: '#FFFFFF', stroke: '#D7E0E7' });
		expect(label).toMatchObject({ fill: '#172A2D' });
		expect(buttonSurface).toMatchObject({ fill: '#E8F0F4' });
		expect(buttonIcon).toMatchObject({ fill: '#0F8F77' });
		expect(routeSurface).toMatchObject({ fill: '#F7FAFC', stroke: '#D7E0E7' });
		expect(routeLabel).toMatchObject({ fill: '#172A2D' });
		expect(freePort).toMatchObject({
			connectedFill: nodeColor,
			fill: '#8A99A6',
			originFill: '#8A99A6',
			stroke: '#8A99A6',
		});
		expect(connectedPort).toMatchObject({
			connectedFill: nodeColor,
			fill: nodeColor,
			originFill: '#8A99A6',
			stroke: nodeColor,
		});
		expect(link).toMatchObject({ originStroke: '#8A99A6', stroke: '#8A99A6' });

		applyWorkflowCanvasTheme([node, link], 'dark');

		expect(freePort).toMatchObject({
			connectedFill: nodeColor,
			fill: '#5F646B',
			originFill: '#5F646B',
			stroke: '#5F646B',
		});
		expect(connectedPort).toMatchObject({
			connectedFill: nodeColor,
			fill: nodeColor,
			originFill: '#5F646B',
			stroke: nodeColor,
		});
	});
});
