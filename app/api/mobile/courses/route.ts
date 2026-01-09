import db from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest){
    try{
        const user = JSON.parse(req.headers.get('g') || '');
        if(!user){
            return NextResponse.json({
                message: 'User not found'
            }, {
                status: 400
            })
        }

        const userCourses = await db.course.findMany({
            where: {
                purchasedBy: {
                    some: {
                        user: {
                            email: user.email
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            message: 'User courses fetched successfully',
            data: userCourses
        })
    } catch(e){
        console.error(e);
        return NextResponse.json({
            message: 'Error fetching user courses', 
            e
        }, {
            status: 500
        })
    }
}