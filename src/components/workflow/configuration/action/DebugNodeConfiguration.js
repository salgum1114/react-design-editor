export default {
    loggingLevel: {
        type: 'select',
        required: true,
        icon: '',
        label: 'LoggingLevel',
        span: 12,
        items: [
            {
                label: 'DEBUG',
                value: 'DEBUG',
            },
            {
                label: 'INFO',
                value: 'INFO',
            },
            {
                label: 'WARN',
                value: 'WARN',
            },
            {
                label: 'ERROR',
                value: 'ERROR',
            },
        ],
    },
    messageTemplate: {
        type: 'template',
        required: false,
        icon: '',
        label: 'MessageTemplate',
        span: 24,
    },
};
