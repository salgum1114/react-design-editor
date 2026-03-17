import React from 'react';
import ReactDOM from 'react-dom';
import { FabricObject } from '../models';

export type ContextMenuState = null | {
	x: number;
	y: number;
	placement: 'left' | 'right';
	content: React.ReactNode;
	target?: FabricObject | null;
};

const ContextMenuPortal: React.FC<{
	contextmenu: ContextMenuState;
}> = ({ contextmenu }) => {
	return ReactDOM.createPortal(
		<div
			className={`rde-contextmenu ${!contextmenu ? 'contextmenu-hidden' : ''}`}
			style={{
				left: contextmenu?.x ?? 0,
				top: contextmenu?.y ?? 0,
				position: 'fixed',
			}}
		>
			{contextmenu && (
				<div className={contextmenu.placement === 'left' ? 'rde-contextmenu-left' : 'rde-contextmenu-right'}>
					{contextmenu.content}
				</div>
			)}
		</div>,
		document.body,
	);
};

export default ContextMenuPortal;
