export interface HandlerOptions {
    canvas: fabric.Canvas;
}

class Handler {
    public canvas: fabric.Canvas;

    constructor(options: HandlerOptions) {
        const { canvas } = options;
        this.canvas = canvas;
    }
}

export default Handler;
