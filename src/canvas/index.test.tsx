// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import * as editor from './index';

describe('public Fabric runtime', () => {
	it('exposes the classes and registry used by RDE objects', async () => {
		expect(editor.fabric).toBeDefined();
		const { fabric, Port } = editor;
		const port = new Port({ width: 10, height: 10 });
		expect(port).toBeInstanceOf(fabric.Rect);
		expect(fabric.classRegistry.getClass('Port')).toBe(Port);

		class CustomRect extends fabric.Rect {
			static type = 'PublicRuntimeCustomRect';
		}
		fabric.classRegistry.setClass(CustomRect);
		try {
			const [restored] = await fabric.util.enlivenObjects<CustomRect>([
				new CustomRect({ width: 20, height: 30 }).toObject(),
			]);
			expect(restored).toBeInstanceOf(CustomRect);
			expect(restored.width).toBe(20);
			expect(restored.height).toBe(30);
		} finally {
			fabric.classRegistry.json.delete(CustomRect.type);
			fabric.classRegistry.json.delete(CustomRect.type.toLowerCase());
		}
	});
});
