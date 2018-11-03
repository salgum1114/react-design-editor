export default {
    scheduleType: {
        type: 'select',
        icon: '',
        label: 'ScheduleType',
        items: [
            {
                label: 'SIMPLE_INTERVAL',
                value: 'SIMPLE_INTERVAL',
                forms: {
                    timeUnit: {
                        type: 'select',
                        icon: '',
                        label: 'TimeUnit',
                        items: [
                            {
                                label: 'MILLISECONDS',
                                value: 'MILLISECONDS',
                            },
                            {
                                label: 'SECONDS',
                                value: 'SECONDS',
                            },
                            {
                                label: 'MINUTES',
                                value: 'MINUTES',
                            },
                            {
                                label: 'HOURS',
                                value: 'HOURS',
                            },
                            {
                                label: 'DAYS',
                                value: 'DAYS',
                            },
                        ],
                    },
                    interval: {
                        type: 'number',
                        required: true,
                        icon: '',
                        label: 'Interval',
                        min: 0,
                        max: 600000,
                    },
                },
            },
        ],
    },
};
