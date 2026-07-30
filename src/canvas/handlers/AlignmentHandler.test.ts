import { ActiveSelection, Rect } from 'fabric';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AlignmentHandler from './AlignmentHandler';

const createSelection = () => {
	const first = new Rect({
		height: 40,
		left: 100,
		strokeWidth: 0,
		top: 120,
		width: 40,
	});
	const second = new Rect({
		height: 30,
		left: 300,
		strokeWidth: 0,
		top: 260,
		width: 60,
	});
	const selection = new ActiveSelection([first, second]);

	selection.setCoords();
	selection.getObjects().forEach(object => object.setCoords());

	return { first, second, selection };
};

const createHandler = (selection: ActiveSelection) => {
	const handler = {
		canvas: {
			getActiveObject: vi.fn(() => selection),
			renderAll: vi.fn(),
		},
		isActiveSelection: vi.fn(() => true),
		transactionHandler: {
			save: vi.fn(),
		},
	};

	return {
		alignment: new AlignmentHandler(handler as any),
		handler,
	};
};

describe('AlignmentHandler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('aligns objects to the left, refreshes the selection bounds, and records one transaction', () => {
		const { first, second, selection } = createSelection();
		const { alignment, handler } = createHandler(selection);

		alignment.left();

		expect(first.getBoundingRect().left).toBeCloseTo(second.getBoundingRect().left);
		expect(selection.getBoundingRect().width).toBeCloseTo(60);
		expect(handler.canvas.renderAll).toHaveBeenCalledTimes(1);
		expect(handler.transactionHandler.save).toHaveBeenCalledTimes(1);
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('modified');
	});

	it('uses object height when vertically centering differently sized objects', () => {
		const { first, second, selection } = createSelection();
		const { alignment } = createHandler(selection);

		alignment.middle();

		const firstBounds = first.getBoundingRect();
		const secondBounds = second.getBoundingRect();
		expect(firstBounds.top + firstBounds.height / 2).toBeCloseTo(
			secondBounds.top + secondBounds.height / 2,
		);
	});

	it('does not create another transaction when the same alignment is already applied', () => {
		const { first, second, selection } = createSelection();
		const { alignment, handler } = createHandler(selection);

		alignment.right();
		const firstPosition = { left: first.getBoundingRect().left, top: first.getBoundingRect().top };
		const secondPosition = { left: second.getBoundingRect().left, top: second.getBoundingRect().top };
		alignment.right();

		expect(first.getBoundingRect().left).toBeCloseTo(firstPosition.left);
		expect(first.getBoundingRect().top).toBeCloseTo(firstPosition.top);
		expect(second.getBoundingRect().left).toBeCloseTo(secondPosition.left);
		expect(second.getBoundingRect().top).toBeCloseTo(secondPosition.top);
		expect(handler.transactionHandler.save).toHaveBeenCalledTimes(1);
	});
});
