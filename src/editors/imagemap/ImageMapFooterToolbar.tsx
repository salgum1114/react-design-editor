import { Space, Switch, Tooltip } from 'antd';
import React from 'react';

import i18next from 'i18next';
import type { CanvasInstance } from '../../canvas';
import { code } from '../../canvas/constants';
import CommonButton from '../../components/common/CommonButton';

interface ImageMapFooterToolbarProps {
	canvasRef?: CanvasInstance | null;
	preview?: boolean;
	onChangePreview?: (checked: boolean) => void;
	zoomRatio?: number;
}

export default function ImageMapFooterToolbar({
	canvasRef,
	onChangePreview,
	preview = false,
	zoomRatio = 1,
}: ImageMapFooterToolbarProps) {
	const [interactionMode, setInteractionMode] = React.useState<'selection' | 'grab'>('selection');

	React.useEffect(() => {
		if (!canvasRef?.canvas?.wrapperEl) {
			const timeoutId = window.setTimeout(() => {
				if (canvasRef?.canvas?.wrapperEl) {
					canvasRef.canvas.wrapperEl.focus?.();
				}
			}, 5);
			return () => window.clearTimeout(timeoutId);
		}

		const handleSelection = () => {
			if (canvasRef.handler.interactionHandler.isDrawingMode()) {
				return;
			}
			canvasRef.handler.interactionHandler.selection();
			setInteractionMode('selection');
		};

		const handleGrab = () => {
			if (canvasRef.handler.interactionHandler.isDrawingMode()) {
				return;
			}
			canvasRef.handler.interactionHandler.grab();
			setInteractionMode('grab');
		};

		const handleKeydown = (event: KeyboardEvent) => {
			if (canvasRef.canvas.wrapperEl !== document.activeElement) {
				return;
			}

			if (event.code === code.KEY_Q) {
				handleSelection();
			} else if (event.code === code.KEY_W) {
				handleGrab();
			}
		};

		canvasRef.canvas.wrapperEl.addEventListener('keydown', handleKeydown, false);

		return () => {
			canvasRef.canvas.wrapperEl.removeEventListener('keydown', handleKeydown);
		};
	}, [canvasRef]);

	if (!canvasRef) {
		return null;
	}

	const handleSelection = () => {
		if (canvasRef.handler.interactionHandler.isDrawingMode()) {
			return;
		}
		canvasRef.handler.interactionHandler.selection();
		setInteractionMode('selection');
	};

	const handleGrab = () => {
		if (canvasRef.handler.interactionHandler.isDrawingMode()) {
			return;
		}
		canvasRef.handler.interactionHandler.grab();
		setInteractionMode('grab');
	};

	const zoomValue = parseInt((zoomRatio * 100).toFixed(2), 10);

	return (
		<React.Fragment>
			<div className="rde-editor-footer-toolbar-interaction">
				<Space.Compact>
					<CommonButton
						type={interactionMode === 'selection' ? 'primary' : 'default'}
						style={{ borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px' }}
						onClick={handleSelection}
						icon="mouse-pointer"
						tooltipTitle={i18next.t('action.selection')}
					/>
					<CommonButton
						type={interactionMode === 'grab' ? 'primary' : 'default'}
						style={{ borderBottomRightRadius: '8px', borderTopRightRadius: '8px' }}
						onClick={handleGrab}
						tooltipTitle={i18next.t('action.grab')}
						icon="hand-rock"
					/>
				</Space.Compact>
			</div>
			<div className="rde-editor-footer-toolbar-zoom">
				<Space.Compact>
					<CommonButton
						style={{ borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px' }}
						onClick={() => {
							canvasRef.handler.zoomHandler.zoomOut();
						}}
						icon="search-minus"
						tooltipTitle={i18next.t('action.zoom-out')}
					/>
					<CommonButton
						onClick={() => {
							canvasRef.handler.zoomHandler.zoomOneToOne();
						}}
						tooltipTitle={i18next.t('action.one-to-one')}
					>
						{`${zoomValue}%`}
					</CommonButton>
					<CommonButton
						onClick={() => {
							canvasRef.handler.zoomHandler.zoomToFit();
						}}
						tooltipTitle={i18next.t('action.fit')}
						icon="expand"
					/>
					<CommonButton
						style={{ borderBottomRightRadius: '8px', borderTopRightRadius: '8px' }}
						onClick={() => {
							canvasRef.handler.zoomHandler.zoomIn();
						}}
						icon="search-plus"
						tooltipTitle={i18next.t('action.zoom-in')}
					/>
				</Space.Compact>
			</div>
			<div className="rde-editor-footer-toolbar-preview">
				<Tooltip title={i18next.t('action.preview')}>
					<Switch checked={preview} onChange={onChangePreview} />
				</Tooltip>
			</div>
		</React.Fragment>
	);
}
