import { ActiveSelection, Point, util } from 'fabric';
import Handler from './Handler';

type Alignment = 'center' | 'left' | 'middle' | 'right';
const ALIGNMENT_EPSILON = 0.0001;

class AlignmentHandler {
	handler: Handler;
	constructor(handler: Handler) {
		this.handler = handler;
	}

	private align = (alignment: Alignment) => {
		const activeObject = this.handler.canvas.getActiveObject();
		if (!activeObject || !this.handler.isActiveSelection(activeObject)) {
			return;
		}

		const activeSelection = activeObject as ActiveSelection;
		const selectionBounds = activeSelection.getBoundingRect();
		const objects = activeSelection.getObjects();
		const objectBounds = objects.map(object => object.getBoundingRect());
		const target =
			alignment === 'left'
				? Math.min(...objectBounds.map(bounds => bounds.left))
				: alignment === 'right'
					? Math.max(...objectBounds.map(bounds => bounds.left + bounds.width))
					: alignment === 'center'
						? selectionBounds.left + selectionBounds.width / 2
						: selectionBounds.top + selectionBounds.height / 2;
		const selectionTransform = activeSelection.calcTransformMatrix();
		let changed = false;

		objects.forEach((object, index) => {
			const bounds = objectBounds[index];
			const current =
				alignment === 'left'
					? bounds.left
					: alignment === 'right'
						? bounds.left + bounds.width
						: alignment === 'center'
							? bounds.left + bounds.width / 2
							: bounds.top + bounds.height / 2;
			const delta = target - current;
			if (Math.abs(delta) < ALIGNMENT_EPSILON) {
				return;
			}

			const canvasDelta = new Point(
				alignment === 'middle' ? 0 : delta,
				alignment === 'middle' ? delta : 0,
			);
			const localDelta = util.sendVectorToPlane(canvasDelta, undefined, selectionTransform);
			object.set({
				left: object.left + localDelta.x,
				top: object.top + localDelta.y,
			});
			object.setCoords();
			changed = true;
		});

		if (!changed) {
			return;
		}

		activeSelection.triggerLayout();
		activeSelection.setCoords();
		activeSelection.getObjects().forEach(object => object.setCoords());
		this.handler.canvas.renderAll();
		this.handler.transactionHandler.save('modified');
	};

	/**
	 * Align left at selection
	 */
	public left = () => {
		this.align('left');
	};

	/**
	 * Align center at selection
	 */
	public center = () => {
		this.align('center');
	};

	/**
	 * Align middle at selection
	 */
	public middle = () => {
		this.align('middle');
	};

	/**
	 * Align right at selection
	 */
	public right = () => {
		this.align('right');
	};
}

export default AlignmentHandler;
