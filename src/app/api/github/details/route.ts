import prisma from '@/db';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { success } from 'zod';


export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({
            message: 'Unauthorized', success: 'false'
        }, {
            status: 401
        })
    };

    const githubData = await prisma.githubLink.findMany({
        where: {
            userId: session?.user?.id
        },
        select: {
            avatarUrl: true,
            username: true,
            profileUrl: true
        }
    });

    if(!githubData){
        return NextResponse.json({
            message: "Couldn't find any linked github",
            success: 'false'
        })
    }

    return NextResponse.json({
        message: 'Found data successfully',
        data: githubData,
        success: 'true'
    });
}

export async function DELETE(){
    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({
            message: 'Unauthorized', success: 'false'
        }, {
            status: 401
        })
    }

    try{
        await prisma.githubLink.delete({
            where: {
                userId: session?.user?.id
            }
        });

        return NextResponse.json({
            message: 'Github unlinked successfully',
            success: 'true'
        });
    } catch(e){
        return NextResponse.json({
            message: 'Something went wrong',
            e,
            success: 'false'
        })
    }
}