// @vitest-environment jsdom

import * as fabric from 'fabric';
import { describe, expect, it } from 'vitest';

import Link from './Link';

const calculateDetour = (sourceX: number, targetX: number, sourcePortX = sourceX) => {
	const fromNode = new fabric.Rect({
		height: 60,
		left: sourceX,
		strokeWidth: 0,
		top: 200,
		width: 240,
	});
	const toNode = new fabric.Rect({
		height: 60,
		left: targetX,
		strokeWidth: 0,
		top: 70,
		width: 240,
	});
	const fromPort = { height: 0, left: sourcePortX, strokeWidth: 0, top: 230, width: 0 };
	const toPort = { height: 0, left: targetX, strokeWidth: 0, top: 100, width: 0 };
	return new Link(fromNode as any, fromPort as any, toNode as any, toPort as any, {
		stroke: '#94a3b8',
	}).calculatePath(fromPort as any, toPort as any);
};

describe('workflow link routing', () => {
	it('keeps the left detour 40px outside a center-origin source', () => {
		expect(calculateDetour(400, 800).midX).toBe(240);
	});

	it('keeps the right detour 40px outside a center-origin source', () => {
		expect(calculateDetour(800, 400).midX).toBe(960);
	});

	it('uses the node boundary for an offset SwitchNode output port', () => {
		const geometry = calculateDetour(400, 800, 320);

		expect(geometry.path).toMatch(/^M 320 /);
		expect(geometry.midX).toBe(240);
	});
});
