import { NodeObject } from '../objects/Node';
import AbstractHandler from './AbstractHandler';

class CustomControlHandler extends AbstractHandler {
	constructor(handler: any) {
		super(handler);
	}

	/**
	 * Create CustomControl
	 * @param {NodeObject} target
	 */
	create = (target: NodeObject) => {
		const customControls = target.createCustomControls?.(target.left!, target.top!);
		customControls?.forEach(p => {
			this.handler.canvas.add(p);
			this.handler.canvas.bringToFront(p);
			p.setCoords();
		});
	};

	/**
	 * Set coords CustomControl
	 * @param {NodeObject} target
	 */
	setCoords = (target: NodeObject) => {
		target.customControls?.forEach(control => {
			control.setPosition(target.left!, target.top!);
		});
	};

	/**
	 * Recreate CustomControl
	 * @param {NodeObject} target
	 */
	recreate = (target: NodeObject) => {
		const { customControls } = target;
		customControls?.forEach(control => {
			this.handler.canvas.remove(control);
		});
		this.create(target);
	};
}

export default CustomControlHandler;
