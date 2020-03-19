import Handler from './Handler';
import { KeyEvent } from '../utils';

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
        return e.keyCode === 27 && this.keyEvent.esc;
    }

    /**
     * Whether keydown Q
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isQ = (e: KeyboardEvent) => {
        return e.keyCode === 81;
    }

    /**
     * Whether keydown W
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isW = (e: KeyboardEvent) => {
        return e.keyCode === 87;
    }

    /**
     * Whether keydown Delete or Backpsace
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isDelete = (e: KeyboardEvent) => {
        return (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 127) && this.keyEvent.del;
    }

    /**
     * Whether keydown Arrow
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isArrow = (e: KeyboardEvent) => {
        return e.code.includes('Arrow') && this.keyEvent.move;
    }

    /**
     * Whether keydown Ctrl + A
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlA = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 65 && this.keyEvent.all;
    }

    /**
     * Whether keydown Ctrl + C
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlC = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 67 && this.keyEvent.copy;
    }

    /**
     * Whether keydown Ctrl + V
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlV = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 86 && this.keyEvent.paste;
    }

    /**
     * Whether keydown Ctrl + Z
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlZ = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 90 && this.keyEvent.transaction;
    }

    /**
     * Whether keydown Ctrl + Y
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlY = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 89 && this.keyEvent.transaction;
    }

    /**
     * Whether keydown Plus Or Equal
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isPlus = (e: KeyboardEvent) => {
        return e.keyCode === 187 && this.keyEvent.zoom;
    }

    /**
     * Whether keydown Minus
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isMinus = (e: KeyboardEvent) => {
        return e.keyCode === 189 && this.keyEvent.zoom;
    }

    /**
     * Whether keydown O
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isO = (e: KeyboardEvent) => {
        return e.keyCode === 79 && this.keyEvent.zoom;
    }

    /**
     * Whether keydown P
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isP = (e: KeyboardEvent) => {
        return e.keyCode === 80 && this.keyEvent.zoom;
    }

    /**
     * Whether keydown Ctrl + X
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    public isCtrlX = (e: KeyboardEvent) => {
        return e.ctrlKey && e.keyCode === 88 && this.keyEvent.cut;
    }
}

export default ShortcutHandler;
