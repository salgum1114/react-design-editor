import ReactDOM from 'react-dom';
import debounce from 'lodash/debounce';

import { Handler } from '.';


class ContextmenuHandler {
    handler: Handler;
    contextmenuEl: HTMLDivElement;

    constructor(handler: Handler) {
        this.handler = handler;
        this.init();
    }

    /**
     * @description Init context menu
     */
    public init = () => {
        this.contextmenuEl = document.createElement('div');
        this.contextmenuEl.id = `${this.handler.id}_contextmenu`;
        this.contextmenuEl.className = 'rde-contextmenu contextmenu-hidden';
        document.body.appendChild(this.contextmenuEl);
    }

    /**
     * @description Show context menu
     * @memberof ContextmenuHandler
     */
    public show = debounce(async (e, target) => {
        const { onContext } = this.handler;
        while (this.contextmenuEl.hasChildNodes()) {
            this.contextmenuEl.removeChild(this.contextmenuEl.firstChild);
        }
        const contextmenu = document.createElement('div');
        contextmenu.className = 'rde-contextmenu-right';
        const element = await onContext(this.contextmenuEl, e, target);
        if (!element) {
            return;
        }
        contextmenu.innerHTML = element;
        this.contextmenuEl.appendChild(contextmenu);
        ReactDOM.render(element, contextmenu);
        this.contextmenuEl.classList.remove('contextmenu-hidden');
        const { clientX: left, clientY: top } = e;
        this.contextmenuEl.style.left = `${left}px`;
        this.contextmenuEl.style.top = `${top}px`;
    }, 100)

    /**
     * @description Hide context menu
     * @memberof ContextmenuHandler
     */
    public hide = debounce(() => {
        if (this.contextmenuEl) {
            this.contextmenuEl.classList.add('contextmenu-hidden');
        }
    }, 100)
}

export default ContextmenuHandler;
