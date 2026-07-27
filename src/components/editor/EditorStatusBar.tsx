import React from 'react';

interface EditorStatusBarProps {
	left?: React.ReactNode;
	center?: React.ReactNode;
	right?: React.ReactNode;
}

export default function EditorStatusBar({ center, left, right }: EditorStatusBarProps) {
	return (
		<footer className="rde-editor-statusbar">
			<div className="rde-editor-statusbar-section left">{left}</div>
			<div className="rde-editor-statusbar-section center">{center}</div>
			<div className="rde-editor-statusbar-section right">{right}</div>
		</footer>
	);
}
