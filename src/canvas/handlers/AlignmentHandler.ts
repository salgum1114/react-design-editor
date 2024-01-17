import Handler from './Handler';

class AlignmentHandler {
	handler: Handler;
	constructor(handler: Handler) {
		this.handler = handler;
	}

	/**
	 * Align left at selection
	 */
	public left = () => {
		const activeObject = this.handler.canvas.getActiveObject();
		if (activeObject && activeObject.type === 'activeSelection') {
			const activeSelection = activeObject as fabric.ActiveSelection;
			const activeObjectLeft = -(activeObject.width / 2);
			activeSelection.forEachObject(obj => {
				obj.set({
					left: activeObjectLeft,
				});
				obj.setCoords();
				this.handler.canvas.renderAll();
			});
		}
	};

	/**
	 * Align center at selection
	 */
	public center = () => {
		const activeObject = this.handler.canvas.getActiveObject();
		if (activeObject && activeObject.type === 'activeSelection') {
			const activeSelection = activeObject as fabric.ActiveSelection;
			activeSelection.forEachObject(obj => {
				obj.set({
					left: 0 - (obj.width * obj.scaleX) / 2,
				});
				obj.setCoords();
				this.handler.canvas.renderAll();
			});
		}
	};

	/**
	 * Align center at selection
	 */
	public middle = () => {
		const activeObject = this.handler.canvas.getActiveObject();
		if (activeObject && activeObject.type === 'activeSelection') {
			const activeSelection = activeObject as fabric.ActiveSelection;
			activeSelection.forEachObject(obj => {
				obj.set({
					top: 0 - (obj.width * obj.scaleX) / 2,
				});
				obj.setCoords();
				this.handler.canvas.renderAll();
			});
		}
	};

	/**
	 * Align right at selection
	 */
	public right = () => {
		const activeObject = this.handler.canvas.getActiveObject();
		if (activeObject && activeObject.type === 'activeSelection') {
			const activeSelection = activeObject as fabric.ActiveSelection;
			const activeObjectLeft = activeObject.width / 2;
			activeSelection.forEachObject(obj => {
				obj.set({
					left: activeObjectLeft - obj.width * obj.scaleX,
				});
				obj.setCoords();
				this.handler.canvas.renderAll();
			});
		}
	};
}

export default AlignmentHandler;
