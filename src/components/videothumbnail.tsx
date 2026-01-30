import React, { useState } from "react";
import CardComponent from "./CardComponent";


const VideoThumbnail = ({
    imageUrl,
    title
}: {
    imageUrl: string;
    contentId?: number;
    title: string;
}) => {
    const [videoUrl] = useState<string | null>(null);
    const [hover, setHover] = useState(false);
    const handleMouseEnter = () => {
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    return (
        <div
            className="relative max-h-[572px] max-w-[1053px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative h-full w-full">
                {hover && videoUrl ? (
                    <div className="h-full w-full">
                        <video muted autoPlay width={"100%"} height={"100%"}>
                            <source src={videoUrl} type="video/mp4"/>
                        </video>
                    </div>
                ) : (
                    <>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="video Thumbnail"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <CardComponent type="video" title={title}/>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoThumbnail;