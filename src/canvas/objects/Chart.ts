import * as echarts from 'echarts';
import { fabric } from 'fabric';
import { FabricElement } from '../models';
import { createDOMElement, registerFabricClass, resolveFromObject, toObject } from '../utils';

export interface ChartObject extends FabricElement {
	setSource: (source: echarts.EChartOption) => void;
	setChartOption: (chartOption: echarts.EChartOption) => void;
	chartOption: echarts.EChartOption;
	instance: echarts.ECharts;
}

class Chart extends fabric.Rect {
	static type = 'chart';
	superType = 'element';
	hasRotatingPoint = false;
	declare element: HTMLDivElement;
	declare container: string;
	declare chartOption: echarts.EChartOption;
	declare instance: echarts.ECharts;

	constructor(chartOption: echarts.EChartOption, options: any = {}) {
		super(options);
		this.set({
			chartOption,
			fill: 'rgba(255, 255, 255, 0)',
			stroke: 'rgba(255, 255, 255, 0)',
		});
	}

	setSource(source: echarts.EChartOption | string) {
		if (typeof source === 'string') {
			this.setChartOptionStr(source);
		} else {
			this.setChartOption(source);
		}
	}

	setChartOptionStr(chartOptionStr: string) {
		this.set({ chartOptionStr });
	}

	setChartOption(chartOption: echarts.EChartOption) {
		this.set({ chartOption });
		this.distroyChart();
		this.createChart(chartOption);
	}

	createChart(chartOption: echarts.EChartOption) {
		this.instance = echarts.init(this.element);
		if (!chartOption) {
			this.instance.setOption({
				xAxis: {},
				yAxis: {},
				series: [{ type: 'line', data: [[0, 1], [1, 2], [2, 3], [3, 4]] }],
			});
		} else {
			this.instance.setOption(chartOption);
		}
	}

	distroyChart() {
		if (this.instance) {
			this.instance.dispose();
		}
	}

	toObject(propertiesToInclude: string[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			chartOption: this.get('chartOption'),
			container: this.get('container'),
			editable: this.get('editable'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		if (!this.instance) {
			const { id, scaleX, scaleY, width, height, angle, editable, chartOption } = this;
			const zoom = this.canvas.getZoom();
			const left = this.calcCoords().tl.x;
			const top = this.calcCoords().tl.y;
			const padLeft = (width * scaleX * zoom - width) / 2;
			const padTop = (height * scaleY * zoom - height) / 2;
			this.element = createDOMElement('div', {
				id: `${id}_container`,
				style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left + padLeft}px;
                        top: ${top + padTop}px;
                        position: absolute;
                        user-select: ${editable ? 'none' : 'auto'};
                        pointer-events: ${editable ? 'none' : 'auto'};`,
			});
			this.createChart(chartOption);
			document.getElementById(this.container)?.appendChild(this.element);
		}
	}

	static fromObject(options: ChartObject, callback?: (obj: ChartObject) => any) {
		return resolveFromObject(new Chart(options.chartOption, options), callback);
	}
}

registerFabricClass('Chart', Chart);

export default Chart;
