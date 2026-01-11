import db from '@/db';
import { NextResponse, NextRequest } from 'next/server';
import { nullish } from 'zod';


async function checkUserCourseAccess(userId: string, courseId: string){
    const userCourse = await db.course.findFirst({
        where: {
            purchasedBy: {
                some: {
                    userId
                }
            },
            id: parseInt(courseId, 10)
        }
    });

    return userCourse !== null
};


export async function GET(
    req: NextRequest,
    { params }: { params: { courseId: string } }
){
    try{
        const user: { id: string } = JSON.parse(req.headers.get('g') || '');
        const { courseId } = params;

        const userCourseAccess = await checkUserCourseAccess(user.id, courseId);
        if(!userCourseAccess){
            return NextResponse.json({
                message: 'User not have access to this course'
            }, {
                status: 403
            })
        }

        const folderContents = await db.content.findMany({
            where: {
                id: parseInt(courseId, 10),
                type: 'folder'
            }
        });

        return NextResponse.json({
            message: 'Courses data fetched successfully',
            data: folderContents
        });
    } catch(e){
        console.error(e);
        return NextResponse.json({
            message: 'Error fetching user courses', e
        }, {
            status: 500
        })
    }
}