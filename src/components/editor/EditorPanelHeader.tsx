import React from 'react';

interface EditorPanelHeaderProps {
	title: React.ReactNode;
	description?: React.ReactNode;
	eyebrow?: React.ReactNode;
	action?: React.ReactNode;
}

export default function EditorPanelHeader({ action, description, eyebrow, title }: EditorPanelHeaderProps) {
	return (
		<header className="rde-editor-panel-header">
			<div className="rde-editor-panel-header-copy">
				{eyebrow ? <span className="rde-editor-panel-eyebrow">{eyebrow}</span> : null}
				<strong className="rde-editor-panel-title">{title}</strong>
				{description ? <span className="rde-editor-panel-description">{description}</span> : null}
			</div>
			{action ? <div className="rde-editor-panel-header-action">{action}</div> : null}
		</header>
	);
}
