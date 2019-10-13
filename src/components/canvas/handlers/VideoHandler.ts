import { fabric } from 'fabric';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';

import Handler from './Handler';

class VideoHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    play = () => {

    }

    pause = () => {

    }

    stop = () => {

    }

    create = (obj: fabric.Object, source: any) => {
        const { editable } = this.handler;
        const { id, autoplay, muted, loop } = obj;
        const videoElement = fabric.util.makeElement('video', {
            id,
            autoplay: editable ? false : autoplay,
            muted: editable ? false : muted,
            loop: editable ? false : loop,
            preload: 'none',
            controls: false,
        });
        const zoom = this.handler.canvas.getZoom();
        const left = obj.calcCoords().tl.x;
        const top = obj.calcCoords().tl.y;
        const { scaleX, scaleY, width, height, angle } = obj;
        const padLeft = ((width * scaleX * zoom) - width) / 2;
        const padTop = ((height * scaleY * zoom) - height) / 2;
        const video = fabric.util.wrapElement(videoElement, 'div', {
            id: `${id}_container`,
            style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                    width: ${width}px;
                    height: ${height}px;
                    left: ${left + padLeft}px;
                    top: ${top + padTop}px;
                    position: absolute;
                    user-select: ${editable ? 'none' : 'auto'};
                    pointer-events: ${editable ? 'none' : 'auto'};`,
        });
        this.handler.container.appendChild(video);
        const player = new MediaElementPlayer(id, {
            pauseOtherPlayers: false,
            videoWidth: '100%',
            videoHeight: '100%',
            success: (mediaeElement: any, originalNode: any, instance: any) => {
                if (editable) {
                    instance.pause();
                }
            },
        });
        player.setPlayerSize(width, height);
        player.setSrc(source.src);
        obj.setCoords();
        obj.set('player', player);
    }

    load = (obj: fabric.Object, src: any) => {
        const { editable } = this.handler;
        const { id } = obj;
        if (editable) {
            this.handler.elementHandler.removeById(id);
        }
        this.create(obj, src);
        this.handler.startRequestAnimFrame();
    }

    set = (obj: fabric.Object, source: any) => {
        let newSrc;
        if (typeof source === 'string') {
            obj.set('file', null);
            obj.set('src', source);
            newSrc = {
                src: source,
            };
            this.load(obj, newSrc);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                obj.set('file', source);
                obj.set('src', e.target.result);
                newSrc = {
                    src: e.target.result,
                    type: source.type,
                };
                this.load(obj, newSrc);
            };
            reader.readAsDataURL(source);
        }
    }
}

export default VideoHandler;
