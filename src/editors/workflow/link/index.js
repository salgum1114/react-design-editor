import { CurvedLink, Link, OrthogonalLink } from '../../../canvas/objects';

const defaultOption = {
	fill: 'rgba(0, 0, 0, 0)',
	stroke: '#c3c9d5',
	strokeWidth: 4,
	originStroke: '#c3c9d5',
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

export default {
	link: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new Link(fromNode, fromPort, toNode, toPort, {
				...defaultOption,
				...option,
			}),
	},
	curvedLink: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new CurvedLink(fromNode, fromPort, toNode, toPort, {
				...defaultOption,
				...option,
			}),
	},
	orthogonalLink: {
		create: (fromNode, fromPort, toNode, toPort, option) =>
			new OrthogonalLink(fromNode, fromPort, toNode, toPort, {
				...defaultOption,
				...option,
			}),
	},
};
