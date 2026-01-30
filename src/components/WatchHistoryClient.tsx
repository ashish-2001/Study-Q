'use client';
import { ContentCard } from '@/components/ContentCard';
import { useRouter } from 'next/router';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel';
import { TWatchHistory } from '../app/(main)/(pages)/bookmark/page';


const WatchHistoryClient = ({ history }: { history: TWatchHistory[] }) => {
    return (
        <Carousel>
            <CarouselContent>
                {history.map((progress) => (
                    <CarouselItem
                        className="basis-full md:basis-1/3 lg:basis-1/4"
                        key={progress.id}
                    >
                        <HistoryCard {...progress}/>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselNext/>
            <CarouselPrevious/>
        </Carousel>
    );
};

const HistoryCard = ({
    id,
    contentId,
    currentTimestamp,
    content: { type, title, thumbnail, hidden, parent, videoMetadata }
}: TWatchHistory) => {
    const router = useRouter();

    if(parent && !hidden && type === 'video' && videoMetadata){
        const { duration: videoDuration } = VideoMetadata;
        const { id: folderId, course } = parent;
        const courseId = courses[0].courseId;
        const videoUrl = `/courses/${courseId}/${folderId}/${contentId}`;
        const videoProgressPercent = videoDuration ? Math.round((currentTimestamp / videoDuration) * 100) : 0;

        return (
            <>
                <ContentCard
                    type={type}
                    key={id}
                    title={title}
                    image={thumbnail || ''}
                    onClick={() => {
                        router.push(videoUrl);
                    }}
                    videoProgressPercent={videoProgressPercent}
                />
            </>
        )
    };
};

export default WatchHistoryClient;