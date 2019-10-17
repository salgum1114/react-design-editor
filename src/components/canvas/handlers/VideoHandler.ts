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
}

export default VideoHandler;
