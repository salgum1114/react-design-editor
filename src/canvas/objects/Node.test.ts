// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import * as nodeModule from './Node';
import Node from './Node';

describe('workflow node serialization', () => {
	it('preserves theme presentation values used by Fabric cloning', () => {
		const serializeNodeThemeProperties = (
			nodeModule as typeof nodeModule & {
				serializeNodeThemeProperties?: (node: { get(key: string): unknown }) => Record<string, unknown>;
			}
		).serializeNodeThemeProperties;
		expect(serializeNodeThemeProperties).toBeTypeOf('function');
		if (!serializeNodeThemeProperties) {
			return;
		}

		const values = {
			actionButtonColor: '#E8F0F4',
			actionButtonIconColor: '#0F8F77',
			labelColor: '#172A2D',
			portFill: '#8A99A6',
			routeFill: '#F7FAFC',
			routeStroke: '#D7E0E7',
			routeTextColor: '#172A2D',
		};

		expect(serializeNodeThemeProperties({ get: key => values[key as keyof typeof values] })).toEqual(values);
	});
});

describe('workflow node ports', () => {
	it('uses the theme color while disconnected and the node color while connected', () => {
		const options = Node.prototype.defaultPortOption.call({
			color: '#2BD99F',
			id: 'timer-node',
			portFill: '#5F646B',
		} as Node);

		expect(options).toMatchObject({
			connectedFill: '#2BD99F',
			fill: '#5F646B',
			originFill: '#5F646B',
			stroke: '#5F646B',
		});
	});
});

describe('workflow node coordinates', () => {
	it('uses Fabric 7 center origins for new nodes', () => {
		const node = new Node({
			fill: '#ffffff',
			left: 320,
			name: 'Centered node',
			stroke: '#000000',
			top: 180,
		} as any);
		expect(node.originX).toBe('center');
		expect(node.originY).toBe('center');
		expect(node.getCenterPoint()).toMatchObject({ x: 320, y: 180 });
	}, 20_000);

	it('keeps the icon and label aligned inside the centered node body', () => {
		const node = new Node({
			color: '#a855f7',
			descriptor: { outPortType: 'NONE' },
			fill: '#ffffff',
			icon: '\uf0b0',
			name: 'Filter',
			stroke: '#000000',
		} as any);
		const { label, nodeIcon, rect } = node;

		expect(nodeIcon.originX).toBe('center');
		expect(nodeIcon.originY).toBe('center');
		expect(nodeIcon.getObjects()[0]).toMatchObject({ height: 48, width: 48 });
		expect(nodeIcon.width).toBeLessThan(50);
		expect(nodeIcon.height).toBeLessThan(50);
		const [iconBox, icon] = nodeIcon.getObjects().map(child => child.getRelativeCenterPoint());
		expect(icon.x).toBeCloseTo(iconBox.x);
		expect(icon.y).toBeCloseTo(iconBox.y);
		expect(nodeIcon.left - nodeIcon.width / 2).toBeCloseTo(rect.left - rect.width / 2 + 8);
		expect(nodeIcon.top - nodeIcon.height / 2).toBeCloseTo(rect.top - rect.height / 2 + 7);
		expect(label.originX).toBe('center');
		expect(label.originY).toBe('center');
		expect(label.left - label.width / 2).toBeCloseTo(nodeIcon.left + nodeIcon.width / 2 + 10);
		expect(label.top).toBeCloseTo(rect.top);
	}, 20_000);

	it('aligns optional node decorations to the centered body edges', () => {
		const node = new Node({
			color: '#a855f7',
			descriptor: { actionButton: true, outPortType: 'NONE' },
			errors: [{ message: 'Invalid configuration' }],
			fill: '#ffffff',
			icon: '\uf0b0',
			name: 'Filter',
			stroke: '#000000',
		} as any);
		const { button, errorFlag, rect } = node;

		expect(errorFlag.left - errorFlag.width / 2).toBeCloseTo(rect.left - rect.width / 2);
		expect(errorFlag.top - errorFlag.height / 2).toBeCloseTo(rect.top - rect.height / 2);
		const [errorBox, errorIcon] = errorFlag.getObjects().map(child => child.getRelativeCenterPoint());
		expect(errorIcon.x).toBeCloseTo(errorBox.x);
		expect(errorIcon.y).toBeCloseTo(errorBox.y);
		expect(button).toBeDefined();
		const [buttonBox, buttonIcon] = button!.getObjects().map(child => child.getRelativeCenterPoint());
		expect(buttonIcon.x).toBeCloseTo(buttonBox.x);
		expect(buttonIcon.y).toBeCloseTo(buttonBox.y);
		expect(button!.left + button!.width / 2).toBeCloseTo(rect.left + rect.width / 2 + 1);
		expect(button!.top).toBeCloseTo(rect.top + 1);
	}, 20_000);

	it('keeps a renamed label aligned with the icon and body center', () => {
		const node = new Node({
			color: '#a855f7',
			descriptor: { outPortType: 'NONE' },
			fill: '#ffffff',
			icon: '\uf0b0',
			name: 'Filter',
			stroke: '#000000',
		} as any);
		const context = document.createElement('canvas').getContext('2d')!;
		node.canvas = { getContext: () => context } as any;

		node.setName('Renamed filter node');

		expect(node.label.left - node.label.width / 2).toBeCloseTo(node.nodeIcon.left + node.nodeIcon.width / 2 + 10);
		expect(node.label.top).toBeCloseTo(node.rect.top);
	}, 20_000);
});
