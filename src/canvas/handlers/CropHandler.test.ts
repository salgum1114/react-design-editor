// @vitest-environment jsdom
import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';
import CropHandler from './CropHandler';
import InteractionHandler from './InteractionHandler';

const createFixture = (options: Partial<fabric.ImageProps> = {}) => {
	const image = new fabric.FabricImage(document.createElement('img'), {
		left: 200,
		top: 150,
		width: 100,
		height: 80,
		...options,
	});
	const handler: any = {
		canvas: {
			getActiveObject: () => image,
			discardActiveObject: vi.fn(),
			add: vi.fn(),
			remove: vi.fn(),
			setActiveObject: vi.fn(),
			renderAll: vi.fn(),
		},
		setImage: vi.fn().mockResolvedValue(image),
		transactionHandler: { active: false, save: vi.fn() },
		onModified: vi.fn(),
	};
	return { image, handler, crop: new CropHandler(handler) };
};

describe('CropHandler image coordinates', () => {
	it.each(['selection', 'grab', 'drawing', 'linking'] as const)(
		'blocks switching to %s while a crop bitmap is loading',
		mode => {
			const { handler, crop } = createFixture();
			handler.cropHandler = crop;
			handler.canvasOption = {};
			handler.workarea = {};
			handler.getObjects = (): fabric.FabricObject[] => [];
			handler.canvas.setCursor = vi.fn();
			handler.canvas.requestRenderAll = vi.fn();
			handler.interactionMode = 'crop';
			crop.isFinishing = true;
			const interaction = new InteractionHandler(handler);
			interaction[mode]();
			expect(handler.interactionMode).toBe('crop');
			expect(handler.canvas.renderAll).not.toHaveBeenCalled();
		},
	);

	it.each([
		{
			originX: 'center' as const,
			originY: 'center' as const,
			scaleX: 1,
			scaleY: 1,
			left: 150,
			top: 110,
			width: 100,
			height: 80,
		},
		{
			originX: 'center' as const,
			originY: 'center' as const,
			scaleX: 2,
			scaleY: 2,
			left: 100,
			top: 70,
			width: 200,
			height: 160,
		},
		{
			originX: 'left' as const,
			originY: 'top' as const,
			scaleX: 2,
			scaleY: 2,
			left: 200,
			top: 150,
			width: 200,
			height: 160,
		},
	])(
		'covers the displayed image at $originX origin and $scaleX scale',
		({ left, top, width, height, ...options }) => {
			const { crop } = createFixture(options);
			crop.start();
			expect(crop.cropRect.getBoundingRect()).toEqual({ left, top, width, height });
			expect(crop.cropRect.excludeFromExport).toBe(true);
			expect(crop.cropRect.isControlVisible('mtr')).toBe(false);
		},
	);

	it('exports the crop relative to the rendered image boundary and preserves its position', async () => {
		const { image, handler, crop } = createFixture({ scaleX: 2, scaleY: 2 });
		const exportImage = vi.spyOn(image, 'toDataURL').mockReturnValue('data:image/png;base64,cropped');
		crop.start();
		crop.cropRect.set({ left: 130, top: 90, scaleX: 0.5, scaleY: 0.5 });
		handler.setImage.mockImplementation(async () => {
			image.set({ width: 100, height: 80 });
			return image;
		});

		await crop.finish();

		expect(exportImage).toHaveBeenCalledWith({ left: 30, top: 20, width: 100, height: 80 });
		expect(image.getBoundingRect()).toEqual({ left: 130, top: 90, width: 100, height: 80 });
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('modified');
		expect(handler.onModified).toHaveBeenCalledWith(image);
		expect(crop.cropRect).toBeNull();
	});

	it('clamps resize to a scaled center-origin image boundary', () => {
		const { crop } = createFixture({ scaleX: 2, scaleY: 2 });
		crop.start();
		crop.cropRect.set({ scaleX: 1.5, scaleY: 1.5 });
		crop.resize({ target: crop.cropRect, transform: { original: { left: 100, top: 70 }, corner: 'br' } } as any);
		expect(crop.cropRect.getBoundingRect()).toEqual({ left: 100, top: 70, width: 200, height: 160 });
	});

	it('locks the crop session while loading and ignores repeated completion', async () => {
		const { image, handler, crop } = createFixture();
		vi.spyOn(image, 'toDataURL').mockReturnValue('data:image/png;base64,cropped');
		let resolveImage: () => void;
		handler.setImage.mockImplementation(
			() =>
				new Promise<void>(resolve => {
					resolveImage = resolve;
				}),
		);
		crop.start();
		const finished = crop.finish();
		const cropRect = crop.cropRect;
		expect(cropRect.selectable).toBe(false);
		expect(handler.canvas.discardActiveObject).toHaveBeenCalled();
		expect(() => crop.cancel()).not.toThrow();
		await crop.finish();
		crop.start();
		expect(crop.cropRect).toBe(cropRect);
		resolveImage();
		await finished;
		expect(handler.setImage).toHaveBeenCalledTimes(1);
		expect(handler.transactionHandler.save).toHaveBeenCalledTimes(1);
		expect(crop.cropRect).toBeNull();
	});

	it('does not complete against a canvas disposed during image loading', async () => {
		const { image, handler, crop } = createFixture();
		vi.spyOn(image, 'toDataURL').mockReturnValue('data:image/png;base64,cropped');
		let resolveImage: () => void;
		handler.setImage.mockImplementation(
			() =>
				new Promise<void>(resolve => {
					resolveImage = resolve;
				}),
		);
		crop.start();
		const finished = crop.finish();
		handler.canvas.disposed = true;
		handler.canvas.renderAll.mockClear();
		resolveImage();
		await finished;
		expect(handler.canvas.renderAll).not.toHaveBeenCalled();
		expect(handler.transactionHandler.save).not.toHaveBeenCalled();
		expect(handler.onModified).not.toHaveBeenCalled();
	});
});
