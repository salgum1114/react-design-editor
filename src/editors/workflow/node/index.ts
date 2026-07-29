import metadata from '../../../libs/fontawesome-5.2.0/metadata/icons.json';
import { getWorkflowCanvasTheme, type EditorTheme } from '../../../theme';

import { NODE_COLORS } from '../constant/constants';
import ActionNode from './action/ActionNode';
import DataNode from './data/DataNode';
import FilterNode from './logic/FilterNode';
import LogicNode from './logic/LogicNode';
import SwitchNode from './logic/SwitchNode';
import TriggerNode from './trigger/TriggerNode';
import VirtualButtonNode from './trigger/VirtualButtonNode';

const NODES: Record<string, { create: (option: any, descriptor: any) => any }> = {
	ACTION: {
		create: (option, descriptor) =>
			new ActionNode({
				...option,
				descriptor,
			}),
	},
	DATA: {
		create: (option, descriptor) =>
			new DataNode({
				...option,
				descriptor,
			}),
	},
	LOGIC: {
		create: (option, descriptor) => {
			const options = Object.assign({}, { descriptor }, option);
			switch (descriptor.nodeClazz) {
				case 'FilterNode':
					return new FilterNode(options);
				case 'SwitchNode':
					return new SwitchNode(options);
				default:
					return new LogicNode(options);
			}
		},
	},
	TRIGGER: {
		create: (option, descriptor) => {
			const options = Object.assign({}, { descriptor }, option);
			switch (descriptor.nodeClazz) {
				case 'VirtualButtonNode':
					return new VirtualButtonNode(options);
				default:
					return new TriggerNode(options);
			}
		},
	},
};

export default (descriptors: Record<string, any[]>, theme: EditorTheme = 'dark') => {
	const canvasTheme = getWorkflowCanvasTheme(theme);
	const defaultOption = {
		superType: 'node',
		fill: canvasTheme.nodeFill,
		stroke: canvasTheme.nodeStroke,
		labelColor: canvasTheme.nodeTextColor,
		portFill: canvasTheme.portFill,
		actionButtonColor: canvasTheme.actionButtonColor,
		actionButtonIconColor: canvasTheme.actionButtonIconColor,
		routeFill: canvasTheme.routeFill,
		routeStroke: canvasTheme.routeStroke,
		routeTextColor: canvasTheme.routeTextColor,
		borderColor: canvasTheme.selectionBorderColor,
		borderScaleFactor: 1.5,
		deletable: true,
		cloneable: true,
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

	return Object.keys(descriptors).reduce<Record<string, { create: (option: any) => any }>>((prev, key) => {
		return Object.assign(
			prev,
			descriptors[key].reduce((nextMap, descriptor) => {
				return Object.assign(nextMap, {
					[descriptor.nodeClazz]: {
						create: (option: any) => {
							const descriptorType = descriptor.type as keyof typeof NODES & keyof typeof NODE_COLORS;
							const iconMetadata = (metadata as Record<string, any>)[descriptor.icon];
							const icon = iconMetadata
								? String.fromCodePoint(parseInt(iconMetadata.unicode, 16))
								: '\uf03e';
							return NODES[descriptorType].create(
								{ ...defaultOption, ...option, icon, color: NODE_COLORS[descriptorType].fill },
								descriptor,
							);
						},
					},
				});
			}, {}),
		);
	}, {});
};
