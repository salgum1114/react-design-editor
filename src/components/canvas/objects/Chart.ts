import { fabric } from 'fabric';
import ChartJS from 'chart.js';

const Chart = fabric.util.createClass(fabric.Object, {
    type: 'chart',
    superType: 'chart',
    instance: null,
    H_PADDING: 20,
    V_PADDING: 50,
    originX: 'left',
    originY: 'top',
    initialize(options: any) {
        options = options || {};
        this.callSuper('initialize', options);
    },
    createImage() {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = this.width;
        canvasEl.height = this.height;
        const ctx = canvasEl.getContext('2d');
        const instance = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow'],
                datasets: [{
                    label: '# of Votes',
                    data: Array.from({ length: 3 }, () => Math.random() * 20),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1,
                }],
            },
            options: {
                maintainAspectRatio: false,
                responsive: false,
                aspectRatio: 0.25,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        },
                    }],
                },
                layout: {
                    padding: {
                        left: 30,
                        right: 30,
                        top: 30,
                        bottom: 30,
                    },
                },
            },
        });
        setTimeout(() => {
            this.image = new Image();
            this.image.src = instance.toBase64Image();
        }, 1000);
    },
    createChart() {

    },
    _render(ctx: any) {
        this.callSuper('_render', ctx);
        ctx.save();
        const { editable } = this;
        // if (editable) {
        //     if (this.image) {
        //         ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        //     } else {
        //         this.createImage();
        //     }
        // } else {
        const zoom = this.canvas.getZoom() || 1;
        if (!this.instance) {
            ctx.canvas.width = (this.width * 1.37) * this.scaleX * zoom;
            ctx.canvas.height = (this.height * 1.37) * this.scaleY * zoom;
            this.instance = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow'],
                    datasets: [{
                        label: '# of Votes',
                        data: Array.from({ length: 3 }, () => Math.random() * 20),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                        ],
                        borderWidth: 1,
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: false,
                    aspectRatio: 0.25,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                        }],
                    },
                    layout: {
                        padding: {
                            left: 30,
                            right: 30,
                            top: 30,
                            bottom: 30,
                        },
                    },
                },
            });
            ctx.canvas.width = (this.width * 1.37) * this.scaleX * zoom;
            ctx.canvas.height = (this.height * 1.37) * this.scaleY * zoom;
        } else {
            ctx.canvas.width = (this.width * 1.37) * this.scaleX * zoom;
            ctx.canvas.height = (this.height * 1.37) * this.scaleY * zoom;
            this.instance.width = (this.width * 1.37) * this.scaleX * zoom;
            this.instance.height = (this.height * 1.37) * this.scaleY * zoom;
            this.instance.data.datasets[0].data = Array.from({ length: 3 }, () => Math.random() * 20);
            this.instance.update();
        }
        // }
    },
});

export default Chart;
