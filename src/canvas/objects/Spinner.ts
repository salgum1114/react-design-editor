import { fabric } from 'fabric';

import { registerFabricClass, resolveFromObject, toObject } from '../utils';

class Spinner extends fabric.Group {
	static type = 'spinner';
	superType = 'port';
	animationFrameId: ReturnType<typeof setTimeout> | null = null;

	constructor(options: any = {}) {
		const radius = options.radius || 15;
		const fill = options.fill || '#FFD700';
		const baseCircle = new fabric.Circle({
			radius,
			fill,
			originX: 'center',
			originY: 'center',
		});
		const bars = [];
		const count = 12;
		for (let i = 0; i < count; i++) {
			const angle = i * 30;
			const opacity = 0.1 + (i / count) * 0.7;
			bars.push(
				new fabric.Rect({
					width: 2.5,
					height: 7,
					fill: `rgba(0, 0, 0, ${opacity})`,
					originX: 'center',
					originY: 'center',
					left: Math.sin(fabric.util.degreesToRadians(angle)) * (radius * 0.5),
					top: -Math.cos(fabric.util.degreesToRadians(angle)) * (radius * 0.5),
					angle,
					rx: 1,
					ry: 1,
				}),
			);
		}
		super([baseCircle, ...bars], {
			originX: 'center',
			originY: 'center',
			selectable: false,
			evented: false,
			visible: false,
			...options,
		});
	}

	setPosition(left: number, top: number) {
		this.set({ left, top });
		this.setCoords();
	}

	startAnimation() {
		if (this.animationFrameId) {
			return;
		}
		const animate = () => {
			if (!this.visible) {
				this.stopAnimation();
				return;
			}
			this.set('angle', (this.angle + 30) % 360);
			this.canvas?.requestRenderAll();
			this.animationFrameId = setTimeout(animate, 1000 / 12);
		};
		animate();
	}

	stopAnimation() {
		if (this.animationFrameId) {
			clearTimeout(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	setVisibility(visible: boolean) {
		this.set('visible', visible);
		this.set('dirty', true);
		if (visible) {
			this.startAnimation();
		} else {
			this.stopAnimation();
		}
		this.canvas?.requestRenderAll();
	}

	toObject(propertiesToInclude: string[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			id: this.get('id'),
			superType: this.get('superType'),
			enabled: this.get('enabled'),
			nodeId: this.get('nodeId'),
			label: this.get('label'),
			fontSize: this.get('fontSize'),
			fontFamily: this.get('fontFamily'),
			color: this.get('color'),
			connected: this.get('connected'),
		});
	}

	static fromObject(options: any, callback?: (obj: any) => any) {
		return resolveFromObject(new Spinner(options), callback);
	}
}

registerFabricClass('Spinner', Spinner);

export default Spinner;
