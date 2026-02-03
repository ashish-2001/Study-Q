import db from '../../db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { ContentRendererClient } from './ContentRendererClient';
import { Bookmark } from '@/src/app/generated/prisma/client';

function bunnyUrl(url?: string){
    if(!url){
        return '';
    }
    return url.replace('https://appxContent.kaxa.in', 'https://appxContent.b-cdn.net')
    .replace(
        'https://appx-transcoded-videos.livelearn.in',
        'https://appx-recordings.b-cdn.net'
    )
    .replace(
        'https://appx-recordings.livestream.in',
        'https://appx-recordings.livestream.in',
    );
}


async function isUrlAccessible(url: string): Promise<boolean>{
    try{
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch(e){
        return false;
    }
}

export const getMetadata = async (contentId: number) => {
    const session = await getServerSession(authOptions);
    if(!session?.user){
        return null;
    }

    const metadata = await db.videoMetadata.findFirst({
        where: {
            contentId
        }
    });

    if(!metadata){
        return null;
    }

    const userId: string = (1).toString();
    const user = await db.user.findFirst({
        where: {
            id: session?.user?.id?.toString() || '-1',
        }
    });

    const bunnyUrls = {
        1080: bunnyUrl(metadata[`video_1080_mp4_${userId}`]),
        720: bunnyUrl(metadata[`video_720p_mp4_${userId}`]),
        360: bunnyUrl(metadata[`video_360p_mp4_${userId}`]),
        subtitles: metadata['subtitles'],
        slides: metadata['slides'],
        segments: metadata['segments'],
        thumbnails: metadata['thumbnail_mosaic_url'],
        appxVideoJSON: metadata['appxVideoJSON']
    };

    if(user?.bunnyProxyEnabled){
        return bunnyUrls;
    }

    const mainUrls = {
        1080: metadata[`video_1080p_mp4_${userId}`],
        720: metadata[`video_720_mp4_${userId}`],
        360: metadata[`video_720p_mp4_${userId}`],
        subtitles: metadata['subtitles'],
        slides: metadata['slides'],
        segments: metadata['segments'],
        thumbnails: metadata['thumbnail_mosaic_url'],
        appxVideoJSON: metadata['appxVideoJSON']
    };

    const isHighestQualityUrlAccessible = await isUrlAccessible(mainUrls['1080']);

    if(isHighestQualityUrlAccessible){
        return mainUrls;
    }

    const otherQualities = ['720', '360'];
    for(const quality of otherQualities){
        const isAccessible = await isUrlAccessible(mainUrls[quality]);
        if(isAccessible){
            return mainUrls;
        }
    }

    return bunnyUrls;
};

export const ContentRenderer = async ({
    content,
    nextContent
}: {
    nextContent: {
        id: number;
        type: string;
        title: string;
    } | null;
    content: {
        type: 'video' | 'appx';
        id: number;
        title: string;
        description: string;
        thumbnail: string;
        slides?: string;
        markAsCompleted: boolean;
        bookmark: Bookmark | null;
        courseid: string;
    };
}) => {
    const metadata = await getMetadata(content.id);
    const result = await getAppxCourseid(content.courseId);
    const appxCourseId = typeof result !== 'string' ? '' : result;
    const appxVideoId: string = metadata?.appxVideoJSON?.[appxCourseId] ?? '';

    return (
        <div>
            <ContentRendererClient
                nextContent={nextContent}
                metadata={metadata}
                content={{...content, appxVideoId, appxCourseId }}
            />
        </div>
    )
};

