export default {
    keyTemplate: {
        type: 'template',
        icon: '',
        label: 'KeyTemplate',
    },
    operation: {
        type: 'select',
        icon: '',
        label: 'Operation',
        items: [
            {
                label: 'INCREMENT',
                value: 'INCREMENT',
            },
            {
                label: 'DECREMENT',
                value: 'DECREMENT',
            },
            {
                label: 'RESET',
                value: 'RESET',
            },
        ],
    },
    valueTemplate: {
        type: 'template',
        icon: '',
        label: 'ValueTemplate',
    },
};
