import { fabric } from 'fabric';
import React, { Component, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { uuid } from 'uuidv4';
import { defaults } from './constants';
import Handler, { HandlerOptions } from './handlers/Handler';
import './styles/canvas.less';
import './styles/contextmenu.less';
import './styles/fabricjs.less';
import './styles/tooltip.less';
import { FabricCanvas } from './utils';

export interface CanvasInstance {
	handler: Handler;
	canvas: FabricCanvas;
	container: HTMLDivElement;
}

export type CanvasProps = HandlerOptions & {
	responsive?: boolean;
	style?: React.CSSProperties;
};

interface IState {
	id: string;
	loaded: boolean;
}

class InternalCanvas extends Component<CanvasProps, IState> implements CanvasInstance {
	public handler: Handler;
	public canvas: FabricCanvas;
	public container: HTMLDivElement;
	private containerRef = React.createRef<HTMLDivElement>();
	private resizeObserver: ResizeObserver;

	static defaultProps: CanvasProps = {
		id: uuid(),
		editable: true,
		zoomEnabled: true,
		minZoom: 30,
		maxZoom: 300,
		responsive: true,
		width: 0,
		height: 0,
	};

	state: IState = {
		id: uuid(),
		loaded: false,
	};

	componentDidMount() {
		const { editable, canvasOption, width, height, responsive, ...other } = this.props;
		const { id } = this.state;
		const mergedCanvasOption = Object.assign({}, defaults.canvasOption, canvasOption, {
			width,
			height,
			selection: (typeof canvasOption?.selection !== 'undefined' && canvasOption?.selection) || editable,
		});
		this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
		this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
		this.canvas.renderAll();
		this.container = this.containerRef.current;
		this.handler = new Handler({
			id,
			width,
			height,
			editable,
			canvas: this.canvas,
			container: this.containerRef.current,
			canvasOption: mergedCanvasOption,
			...other,
		});
		if (this.props.responsive) {
			this.createObserver();
		} else {
			this.handleLoad();
		}
	}

	componentDidUpdate(prevProps: CanvasProps) {
		if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
			this.handler.eventHandler.resize(this.props.width, this.props.height);
		}
		if (this.props.editable !== prevProps.editable) {
			this.handler.editable = this.props.editable;
		}
		if (this.props.responsive !== prevProps.responsive) {
			if (!this.props.responsive) {
				this.destroyObserver();
			} else {
				this.destroyObserver();
				this.createObserver();
			}
		}
		if (JSON.stringify(this.props.canvasOption) !== JSON.stringify(prevProps.canvasOption)) {
			this.handler.setCanvasOption(this.props.canvasOption);
		}
		if (JSON.stringify(this.props.keyEvent) !== JSON.stringify(prevProps.keyEvent)) {
			this.handler.setKeyEvent(this.props.keyEvent);
		}
		if (JSON.stringify(this.props.fabricObjects) !== JSON.stringify(prevProps.fabricObjects)) {
			this.handler.setFabricObjects(this.props.fabricObjects);
		}
		if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption)) {
			this.handler.setWorkareaOption(this.props.workareaOption);
		}
		if (JSON.stringify(this.props.guidelineOption) !== JSON.stringify(prevProps.guidelineOption)) {
			this.handler.setGuidelineOption(this.props.guidelineOption);
		}
		if (JSON.stringify(this.props.objectOption) !== JSON.stringify(prevProps.objectOption)) {
			this.handler.setObjectOption(this.props.objectOption);
		}
		if (JSON.stringify(this.props.gridOption) !== JSON.stringify(prevProps.gridOption)) {
			this.handler.setGridOption(this.props.gridOption);
		}
		if (JSON.stringify(this.props.propertiesToInclude) !== JSON.stringify(prevProps.propertiesToInclude)) {
			this.handler.setPropertiesToInclude(this.props.propertiesToInclude);
		}
		if (JSON.stringify(this.props.activeSelectionOption) !== JSON.stringify(prevProps.activeSelectionOption)) {
			this.handler.setActiveSelectionOption(this.props.activeSelectionOption);
		}
	}

	componentWillUnmount() {
		this.destroyObserver();
		this.handler.destroy();
	}

	createObserver = () => {
		this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			const { width = 0, height = 0 } = (entries[0] && entries[0].contentRect) || {};
			this.handler.eventHandler.resize(width, height);
			if (!this.state.loaded) {
				this.handleLoad();
			}
		});
		this.resizeObserver.observe(this.containerRef.current);
	};

	destroyObserver = () => {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	};

	handleLoad = () => {
		this.setState(
			{
				loaded: true,
			},
			() => {
				if (this.props.onLoad) {
					this.props.onLoad(this.handler, this.canvas);
				}
			},
		);
	};

	render() {
		const { style } = this.props;
		const { id } = this.state;
		return (
			<div
				ref={this.containerRef}
				id={id}
				className="rde-canvas"
				style={{ width: '100%', height: '100%', ...style }}
			>
				<canvas id={`canvas_${id}`} />
			</div>
		);
	}
}

const Canvas: React.FC<CanvasProps> = React.forwardRef<CanvasInstance, CanvasProps>((props, ref) => {
	const canvasRef = useRef<InternalCanvas>();
	React.useImperativeHandle(ref, () => ({
		handler: canvasRef.current.handler,
		canvas: canvasRef.current.canvas,
		container: canvasRef.current.container,
	}));
	return <InternalCanvas ref={canvasRef} {...props} />;
});

export default Canvas;
