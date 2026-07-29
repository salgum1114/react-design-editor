import { CurvedLink, Link, OrthogonalLink } from '../../../canvas/objects';
import { getWorkflowCanvasTheme, type EditorTheme } from '../../../theme';

export default (theme: EditorTheme = 'dark') => {
	const canvasTheme = getWorkflowCanvasTheme(theme);
	const defaultOption = {
		fill: 'rgba(0, 0, 0, 0)',
		stroke: canvasTheme.linkColor,
		strokeWidth: 4,
		originStroke: canvasTheme.linkColor,
		action: {
			enabled: false,
		},
		tooltip: {
			enabled: true,
		},
		animation: {
			type: 'none',
		},
		userProperty: {},
		trigger: {
			enabled: false,
		},
	};

	return {
		link: {
			create: (fromNode: any, fromPort: any, toNode: any, toPort: any, option: any) =>
				new Link(fromNode, fromPort, toNode, toPort, {
					...defaultOption,
					...option,
				}),
		},
		curvedLink: {
			create: (fromNode: any, fromPort: any, toNode: any, toPort: any, option: any) =>
				new CurvedLink(fromNode, fromPort, toNode, toPort, {
					...defaultOption,
					...option,
				}),
		},
		orthogonalLink: {
			create: (fromNode: any, fromPort: any, toNode: any, toPort: any, option: any) =>
				new OrthogonalLink(fromNode, fromPort, toNode, toPort, {
					...defaultOption,
					...option,
				}),
		},
	};
};
