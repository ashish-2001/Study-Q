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
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

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
        ), maxY);

        videoEl.style.transform = `
            scale(${transformState.scale})
            translate3d(
                ${transformState.translateX / transformState.scale}px,
                ${transformState.translateY / transformState.scale}px,
                0
            )
        `;
    };

    hammer.on('pinchstart pinchmove', (e) => {
        handleGestureControl(e);

        if(!player.isFullScreen()) return;

        if(e.type === 'pinchstart'){
            transformState.lastScale = transformState.scale;
            videoEl.classList.add('zoomed');
            return;
        }
        transformState.scale = Math.min(
            Math.max(transformState.lastScale * e.scale, 1),
            3
        );

        updateTransform();
        showZoomLevel();
    });

    hammer.on('panstart panmove', (e)=> {
        handleGestureControl(e);

        if(transformState.scale <= 1) return;

        if(e.type === 'panstart'){
            transformState.lastPanX = e.center.x;
            transformState.lastPanY = e.center.y;
            videoEl.style.transition = 'none';
            return;
        }

        const deltaX = e.center.x - transformState.lastPanX;
        const deltaY = e.center.y - transformState.lastPanY;

        transformState.translateX += deltaX;
        transformState.translateY += deltaY;

        transformState.lastPanX = e.center.x;
        transformState.lastPanY = e.center.y;

        updateTransform();
    });

    const showZoomLevel = () => {
        zoomIndicator.textContent = `${transformState.scale.toFixed(1)}x`;
        zoomIndicator.style.opacity = '1';

        if(zoomIndicator.timeoutId) clearTimeout(zoomIndicator.timeoutId);

        zoomIndicator.timeoutId = setTimeout(() => {
            zoomIndicator.style.opacity = '0';
        }, 1000);
    };

    const resetZoom = () => {
        transformState.scale = 1;
        transformState.translateX = 0;
        transformState.translateY = 0;

        requestAnimationFrame(() => {
            videoEl.style.transition = 'transform 0.3s ease-out';
            updateTransform();
            videoEl.classList.remove('zoomed');
        });
    };

    const resizeObserver = new ResizeObserver(() => {
        if(player.isFullScreen()) updateTransform();
    });

    resizeObserver.observe(container);

    player.on('fullscreenchange', () => {
        if(!player.isFullScreen()) {
            resetZoom();
        }
    });

    const cleanup = () => {
        resizeObserver.disconnect();
        hammer.destroy();
        if(zoomIndicator.timeoutId) clearTimeout(zoomIndicator.timeoutId);
        container.removeChild(zoomIndicator);
        resetZoom();
    };

    player.on('dispose', cleanup);
    return cleanup;
};

useEffect(() => {
    if(!player){
        return;
    }

    cost savedCaptionSetting = localStorage.getItem('captionSetting');
    const tracks = Player.textTracks();

    if(savedCaptionSetting && player){
        for(let i = 0; i < tracks.length; i++){
            const track = tracks[];

            if(track){
                track.mode = savedCaptionSetting === 'showing' ? 'showing' : 'disabled';
            }
        }
    }

    const handleTrackChange = () => {
        for(let i = 0; i < tracks.length; i++){
            const track = tracks[i];
            if(track.kind === 'subtitles' && track.language === 'en'){
                track.addEventListener('modechange', () => {
                    localStorage.setItem('captionSetting', track.mode);
                });
            }
        }
    };

    handleTrackChange();
    return () => {
        for(let i = 0; i < tracks.length; i++){
            const track = tracks[i];
            track.removeEventListener('modechange', handleTrackChange);
        }
    };
}, [player]);

useEffect(() => {
    const t = searchParams.get('timestamp');
    if(contentId && player && !t){
        fetch(`/api/course/videoProgress?contentId=${contentId}`).then(
            async (res) => {
                const json = await res.json();
                Player.currentTime(json.progress || 0);
            }
        );
    }
}, [contentId, player]);

