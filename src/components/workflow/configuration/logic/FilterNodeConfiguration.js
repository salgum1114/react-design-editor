import i18n from 'i18next';

export default {
    jsScript: {
        type: 'script',
        required: true,
        icon: '',
        label: 'JSscript',
        span: 24,
        rules: [
            { min: 1, required: true, message: i18n.t('validation.min-length-arg', { min: 1 }) },
        ],
    },
};
