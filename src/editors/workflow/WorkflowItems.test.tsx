// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({ Collapse: (): null => null, Input: (): null => null }));
vi.mock('../../canvas', () => ({}));
vi.mock('../../canvas/objects', () => ({}));
vi.mock('../../components/common', () => ({
	CommonButton: (): null => null,
	Scrollbar: (): null => null,
}));
vi.mock('../../components/editor', () => ({
	EditorPanelHeader: (): null => null,
	PALETTE_COLLAPSE_PROPS: {},
	resolvePaletteActiveKeys: (): string[] => [],
}));
vi.mock('../../components/flex', () => ({ Flex: (): null => null }));
vi.mock('../../components/icon/Icon', () => ({ default: (): null => null }));

describe('WorkflowItems drag and drop', () => {
	it('passes viewport pointer coordinates to the handler positioning boundary', async () => {
		Object.defineProperty(document, 'queryCommandSupported', {
			configurable: true,
			value: vi.fn(() => false),
		});
		const { default: WorkflowItems } = await import('./WorkflowItems');
		const getScenePoint = vi.fn(() => ({ x: 410, y: 260 }));
		const getViewportPoint = vi.fn(() => ({ x: 520, y: 400 }));
		const component = new WorkflowItems({
			descriptors: {},
			instance: {
				canvas: { getScenePoint, getViewportPoint },
			},
		} as any);
		const addItem = vi.fn();
		(component as any).item = { name: 'Delay', nodeClazz: 'DelayNode', type: 'LOGIC' };
		(component as any).handlers.addItem = addItem;

		(component as any).events.onDrop({
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
		});

		expect(getViewportPoint).toHaveBeenCalledOnce();
		expect(getScenePoint).not.toHaveBeenCalled();
		expect(addItem).toHaveBeenCalledWith(
			expect.objectContaining({ left: 520, top: 400 }),
			false,
		);
	}, 20_000);
});
