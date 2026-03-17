import { debounce } from 'lodash-es';

import { Handler } from '.';
import { FabricObject } from '../models';

export type ContextMenuPayload = {
	x: number;
	y: number;
	placement: 'left' | 'right';
	content: any;
	target?: FabricObject | null;
};

class ContextMenuHandler {
	handler: Handler;

	private openContextmenu?: (payload: ContextMenuPayload) => void;
	private closeContextmenu?: () => void;

	constructor(handler: Handler) {
		this.handler = handler;
	}

	public bindPortal(open: (payload: ContextMenuPayload) => void, close: () => void) {
		this.openContextmenu = open;
		this.closeContextmenu = close;
	}

	public destroy() {
		this.show.cancel?.();
		this.hide.cancel?.();
		this.closeContextmenu?.();
	}

	/**
	 * Show context menu
	 */
	public show = debounce(async (e: MouseEvent, target?: FabricObject) => {
		if (!this.openContextmenu) {
			return;
		}

		const { onContext } = this.handler;
		if (!onContext) {
			return;
		}

		const content = await onContext(e, target);
		if (content === null || content === undefined) {
			return;
		}

		this.openContextmenu({
			x: e.clientX,
			y: e.clientY,
			placement: 'right',
			content,
			target: target ?? null,
		});
	}, 100);

	/**
	 * Hide context menu
	 */
	public hide = debounce(() => {
		this.closeContextmenu?.();
	}, 100);
}

export default ContextMenuHandler;
