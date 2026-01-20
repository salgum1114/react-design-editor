import React from 'react';
import ReactDOM from 'react-dom';

export type TooltipState = null | {
	x: number;
	y: number;
	placement: 'left' | 'right';
	content: React.ReactNode;
	measuring?: boolean;
};

export type TooltipBox = { width: number; height: number };

const TooltipPortal: React.FC<{
	tooltip: TooltipState;
	onMeasured?: (box: TooltipBox) => void;
}> = ({ tooltip, onMeasured }) => {
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		if (!tooltip) return;
		if (!wrapperRef.current) return;

		const w = wrapperRef.current.offsetWidth;
		const h = wrapperRef.current.offsetHeight;

		if (w > 0 && h > 0) onMeasured?.({ width: w, height: h });
	}, [tooltip?.content, tooltip?.placement, tooltip?.measuring]);

	return ReactDOM.createPortal(
		<div
			ref={wrapperRef}
			className={`rde-tooltip ${!tooltip ? 'tooltip-hidden' : ''}`}
			style={{
				left: tooltip?.x ?? 0,
				top: tooltip?.y ?? 0,
				visibility: tooltip?.measuring ? 'hidden' : 'visible',
				position: 'fixed',
			}}
		>
			{tooltip && (
				<div className={tooltip.placement === 'left' ? 'rde-tooltip-left' : 'rde-tooltip-right'}>
					{tooltip.content}
				</div>
			)}
		</div>,
		document.body,
	);
};

export default TooltipPortal;
