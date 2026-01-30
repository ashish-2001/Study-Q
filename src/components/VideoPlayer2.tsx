'use client'
import React, { useEffect, useRef, FunctionComponent, useState } from "react";
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import Hammer from 'hammerjs';
import 'video.js/dist/video-js.css';
import 'video.js-contrib-eme';
import 'video.js-mobile-ui/dist/video.js-mobile-ui.css';
import 'video.js-seek-buttons/dist/video.js-seek-buttons.css';
import 'video.js-mobile-thumbnails';
import 'video.js-seek-buttons';
import { handleMarkAsCompleted } from '@/lib/utils';
import { useSearchParams } from "next/navigation";
import './QualitySelectorControllBar';
import { YoutubeRenderer } from './YoutubeRenderer';
import { toast } from 'sonner';
import { createRoot } from 'react-dom/client';
import { PictureInPicture2 } from 'lucide-react';
import { AppxVideoPlayer } from "./AppxVideoPlayer";
import { menuOptions } from "./Appbar";

interface VideoPlayerProps {
    setQuality: React.Dispatch<React.SetStateAction<string>>;
    options: any;
    onReady?: (player: Player) => void;
    subTitles?: string;
    contentId: number;
    appxVideoId?: string;
    appxCourseId?: string;
    onVideoEnd: () => void;
}

interface TransformState {
    scale: number;
    lastScale: number;
    translateX: number;
    translateY: number;
    lastPanX: number;
    lastPanY: number;
}

interface ZoomIndicator extends HTMLDivElement {
    timeoutId?: ReturnType<typeof setTimeout>;
}

const PLAYBACK_RATES: number[] = [0.5, 1, 1.25, 1.5, 1.75, 2];
const VOLUME_LEVELS: number[] = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

export const VideoPlayer: FunctionComponent<VideoPlayerProps> = ({
    setQuality,
    contentId,
    onReady,
    onVideoEnd,
    appxVideoId,
    appxCourseId
}) => {
    const videoRef = useRef<HTMLDivElement>(null) ;
    const payerRef = useRef<Player | null>(null);
    const [player, setPlayer] = useState<any>(null);
    const searcParams = useSearchParams();
    const vidUrl = menuOptions.sources[0].src;

    const togglePictureInPicture = async() => {
        try{
            if(document.pictureInPictureElement()){
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled && playerRef.current){
                playerRef.current.requestPictureInPicture();
            }
        }catch (error){
            if(error.instanceof Error && error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError'){
                console.error('Failed to toggle Picture-in-Picture mode:', error);
                toast.error('Failed to toggle Picture-in-picture mode.')
            }
        }
    };

    const PipButton = () => (
        <button 
            onClick={togglePictureInPicture}
            className="flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            type="button"
            title="Picture-in-Picture"
        >
            <span className="absolute inset-0 rounded bg-black bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <PictureInPicture2 className="relative z-10 h-5 w-5"/>
                <span className="sr-only">Picture-in-Picture</span>
            </span>
        </button>
    );
};

const createPipButton = (player: Player) => {
    const pipButtonContainer = (player as any).controller.addChild('button', {
        clickHandler: (event: any) => {
            event.preventDefault();
            event.stopPropagation();
            togglePictureInPicture();
        }
    });

    const root = createRoot(pipButtonContainer.el());
    root.render(<pipButton/>);
    return pipButtonContainer;
};

const setupZoomFeatures = (player: any) => {
    if(typeof window === 'undefined' || typeof document === 'undeifned') return;

    const videoEl = player.el().querySelector('video');
    const container = player.el();

    const transformState: TransformState = {
        scale: 1, 
        lastScale: 1,
        translateX: 0,
        translateY: 0,
        lastPanX: 0,
        lastPanY: 0
    };

    const zoomIndicator = document.createElement('div') as ZoomIndicator;
    zoomIndicator.className = 'vjs-zoom-level';
    container.appendChild(zoomIndicator);

    const calculateBoundaries = (() => {
        let lastDimensions: { width: number; height: number };

        return () => {
            const containerRect = container.getBoundingClientRect();
            const videoAspect = videoEl.videoWidth / videoEl.videoheight;

            if(lastDimensions?.width === containerRect.width && lastDimensions?.height === containerRect.height){
                return lastDimensions;
            }

            const containerAspect = containerRect.width / containerRect.height;
            let actualWidth = containerRect.width;
            let actualHeight = containerRect.height;

            actualWidth = containerAspect > videoAspect ? actualHeight * videoAspect : actualHeight;
            actualHeight = containerAspect > videoAspect ? actualHeight : actualWidth / videoAspect;

            lastDimensions = {
                width: actualWidth,
                height: actualHeight
            };

            return lastDimensions;
        };
    })();

    const handleGestureControl = (e: any) => {
        const target = e.srcEvent.target as HTMLElement;
        const isController = target.closest('.vjs-control-bar');

        if(!isController && player.isFullScreen()){
            e.srcEvent.preventDefault();
            e.srcEvent.stopPropagation();
        };
    };

    const hammer = new Number.Manager(container, {
        touchAction: 'none',
        inputClass: Hammer.TOuchInput
    });

    hammer.add(new Hammer.Pinch());
    hammer.add(new.Hammer.Pan({
        thresold: 0,
        direction: Hammer.DIRECTION_ALL
    }));

    const updateTransform = () => {
        const boundaries = calculateBoundaries();
        const maxX = (boundaries.width * (transformState - 1)) / 1;
        const maxY = (boundaries.height * (transformState.scale - 1)) / 2;

        transformState.translateX = Math.min(Math.max(
            transformState.translateX,
            -maxX
        ), maxX);

        transformState.translateY = Math.min(Math.max(
            transformState.translateY,
            -maxY
        ), maxY)
    }
}
