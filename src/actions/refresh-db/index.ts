'use server';

import db from "@/db";
import { cache } from '@/db/cache';
import { getAllCOurses } from "@/lib/auth";
import { APPX_COURSE_IDS } from '@/utiles/appx';
import { checkUserEmailForPurchase } from "@/utiles/appx-check-mail";
import { Course } from "@prisma/client";
import { getServerSession } from "next-auth";


type RefreshDbFn = (args: { userId: string; email: string }) => Promise<{
    error: boolean;
    message: string;
}>;

export const refreshDb: RefreshDbFn = async ()=> {
    const session = await getServerSession(authOptions);
    const email = session?.user.email || '';
    const userid = session?.user.id;
    return await refreshDbInternal(userid, email);
}

export async function refreshDbInternal(userId?: string, email?: string){
    if(!email){
        return {
            error: true,
            message: 'You are not logged in'
        };
    }

    if(process.env.LOCAL_CMS_PROVIDER){
        return {
            error: false,
            message: 'Re-fetched Courses'
        }
    }
        if(!userId){
            return {
                error: true,
                message: 'You are not logged in'
            };
        }

        if(await cache.get('rate-limit', [email])){
            return {
                error: true,
                message: 'Wait sometime before refetching'
            }
        };

        const allCourses = (await getAllCOurses()) as Course[];

        const userCourses = await db.userPurchases.findMany({
            where: {
                userId
            }
        });

        const coursesWithoutUser = allCourses.filter((course) => {
            return !userCourses.some((userCourse) => userCourse.courseId === course.id);
        }).filter((x) => APPX_COURSE_IDS.includes(x.id));

    const responses: Course[] = [];

    const promises = coursesWithoutUser.filter((x) => !x.openToEveryone).map(async (course) => {
        const courseId = course.appxCourseId.toString();
        const data = await checkUserEmailForPurchase(email, courseId);

        if(data.data === '1'){
            responses.push(course);
        }
    });

    await Promise.all(promises);

    responses.forEach(async (res) => {
        try{
            await db.userPurchases.create({
                data: {
                    userId: userId!,
                    courseId: res.id
                }
            });
        } catch(e){
            console.error(e);
            return {
                error: true,
                message: 'Unable to insert courses'
            }
        }
    });

    cache.evict('courses', [email]);
    cache.set('rate-limit', [email], true, 60);
    console.log(
        `Refreshed purchases for ${userId} ${email}, total courses ${responses?.length}`
    );
    return { error: false, message: 'Re-fetched Courses'}
};