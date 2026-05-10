import i18n from 'i18next';

export const NODE_COLORS = {
	TRIGGER: {
		fill: '#2bd99f',
		border: '#2bd99f',
	},
	LOGIC: {
		fill: '#b251e6',
		border: '#b251e6',
	},
	DATA: {
		fill: '#4d96ff',
		border: '#4d96ff',
	},
	ACTION: {
		fill: '#ffb340',
		border: '#ffb340',
	},
} as const;

export const OUT_PORT_TYPE = {
	SINGLE: 'SINGLE',
	STATIC: 'STATIC',
	DYNAMIC: 'DYNAMIC',
	BROADCAST: 'BROADCAST',
} as const;

export const DESCRIPTIONS = {
	script: i18n.t('common.name'),
	template: i18n.t('common.name'),
	json: i18n.t('common.name'),
	cron: i18n.t('common.name'),
};
