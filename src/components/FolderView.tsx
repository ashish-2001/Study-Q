'use client';
import { useRouter } from "next/router";
import { ContentCard } from "./ContentCard";
import { courseContent, getFilterContent } from '@/lib/utils';
import { useRecoilValue } from 'recoil';
import { selectFilter } from '@/store/atoms/FilterContent';
import { Content } from "next/font/google";


export const FolderView = ({
    courseContent,
    courseId, 
    rest
}: {
    courseId: number;
    rest: string[];
    courseContent: courseContent[];
}) => {
    const router = useRouter();

    if(!courseContent?.length){
        return (
            <div className="mt-64 flex">
                <div className="m-auto">
                    No content here yet!
                </div>
            </div>
        );
    }
    let updatedRoute = `/courses/${courseId}`;
    for(let i = 0; i < rest.length; i++){
        updatedRoute += `/${rest[i]}`;
    }

    const currentFilter = useRecoilValue(selectFilter);

    const filteredCourseContent = getFilteredContent(
        courseContent,
        currentFilter
    );

    if(filteredCourseContent?.length === 0){
        const filterMessages = {
            watched: "You haven't completed any content in this section yet.",
            watching: 'No content currently in progress.',
            unwatched: 'No new content available to watch.',
            all: 'No content available in this section.'
        };

        return (
            <div className="mt-56 flex">
                <div className="m-auto text-center text-gray-500 text-xl">
                    {filterMessages[currentFilter as keyof typeof filterMessages] || 'No content found.'}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourseContent.map((current) => {
                    const videoProgressPercent = content.type === 'video' && content.videoFullDuration && content.duration ? (content.duration / content.videoFullDuration) * 100 : content.percentComplete || 0;

                    return (
                        <ContentCard
                            type={Content.type}
                            contentId={Content.id}
                            key={Content.id}
                            title={Content.title}
                            image={Content.image || ''}
                            onclick={() => {
                                router.push(`${updatedRoute}/${Content.id}`);
                            }}
                            markAsCompleted={content.markAsCompleted}
                            percentComplete={content.percentComplete}
                            videoProgressPercent={videoProgressPercent}
                            bookmark={content.bookmark}
                            contentDuration={content.videoFullDuration}
                            weeklyContentTitles={content.weeklyContentTitles}
                        />
                    )
                })}
            </div>
        </div>
    )
};