import { fabric } from 'fabric';
import * as echarts from 'echarts';

import Handler from './Handler';

class ChartHandler {
    handler?: Handler;
    instance?: echarts.ECharts;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * @description Create chart
     * @param {fabric.Object} obj
     * @param {echarts.EChartOption} [options={}]
     */
    public create = (obj: fabric.Object, options: echarts.EChartOption = {}) => {
        const { editable } = this.handler;
        const zoom = this.handler.canvas.getZoom();
        const left = obj.calcCoords().tl.x;
        const top = obj.calcCoords().tl.y;
        const { id, scaleX, scaleY, width, height, angle } = obj;
        const padLeft = ((width * scaleX * zoom) - width) / 2;
        const padTop = ((height * scaleY * zoom) - height) / 2;
        if (editable) {
            this.handler.elementHandler.removeById(id);
        }
        const element = fabric.util.makeElement('div', {
            id: `${id}_container`,
            style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                    width: ${width}px;
                    height: ${height}px;
                    left: ${left + padLeft}px;
                    top: ${top + padTop}px;
                    position: absolute;
                    user-select: ${editable ? 'none' : 'auto'};
                    pointer-events: ${editable ? 'none' : 'auto'};`,
        }) as HTMLDivElement;
        this.instance = echarts.init(element);
        this.instance.setOption(options);

        this.handler.container.appendChild(element);
    }
}

export default ChartHandler;
