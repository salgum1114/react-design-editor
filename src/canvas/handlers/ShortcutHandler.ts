import { code } from '../constants';
import { KeyEvent } from '../models';
import Handler from './Handler';

/**
 * Shortcut Handler Class
 *
 * @author salgum1114
 * @class ShortcutHandler
 */
class ShortcutHandler {
	handler: Handler;
	keyEvent: KeyEvent;
	constructor(handler: Handler) {
		this.handler = handler;
		this.keyEvent = handler.keyEvent;
	}

	/**
	 * Whether keydown Escape
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isEscape = (e: KeyboardEvent) => {
		return e.code === code.ESCAPE && this.keyEvent.esc;
	};

	/**
	 * Whether keydown Q
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isQ = (e: KeyboardEvent) => {
		return e.code === code.KEY_Q;
	};

	/**
	 * Whether keydown W
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isW = (e: KeyboardEvent) => {
		return e.code === code.KEY_W;
	};

	/**
	 * Whether keydown Delete or Backpsace
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isDelete = (e: KeyboardEvent) => {
		return (e.code === code.BACKSPACE || e.code === code.DELETE) && this.keyEvent.del;
	};

	/**
	 * Whether keydown Arrow
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isArrow = (e: KeyboardEvent) => {
		return e.code.includes('Arrow') && this.keyEvent.move;
	};

	/**
	 * Whether keydown Ctrl + A
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlA = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_A && this.keyEvent.all;
	};

	/**
	 * Whether keydown Ctrl + C
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlC = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_C && this.keyEvent.copy;
	};

	/**
	 * Whether keydown Ctrl + V
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlV = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_V && this.keyEvent.paste;
	};

	/**
	 * Whether keydown Ctrl + Z
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlZ = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_Z && this.keyEvent.transaction;
	};

	/**
	 * Whether keydown Ctrl + Y
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlY = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_Y && this.keyEvent.transaction;
	};

	/**
	 * Whether keydown Plus Or Equal
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isPlus = (e: KeyboardEvent) => {
		return e.code === code.EQUAL && this.keyEvent.zoom;
	};

	/**
	 * Whether keydown Minus
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isMinus = (e: KeyboardEvent) => {
		return e.code === code.MINUS && this.keyEvent.zoom;
	};

	/**
	 * Whether keydown O
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isO = (e: KeyboardEvent) => {
		return e.code === code.KEY_O && this.keyEvent.zoom;
	};

	/**
	 * Whether keydown P
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isP = (e: KeyboardEvent) => {
		return e.code === code.KEY_P && this.keyEvent.zoom;
	};

	/**
	 * Whether keydown Ctrl + X
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public isCtrlX = (e: KeyboardEvent) => {
		return (e.ctrlKey || e.metaKey) && e.code === code.KEY_X && this.keyEvent.cut;
	};
}

export default ShortcutHandler;
