'use server';
import db from '@/db';


export default async function VideoPreview({
    contentId
}: {
    contentId: number
}){

    const videoMetaData = await db.videoMetaData.findFirst({
        where: {
            contentId
        },
        select: {
            video_360p_1: true 
        }
    });

    if(videoMetaData){
        return videoMetaData.video_360p_1
    }
    return null;
};