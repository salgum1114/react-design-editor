import metadata from '../../../libs/fontawesome-5.2.0/metadata/icons.json';

import { NODE_COLORS } from '../constant/constants';
import ActionNode from './action/ActionNode';
import DataNode from './data/DataNode';
import FilterNode from './logic/FilterNode';
import LogicNode from './logic/LogicNode';
import SwitchNode from './logic/SwitchNode';
import TriggerNode from './trigger/TriggerNode';
import VirtualButtonNode from './trigger/VirtualButtonNode';

const defaultOption = {
	superType: 'node',
	fill: '#20262e',
	stroke: '#5f646b',
	borderColor: '#2d7cfa',
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

const NODES: Record<string, { create: (option: any, descriptor: any) => any }> = {
	ACTION: {
		create: (option, descriptor) =>
			new ActionNode({
				...defaultOption,
				...option,
				descriptor,
			}),
	},
	DATA: {
		create: (option, descriptor) =>
			new DataNode({
				...defaultOption,
				...option,
				descriptor,
			}),
	},
	LOGIC: {
		create: (option, descriptor) => {
			const options = Object.assign({}, defaultOption, { descriptor }, option);
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
			const options = Object.assign({}, defaultOption, { descriptor }, option);
			switch (descriptor.nodeClazz) {
				case 'VirtualButtonNode':
					return new VirtualButtonNode(options);
				default:
					return new TriggerNode(options);
			}
		},
	},
};

export default (descriptors: Record<string, any[]>) =>
	Object.keys(descriptors).reduce<Record<string, { create: (option: any) => any }>>((prev, key) => {
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
								{ ...option, icon, color: NODE_COLORS[descriptorType].fill },
								descriptor,
							);
						},
					},
				});
			}, {}),
		);
	}, {});
