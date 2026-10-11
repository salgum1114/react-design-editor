// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({ Space: (): null => null }));
vi.mock('../../canvas', () => ({}));
vi.mock('../../components/common', () => ({ CommonButton: (): null => null }));

import WorkflowToolbar from './WorkflowToolbar';

describe('WorkflowToolbar lifecycle', () => {
	it('detaches keyboard listeners after the canvas has been disposed', () => {
		const wrapper = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
		const instance: any = { canvas: { wrapperEl: wrapper } };
		const component = new WorkflowToolbar({ instance, zoomRatio: 1 });
		component.attachEventListener(instance);
		instance.canvas.wrapperEl = undefined;

		expect(() => component.componentWillUnmount()).not.toThrow();
		expect(wrapper.removeEventListener).toHaveBeenCalledWith('keydown', component.events.keydown);
	});
});
