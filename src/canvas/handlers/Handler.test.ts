import { describe, expect, it, vi } from 'vitest';

import { resolveFabricObjectType } from './resolveFabricObjectType';

describe('Handler object factory resolution', () => {
	it('uses nodeClazz when a serialized workflow node has a base Fabric type', () => {
		const create = vi.fn();

		const objectType = resolveFabricObjectType(
			{
				TimerNode: { create },
			},
			{
				nodeClazz: 'TimerNode',
				superType: 'node',
				type: 'TriggerNode',
			},
		);

		expect(objectType).toBe('TimerNode');
	});
});