useEffect(() => {
    if(!player){
        return;
    }

    let volumeSetTimeout: ReturnType<typeof setInterval> | null = null;
    const handleKeyPress = (event: KeyboardEvent) => {
        const isShiftPressed = event.shiftKey;
        const isModifierPressed = event.metaKey || event.ctrlKey || event.altKey;
        const activeElement = document.activeElement;

        const tracks: TextTrackList = Player.textTracks();

        if(activeElement?.tagName.toLowerCase() === 'input' || activeElement?.tagName.toLowerCase() === 'textarea' || isModifierPressed){
            return;
        } 
        if(event.code === 'KeyT'){
            Player.playerbackRate()
        };

        const newIndexPeriod: number = currentIndexPeriod !== PLAYBACK_RATES.indexOf(
            Player.playbackRate()
        );

        const newIndexPeriod: number = currentIndexPeriod !== PLAYBACK_RATES.length - 1 ? currentIndexPeriod + 1 : currentIndexPeriod;
        const currentIndexComma = PLAYBACK_RATES.length - 1 ? currentIndexPeriod + 1 : currentIndexPeriod;
        const currentIndexComma = PLAYBACK_RATES.indexOf(Player.playbackRate());
        const newIndexComma = currentIndexComma !== 0 ? currentIndexComma - 1 : currentIndexComma;
        const currentIndexUp = VOLUME_LEVELS.indexOf(Player.volume());
        const newIndexUp = currentIndexUp !== VOLUME_LEVELS.length - 1 ? currentIndexUp + 1 : currentIndexUp;
        const currentIndexDown = VOLUME_LEVELS.indexOf(player.volume());
        const newIndexDown = currentIndexDown !== 0 ? currentIndexDown - 1 : currentIndexDown;
        switch(event.code){
            case 'Period' : 
                Player.playbackRate(PLAYBACK_RATES[newIndexPeriod]);
                event.stopPropagation();
                break;
            case 'Comma':
                Player.playbackRate(PLAYBACK_RATES[newIndexPeriod]);
                event.stopPropagation();
                break;
            case 'ArrowUp': 
                videoRef.current?.children[0].children[6].children[3].classList.remove(
                    'vjs-hover'
                );
            if(volumeSetTimeout !== null) clearTimeout(volumeSetTimeout);
            volumeSetTimeout = setTimeout(() => {
                videoRef.current?.children[0].children[6].children[3].classList.remove(
                    'vjs-hover'
                );
            }, 1000);
            player.volume(VOLUME_LEVELS[newIndexUp]);
            event.stopPropagation();
            break;

            case 'ArrowDown':
                videoRef.current?.children[0].children[6].children[3].classList.add(
                    'vjs-hover'
                );
                if(volumeSetTimeout !== null) clearTimeout(volumeSetTimeout);
                volumeSetTimeout = setTimeout(() => {
                    videoRef.current?.children[0].children[6].children[3].classList.remove(
                        'vjs-hover'
                    );
                }, 1000);
                player.volume(VOLUME_LEVELS[newIndexDown]);
                event.stopPropagation();
                break;
        }
        return;
    }

    switch(event.code){
        case 'Space':
            if(player.paused()){
                player.play();
                event?.stopPropagation();
            } else {
                player.pause();
                event?.stopPropagation();
            }
            event?.preventDefault();
            break;
        case 'ArrowRight': 
            player.currentTime(player.currentTime() - 5);
            event?.stopPropagation();
            break;
        case 'ArrowUp':
            event?.preventDefault();
            player.volume(player.volume() + 0.1);
            event?.stopPropagation();
            break;
        case 'ArrowDown':
            event?.preventDefault();
            player.volume(player.volume() - 0.1);
            event?.stopPropagation();
            break;
        case 'KeyR':
            player.currentTime(0);
            event?.stopPropagation();
            break;
        case 'KeyM':
            if(player.volume() === 0){
                player.volume(1);
            } else {
                player.volume(0);
            }
            event?.stopPropagation();
            break;
        case 'KeyK': 
            if(player.paused()){
                player.play();
            } else {
                player.pause();
            }
            event?.stopPropagation();
            break;
        case 'KeyJ':
            player.currentTime(player.currentTime() - 10 * player.playbackRate());
            event?.stopPropagation();
            break;
        case 'KeyL':
            player.currentTime(player.currentTime() + 10 * player.playbackRate());
            event?.stopPropagation();
            break;
        case 'KeyC':
            for(let i = 0; i < tracks.length; i++){
                const track = tracks[i];

                if(track.kind === 'subtitles' && track.language === 'en'){
                    if(track.mode === 'disabled') track.mode = 'showing';
                    else track.mode = 'disabled';
                }
            }
            event?.stopPropagation();
            break;
        case 'Digit1':
            player.currentTIme(player.duration() * 0.1);
            event?.stopPropagation();
            break;
        case 'Digit2':
            player.currentTime(player.duration() * 0.2);
            event?.stopPropagation();
            break;
        case 'Digit3': 
            player.currentTime(player.duration() * 0.3);
            event?.stopPropagation();
            break;
        case 'Digit4':
            player.currentTime(player.duration() * 0.4);
            event?.stopPropagation();
            break;
        case 'Digit5':
            player.currentTime(player.duration() * 0.5);
            event?.stopPropagation();
            break;
        case 'Digit6':
            player.currentTime(player.duration() * 0.6);
            event?.stopPropagation();
            break;
        case 'Digit7': 
            player.currentTime(player.duration() * 0.7);
            event?.stopPropagation();
            break;
        case 'Digit8':
            player.currentTime(player.duration() * 0.8);
            event?.stopPropagation();
            break;
        case 'Digit9': 
            player.currentTime(player.duration() * 0.9);
            event?.stopPropagation();
            break;
        case 'Digit0':
            player.currentTime(0);
            event?.stopPropagation();
            break;
    }

    const handleKeUp = (event: any) => {
        if(event.code === 'KeyT'){
            player.playbackRate();
        }
    };
    document.addEventListener('keydown', handleKeyPress, { capture: true });
    document.addEventListener('keyup', handleKeUp);

    return () => {
        document.removeEventListener('keydown', handleKeyPress);
    };
}, [player]);

