// @vitest-environment jsdom
import * as fabric from 'fabric';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('mediaelement', () => ({}));
vi.mock('../../components/common', () => ({ CommonButton: (): null => null, InputJson: (): null => null, InputScript: (): null => null, InputTemplate: (): null => null }));
import { message } from 'antd';
import TransactionHandler from '../../canvas/handlers/TransactionHandler';
import LinkHandler from '../../canvas/handlers/LinkHandler';
import GridHandler from '../../canvas/handlers/GridHandler';
import PortHandler from '../../canvas/handlers/PortHandler';
import Nodes from './node';
import Links from './link';
import descriptors from './Descriptors.json';
import WorkflowEditor from './WorkflowEditor';

const createEditor = () => {
	const editor = new WorkflowEditor({});
	editor.context = { theme: 'light' } as any;
	editor.setState = ((update: any, callback?: () => void) => {
		editor.state = { ...editor.state, ...update };
		callback?.();
	}) as any;
	editor.forceUpdate = () => {};
	editor.state.workflow = { name: 'Existing workflow' };
	const canvas = new fabric.Canvas(document.createElement('canvas'));
	const original = new fabric.Rect({ width: 40, height: 40 }) as any;
	original.id = 'existing';
	canvas.add(original);
	const handler: any = {
		canvas, canvasActions: { transaction: true }, editable: true, gridOption: { enabled: false, grid: 20, snapToGrid: true },
		fabricObjects: { ...Nodes(descriptors, 'light'), ...Links('light') },
		propertiesToInclude: ['id', 'superType'], objectMap: {}, objects: [original],
		isActiveSelection: () => false, isBatching: () => true,
		nodeHandler: { highlightingNode: vi.fn(), deselect: vi.fn() }, select: vi.fn(),
		bindObjectEvents: () => {},
		clear: () => { canvas.remove(...canvas.getObjects()); },
		runBatch: (operation: () => void) => operation(),
		getObjects: () => canvas.getObjects().filter((object: any) => object.superType !== 'port'),
	};
	handler.portHandler = new PortHandler(handler);
	handler.gridHandler = new GridHandler(handler);
	handler.gridOption.enabled = true;
	handler.linkHandler = new LinkHandler(handler);
	handler.transactionHandler = new TransactionHandler(handler);
	handler.transactionHandler.setDefaultObjects();
	editor.canvasRef = { canvas, handler } as any;
	return { editor, canvas, getObjects: handler.getObjects };
};

const importFile = async (editor: WorkflowEditor, data: unknown) => {
	let finished: Promise<void> | undefined;
	vi.stubGlobal('FileReader', class {
		onload: any;
		readAsText() { finished = this.onload({ target: { result: JSON.stringify(data) } }); }
	});
	editor.handlers.onImport([{}] as any);
	await finished;
};

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('WorkflowEditor edits and imports', () => {
	it('marks palette additions as unsaved', async () => {
		const { editor, canvas } = createEditor();
		editor.canvasHandlers.onAdd({ superType: 'node' } as any);
		expect(editor.state.editing).toBe(true);
		await canvas.dispose();
	});

	it.each([
		{ nodes: [] },
		{ nodes: [{ id: 'bad' }], links: [], properties: {} },
		{ nodes: [{ id: 'switch', nodeClazz: 'SwitchNode', configuration: {} }], links: [], properties: {} },
		{ nodes: [{ id: 'timer', nodeClazz: 'TimerNode' }], links: [{ fromNode: 'timer', fromPort: 'missing', toNode: 'timer' }], properties: {} },
	])('preserves the current workflow after invalid import %j', async data => {
		const { editor, canvas, getObjects } = createEditor();
		const error = vi.spyOn(message, 'error').mockImplementation(() => (() => {}) as any);
		await importFile(editor, data);
		expect(getObjects().map((object: any) => object.id)).toEqual(['existing']);
		expect(editor.state.workflow.name).toBe('Existing workflow');
		expect(editor.state.loading).toBe(false);
		expect(error).toHaveBeenCalled();
		await canvas.dispose();
	});

	it('imports a valid workflow and resets its history after successful restoration', async () => {
		const { editor, canvas, getObjects } = createEditor();
		await importFile(editor, { name: 'Imported', nodes: [{ id: 'timer', nodeClazz: 'TimerNode', configuration: { interval: 2 }, properties: { left: 205, top: 103 } }], links: [], properties: {} });
		const point = getObjects()[0].getPointByOrigin('left', 'top');
		expect(point.x / 20).toBeCloseTo(Math.round(point.x / 20));
		expect(point.y / 20).toBeCloseTo(Math.round(point.y / 20));
		expect(getObjects().map((object: any) => object.id)).toEqual(['timer']);
		expect(editor.state.workflow.name).toBe('Imported');
		expect(editor.state.editing).toBe(false);
		expect(editor.canvasRef.handler.transactionHandler.canUndo()).toBe(false);
		await canvas.dispose();
	});
	it('uses imported fields when replacing nodes with the same ids', async () => {
		const { editor, canvas, getObjects } = createEditor();
		const handler = editor.canvasRef.handler;
		handler.clear();
		const original = handler.fabricObjects.TimerNode.create({ id: 'timer', name: 'Current', description: 'Old description', configuration: { interval: 5 }, left: 200, top: 100 });
		canvas.add(original);
		handler.portHandler.create(original as any);
		handler.transactionHandler.setDefaultObjects();
		await importFile(editor, { name: 'Imported', nodes: [{ id: 'timer', name: 'From file', nodeClazz: 'TimerNode', configuration: { interval: 2 }, properties: { left: 300, top: 200 } }], links: [], properties: {} });
		const imported = getObjects()[0];
		expect(imported.name).toBe('From file');
		expect(imported.configuration.interval).toBe(2);
		expect(imported.description).not.toBe('Old description');
		imported.set('left', imported.left + 100);
		handler.transactionHandler.save('moved');
		await handler.transactionHandler.undo();
		expect(getObjects()[0].name).toBe('From file');
		expect(getObjects()[0].description).not.toBe('Old description');
		await canvas.dispose();
	});

});
