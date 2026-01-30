import db from '@/db';
import { cache } from '@/db/Cache';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Bookmark } from '../app/generated/prisma/client';
import { getBookmarkData } from './bookmark';


export interface Content {
    id: number;
    type: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    parentId: number | null;
    createdAt: string;
    children: Content[];
    videoProgress?: {
        currentTimestamp: string;
        markAsCompleted?: boolean;
    };
}

export interface Folder extends Content {
    type: 'folder';
}

export interface Video extends Content {
    type: 'video';
}

export async function getAllCourses(){
    const value = await cache.get('getAllCourses', []);
    if(value){
        return value
    }

    const courses = await db.course.findMany({
        orderBy: {
            id: 'desc'
        }
    });
    cache.set('getAllCourses', [], courses);
    return courses;
}

export async function getAllCourseAndContentHierarchy(): Promise<
    {
        id: number;
        title: string;
        description: string;
        appxCourseId: string;
        discordRoleId: string;
        slug: string;
        imageUrl: string;
        openToEveryone: boolean;
        certIssued: boolean;
        discordOauthUrl: string;
        content: {
            contentId: number;
        }[];
    }[]
    > {
        const value = await cache.get('getAllCoursesAndContentHierarchy', []);
        if(value){
            return value;
        }

        const courses = await db.course.findMany({
            orderBy: {
                id: 'asc'
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                description: true,
                appxCourseId: true,
                openToEveryone: true,
                certIssued: true,
                discordOauthUrl: true,
                slug: true,
                discordRoleId: true,
                content: {
                    select: {
                        contentId: true
                    }
                }
            }
        });

        cache.set('getAllCoursesAndContentHierarchy', [], courses);
        return courses;
    }

    export async function getAllVideos(): Promise<{
        id: number;
    }
