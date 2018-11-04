import MarkerProperty from './MarkerProperty';
import GeneralProperty from './GeneralProperty';
import StyleProperty from './StyleProperty';
import TooltipProperty from './TooltipProperty';
import ImageProperty from './ImageProperty';
import TextProperty from './TextProperty';
import MapProperty from './MapProperty';
import ActionProperty from './ActionProperty';
import VideoProperty from './VideoProperty';
import ElementProperty from './ElementProperty';
import IFrameProperty from './IFrameProperty';
import AnimationProperty from './AnimationProperty';
import ShadowProperty from './ShadowProperty';
import UserProperty from './UserProperty';
import TriggerProperty from './TriggerProperty';

export default {
    map: {
        map: {
            title: 'Map',
            component: MapProperty,
        },
        image: {
            title: 'Image',
            component: ImageProperty,
        },
    },
    group: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    'i-text': {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        marker: {
            title: 'Marker',
            component: MarkerProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        trigger: {
            title: 'Trigger',
            component: TriggerProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    textbox: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        text: {
            title: 'Text',
            component: TextProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    image: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        image: {
            title: 'Image',
            component: ImageProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    triangle: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    rect: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    circle: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    polygon: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        trigger: {
            title: 'Trigger',
            component: TriggerProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    line: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        action: {
            title: 'Action',
            component: ActionProperty,
        },
        tooltip: {
            title: 'Tooltip',
            component: TooltipProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
        animation: {
            title: 'Animation',
            component: AnimationProperty,
        },
        userProperty: {
            title: 'User Property',
            component: UserProperty,
        },
    },
    video: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        video: {
            title: 'Video',
            component: VideoProperty,
        },
    },
    element: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        video: {
            title: 'Element',
            component: ElementProperty,
        },
    },
    iframe: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        video: {
            title: 'IFrame',
            component: IFrameProperty,
        },
    },
};
