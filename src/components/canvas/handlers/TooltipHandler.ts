import ReactDOM from 'react-dom';
import debounce from 'lodash/debounce';

import Handler from './Handler';

export interface TooltipHandlerOptions {
    onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;
}

class TooltipHandler {
    handler: Handler;
    tooltipEl: HTMLDivElement;
    target?: fabric.Object;
    onTooltip: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;

    constructor(handler: Handler, options: TooltipHandlerOptions) {
        this.handler = handler;
        this.onTooltip = options.onTooltip;
        if (!handler.editable) {
            this.init();
        }
    }

    init = () => {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.id = `${this.handler.id}_tooltip`;
        this.tooltipEl.className = 'rde-tooltip tooltip-hidden';
        document.body.appendChild(this.tooltipEl);
    }

    show = debounce(async (target?: fabric.Object) => {
        if (target.tooltip && target.tooltip.enabled) {
            while (this.tooltipEl.hasChildNodes()) {
                this.tooltipEl.removeChild(this.tooltipEl.firstChild);
            }
            const tooltip = document.createElement('div');
            tooltip.className = 'rde-tooltip-right';
            let element = target.name;
            const { onTooltip } = this;
            if (onTooltip) {
                element = await onTooltip(this.tooltipEl, target);
                if (!element) {
                    return;
                }
            }
            tooltip.innerHTML = element;
            this.tooltipEl.appendChild(tooltip);
            ReactDOM.render(element, tooltip);
            this.tooltipEl.classList.remove('tooltip-hidden');
            const zoom = this.handler.canvas.getZoom();
            const { clientHeight } = this.tooltipEl;
            const { width, height, scaleX, scaleY } = target;
            const { left, top } = target.getBoundingRect();
            const { _offset: offset } = this.handler.canvas.calcOffset();
            const objWidthDiff = (width * scaleX) * zoom;
            const objHeightDiff = (((height * scaleY) * zoom) / 2) - (clientHeight / 2);
            const calcLeft = offset.left + left + objWidthDiff;
            const calcTop = offset.top + top + objHeightDiff;
            if (document.body.clientWidth <= (calcLeft + this.tooltipEl.offsetWidth)) {
                this.tooltipEl.style.left = `${left + offset.left - this.tooltipEl.offsetWidth}px`;
                tooltip.className = 'rde-tooltip-left';
            } else {
                this.tooltipEl.style.left = `${calcLeft}px`;
            }
            this.tooltipEl.style.top = `${calcTop}px`;
            this.target = target;
        }
    }, 100)

    hide = debounce((target?: fabric.Object) => {
        this.target = null;
        if (this.tooltipEl) {
            this.tooltipEl.classList.add('tooltip-hidden');
        }
    }, 100)
}

export default TooltipHandler;
