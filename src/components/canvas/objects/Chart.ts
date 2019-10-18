import { fabric } from 'fabric';
import * as echarts from 'echarts';

import { toObject, FabricElement } from '../utils';

export interface ChartObject extends FabricElement {
    setSource: (source: echarts.EChartOption) => void;
    setChartOption: (chartOption: echarts.EChartOption) => void;
    chartOption: echarts.EChartOption;
    instance: echarts.ECharts;
}

const Chart = fabric.util.createClass(fabric.Rect, {
    type: 'chart',
    superType: 'element',
    hasRotatingPoint: false,
    initialize(chartOption: echarts.EChartOption, options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        this.set({
            chartOption,
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(255, 255, 255, 0)',
        });
    },
    setSource(source: any) {
        this.setChartOption(source);
    },
    setChartOption(chartOption: echarts.EChartOption) {
        this.set({
            chartOption,
        });
        this.instance.setOption(chartOption);
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            chartOption: this.get('chartOption'),
            container: this.get('container'),
            editable: this.get('editable'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.instance) {
            const { id, scaleX, scaleY, width, height, angle, editable, chartOption } = this;
            const zoom = this.canvas.getZoom();
            const left = this.calcCoords().tl.x;
            const top = this.calcCoords().tl.y;
            const padLeft = ((width * scaleX * zoom) - width) / 2;
            const padTop = ((height * scaleY * zoom) - height) / 2;
            this.element = fabric.util.makeElement('div', {
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
            this.instance = echarts.init(this.element);
            this.instance.setOption(chartOption);
            this.container.appendChild(this.element);
        }
    },
});

Chart.fromObject = (options: ChartObject, callback: (obj: ChartObject) => any) => {
    return callback(new Chart(options.chartOption, options));
};

export default Chart;
