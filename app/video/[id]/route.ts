import { authOptions } from '@/lib/auth';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';


const VIDEO_FETCH_URL = process.env.FETCHER_URL;

export const GET = async (
    req: NextRequest,
    { params: { id } }: { params: { id: string } } 
) => {
    try{
        const videoId = id.replace('.m3u8', '');
        const session = await getServerSession(authOptions);

        if(!session || !session?.user){
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const response = await axios.get(`${VIDEO_FETCH-URL}/video/get?videoId=${videoId}&id=${session.user.id}`, 
            {
                responseType: 'text'
            }
        );

        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.apple.mpeurl');

        return new NextResponse(response.data, {
            status: 200,
            headers
        });
    } catch(e){
        console.error('Error fetching m3u8:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
};