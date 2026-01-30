import { FunctionComponent } from "react";

interface YoutubeRendererProps {
    url: string;
}

export const YoutubeRenderer: FunctionComponent<YoutubeRendererProps> = ({
    url
}) => {
    return (
        <div className="mt-2 flex justify-center">
            <iframe
                width={"100%"}
                className="h-[80vh]"
                height={"500px"}
                src={url}
                title="Youtube video player"
                allow="accelerator; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            >
            </iframe>
        </div>
    );
};