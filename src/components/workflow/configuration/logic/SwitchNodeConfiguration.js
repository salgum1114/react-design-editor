import i18n from 'i18next';

export default {
    routes: {
        type: 'tags',
        required: true,
        icon: '',
        label: 'Routes',
        span: 24,
        rules: [
            { required: true, message: i18n.t('validation.min-count-arg', { arg: 1 }) },
        ],
    },
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