import Link from './Link';
import CurvedLink from './CurvedLink';
import OrthogonalLink from './OrthogonalLink';

const defaultOptions = {
    fill: 'rgba(0, 0, 0, 0)',
    stroke: 'rgb(95, 106, 106)',
    originStroke: 'rgb(95, 106, 106)',
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
        create: (fromNode, fromPort, toNode, toPort, option) => new Link(fromNode, fromPort, toNode, toPort, {
            ...defaultOptions,
            ...option,
        }),
    },
    CurvedLink: {
        create: (fromNode, fromPort, toNode, toPort, option) => new CurvedLink(fromNode, fromPort, toNode, toPort, {
            ...defaultOptions,
            ...option,
        }),
    },
    OrthogonalLink: {
        create: (fromNode, fromPort, toNode, toPort, option) => new OrthogonalLink(fromNode, fromPort, toNode, toPort, {
            ...defaultOptions,
            ...option,
        }),
    },
};
