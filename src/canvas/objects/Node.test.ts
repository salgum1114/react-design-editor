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

		expect(serializeNodeThemeProperties({ get: key => values[key as keyof typeof values] })).toEqual(
			values,
		);
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
