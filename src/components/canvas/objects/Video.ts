import { fabric } from 'fabric';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';

declare class MediaElementPlayer {
    constructor(id: string, options: {
        pauseOtherPlayers: boolean,
        videoWidth: string,
        videoHeight: string,
        success: (mediaeElement: any, originalNode: any, instance: any) => void,
    });
}

import { toObject, FabricElement } from '../utils';

export interface VideoObject extends FabricElement {
    setSource: (source: string | File) => void;
    setFile: (file: File) => void;
    setSrc: (src: string) => void;
    file?: File;
    src?: string;
    videoElement?: HTMLVideoElement;
    player?: any;
}

const Video = fabric.util.createClass(fabric.Rect, {
    type: 'video',
    superType: 'element',
    hasRotatingPoint: false,
    initialize(source: string | File, options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        if (source instanceof File) {
            this.set({
                file: source,
                src: null,
            });
        } else {
            this.set({
                file: null,
                src: source,
            });
        }
        this.set({
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(255, 255, 255, 0)',
        });
    },
    setSource(source: any) {
        if (source instanceof File) {
            this.setFile(source);
        } else {
            this.setSrc(source);
        }
    },
    setFile(file: File) {
        this.set({
            file,
            src: null,
        });
        const reader = new FileReader();
        reader.onload = e => {
            this.player.setSrc(e.target.result);
        };
        reader.readAsDataURL(file);
    },
    setSrc(src: string) {
        this.set({
            file: null,
            src,
        });
        this.player.setSrc(src);
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            src: this.get('src'),
            file: this.get('file'),
            container: this.get('container'),
            editable: this.get('editable'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const { id, scaleX, scaleY, width, height, angle, editable, src, file, autoplay, muted, loop } = this;
            const zoom = this.canvas.getZoom();
            const left = this.calcCoords().tl.x;
            const top = this.calcCoords().tl.y;
            const padLeft = ((width * scaleX * zoom) - width) / 2;
            const padTop = ((height * scaleY * zoom) - height) / 2;
            this.videoElement = fabric.util.makeElement('video', {
                id,
                autoplay: editable ? false : autoplay,
                muted: editable ? false : muted,
                loop: editable ? false : loop,
                preload: 'none',
                controls: false,
            });
            this.element = fabric.util.wrapElement(this.videoElement, 'div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left + padLeft}px;
                        top: ${top + padTop}px;
                        position: absolute;
                        user-select: ${editable ? 'none' : 'auto'};
                        pointer-events: ${editable ? 'none' : 'auto'};`,
            }) as HTMLDivElement;
            this.container.appendChild(this.element);
            this.player = new MediaElementPlayer(id, {
                pauseOtherPlayers: false,
                videoWidth: '100%',
                videoHeight: '100%',
                success: (_mediaeElement: any, _originalNode: any, instance: any) => {
                    if (editable) {
                        instance.pause();
                    }
                },
            });
            this.player.setPlayerSize(width, height);
            if (src) {
                this.setSrc(src);
            } else if (file) {
                this.setFile(file);
            }
        }
    },
});

Video.fromObject = (options: VideoObject, callback: (obj: VideoObject) => any) => {
    return callback(new Video(options.src || options.file, options));
};

export default Video;