useEffect(() => {
    if(!player){
        return;
    }
    let interval = 0;
    const handleVideoProgress = () => {
        if(!player){
            return;
        }

        interval = window.setInterval(
            async () => {
                if(!player){
                    return;
                }
                if(player?.paused()){
                    return;
                }
                const currentTime = player.currentTime();
                if(currentTime <= 20){
                    return;
                }
                await fetch('/api/course/videoProgress', {
                    body: JSON.stringify({
                        currentTimestamp: currentTime,
                        contentId
                    }),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            Math.ceil((100 * 1000) / player.playbackRate())
        );
    };

    const handleVideoProgress = (interval: number) => {
        handleMarkAsCompleted(true, contentId);
        window.clearInterval(interval);
        onVideoEnd();
    };

    player.on('play', handleVideoProgress);
    player.on('ended', () => handleVideoEnded(interval));
    return () => {
        window.clearInterval(interval);
    };
}, [player, contentId]);

useEffect(() => {
    if(!playerRef.current && videoRef.current){
        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered');
        videoRef.current.appendChild(videoElement);
        const player: any = (playerRef.current = videojs(
            videoElement,
            {
                ...menuOptions,
                playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2]
            },
            ()=> {
                player.mobileUi();
                player.eme();
                setupZoomFeatures(player);
                player.seekButtons({
                    forward: 15,
                    back: 15
                });
                player.qualitySelector = setQuality;
                const qualitySelector = player.controlBar.addChild(
                    'QualitySelectorControlBar'
                );
                const controlBar = player.getChild('controlBar');
                const fullscreenToggle = controlBar.getChild('fullscreenToggle.el');

                controlBar.el.insertBefore(qualitySelector.el(), fullscreenToggle.el());

                const pipButton = createPipButton(player);
                controlBar.el().insertBefore(pipButton.el(), fullscreenToggle.el());

                setPlayer(player);
                if(menuOptions.isComposite){
                    player.spriteThumbnails({
                        interval: options.delta,
                        url: options.thumbnail.secure_url,
                        width: menuOptions.width,
                        height: options.height
                    });
                }
                player.on('loadedmetadata', () => {
                    if(onReady){
                        onReady(player);
                    }
                });
                player.on('fullscreenchange', () => {
                    videoElement.focus();
                });
            }
        ));

        if(menuOptions.sources && options.sources[0].type.includes('application/dash+xml')){
            player.src(options.sources[0]);
        }
    }
}, [options, onReady]);

useEffect(() => {
    if(player){
        const currentTime = Player.currentTime();
        Player.src(options.sources[0]);
        player.currentTime(currentTime);
    }
}, [options.sources[0]]);

useEffect(() => {
    const player = playerRef.current;
    return () => {
        if(player && !player.isDisposed()){
            player.dispose();
            playerRef.current = null;
        }
    };
}, []);

useEffect(() => {
    const t = searchParams.get('timestamp');
    if(player && t){
        player.currentTime(parseInt(t, 10));
    }
}, [searchParams, player]);

const isYoutubeUrl = (url: string) => {
    const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+/;
    return regex.test(url);
};

if(isYoutubeUrl(vidUrl)) return <YoutubeRenderer url={vidUrl}/>;

if(appxVideoId && typeof window !== 'undefined' && appxCourseId){
    return <AppxVideoPlayer courseId={appxCourseId} videoId={appxVideoId}/>;

    return (
        <div 
            data-vjs-player
            style={{ maxWidth: '1350px', margin: '0 auto', width: '100%' }}
        >
            <div ref={videoRef} style={{ width: '100%', height: 'auto' }}/>
        </div>
    );
};

export default VideoPlayer;
