import { fabric } from 'fabric';
import CustomHandler from './CustomHandler';

class FiberHandler extends CustomHandler {
	protected initialze() {
		this.handler.canvas.on('mouse:down', this.mousedown);
	}

	private mousedown(opt: fabric.IEvent) {
		const { subTargets } = opt;
		if (subTargets.length) {
			const target = subTargets[0];
			console.log(target);
			if (target.type === 'container') {
			} else if (target.type === 'coreContainer') {
			}
		}
	}
}

export default FiberHandler;
