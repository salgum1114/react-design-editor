const items = [
    {
        type: 'marker',
        header: 'Marker',
        items: [
            {
                key: 'default',
                type: 'itext',
                icon: {
                    prefix: 'fas',
                    name: 'map-marker-alt',
                },
                title: 'Marker',
                option: {
                    type: 'i-text',
                    text: '\uf3c5', // map-marker
                    fontFamily: 'Font Awesome 5 Free',
                    fontWeight: 900,
                    fontSize: 60,
                    width: 30,
                    height: 30,
                    editable: false,
                    name: 'New marker',
                },
            },
        ],
    },
    {
        type: 'text',
        header: 'Text',
        items: [
            {
                key: 'default',
                type: 'textbox',
                icon: {
                    prefix: 'fas',
                    name: 'font',
                },
                title: 'Text',
                option: {
                    type: 'textbox',
                    text: 'Input text',
                    name: 'New text',
                    fontSize: 32,
                },
            },
        ],
    },
    {
        type: 'image',
        header: 'Image',
        items: [
            {
                key: 'image',
                type: 'image',
                icon: {
                    prefix: 'fas',
                    name: 'image',
                },
                title: 'Image',
                option: {
                    type: 'image',
                    width: 160,
                    height: 160,
                    name: 'New image',
                    src: '/images/sample/transparentBg.png',
                },
            },
        ],
    },
    {
        type: 'shape',
        header: 'Shape',
        items: [
            {
                key: 'default-triangle',
                type: 'triangle',
                icon: {
                    prefix: 'fas',
                    name: 'image',
                },
                title: 'Triangle',
                option: {
                    type: 'triangle',
                    width: 30,
                    height: 30,
                    name: 'New shape',
                },
            },
            {
                key: 'default-rect',
                type: 'rect',
                icon: {
                    prefix: 'fas',
                    name: 'image',
                },
                title: 'Rectangle',
                option: {
                    type: 'rect',
                    width: 40,
                    height: 40,
                    name: 'New shape',
                },
            },
            {
                key: 'default-circle',
                type: 'circle',
                icon: {
                    prefix: 'fas',
                    name: 'circle',
                },
                title: 'Circle',
                option: {
                    type: 'circle',
                    radius: 30,
                    name: 'New shape',
                },
            },
        ],
    },
    {
        type: 'drawing',
        header: 'Drawing',
        items: [
            {
                key: 'polygon',
                type: 'polygon',
                icon: {
                    prefix: 'fas',
                    name: 'draw-polygon',
                },
                title: 'Polygon',
                option: {
                    type: 'polygon',
                },
            },
        ],
    },
    {
        type: 'dom_element',
        header: 'Dom Element',
        items: [
            {
                key: 'custom',
                type: 'dom_element',
                icon: {
                    prefix: 'fab',
                    name: 'html5',
                },
                title: 'Element',
                option: {
                    type: 'element',
                    width: 480,
                    height: 270,
                    name: 'New Element',
                    autoplay: true,
                    muted: true,
                    loop: true,
                },
            },
            {
                key: 'iframe',
                type: 'dom_element',
                icon: {
                    prefix: 'fas',
                    name: 'window-maximize',
                },
                title: 'IFrame',
                option: {
                    type: 'iframe',
                    width: 480,
                    height: 270,
                    name: 'New IFrame',
                    autoplay: true,
                    muted: true,
                    loop: true,
                },
            },
            {
                key: 'video',
                type: 'dom_element',
                icon: {
                    prefix: 'fas',
                    name: 'video',
                },
                title: 'Video',
                option: {
                    type: 'video',
                    width: 480,
                    height: 270,
                    name: 'New video',
                    autoplay: true,
                    muted: true,
                    loop: true,
                },
            },
        ],
    },
];

export default items;
