import { describe, expect, it } from 'vitest';

import { INSPECTOR_FORM_PROPS } from './inspector.model';

describe('INSPECTOR_FORM_PROPS', () => {
	it('keeps inspector forms vertical and consistently classed', () => {
		expect(INSPECTOR_FORM_PROPS).toEqual({
			className: 'rde-inspector-form',
			colon: false,
			layout: 'vertical',
		});
	});
});
