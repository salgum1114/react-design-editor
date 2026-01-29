import { debounce } from 'lodash-es';
import type { FabricObject } from '../models';
import type Handler from './Handler';

type TooltipPayload = {
	x: number;
	y: number;
	placement: 'left' | 'right';
	content: any;
	measuring?: boolean;
};

class TooltipHandler {
	handler: Handler;

	private openTooltip?: (payload: TooltipPayload) => void;
	private closeTooltip?: () => void;

	private lastContent: any = null;
	private lastTarget: FabricObject | null = null;

	constructor(handler: Handler) {
		this.handler = handler;
	}

	public bindPortal(open: (payload: TooltipPayload) => void, close: () => void) {
		this.openTooltip = open;
		this.closeTooltip = close;
	}

	public destroy() {
		this.closeTooltip?.();
	}

	public show = debounce(async (target?: FabricObject) => {
		if (!target) return;
		if (!this.openTooltip) return;
		if (!(target.tooltip && target.tooltip.enabled)) return;

		let content: any = target.name;
		const { onTooltip } = this.handler as any;
		if (onTooltip) {
			const result = await onTooltip(null, target);
			if (!result) return;
			content = result;
		}

		this.lastTarget = target;
		this.lastContent = content;
		(this.handler as any).target = target;

		this.openTooltip({
			x: 0,
			y: 0,
			placement: 'right',
			content,
			measuring: true,
		});
	}, 100);

	public placeMeasured = (box: { width: number; height: number }) => {
		const target = this.lastTarget;
		const content = this.lastContent;
		if (!target || !content || !this.openTooltip) return;

		const zoom = this.handler.canvas.getZoom();
		const { width, height, scaleX, scaleY } = target;
		const { left, top } = target.getBoundingRect();
		const { _offset: offset } = this.handler.canvas.calcOffset() as any;

		const objWidthDiff = width * scaleX * zoom;
		const objHeightDiff = (height * scaleY * zoom) / 2 - box.height / 2;

		const calcLeft = offset.left + left + objWidthDiff;
		const calcTop = offset.top + top + objHeightDiff;

		let placement: 'left' | 'right' = 'right';
		let x = calcLeft;

		if (document.body.clientWidth <= calcLeft + box.width) {
			placement = 'left';
			x = left + offset.left - box.width;
		}

		this.openTooltip({
			x,
			y: calcTop,
			placement,
			content,
			measuring: false,
		});
	};

	public hide = debounce(() => {
		this.lastTarget = null;
		this.lastContent = null;
		(this.handler as any).target = null;
		this.closeTooltip?.();
	}, 100);
}

export default TooltipHandler;
