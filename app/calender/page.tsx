import { getServerSession } from 'next-auth';
import { redirect } from 'next/dist/server/api-utils';
import React from 'react';
import CalenderPageComponent from '@/components/big-calender/calender';

const CalenderPage = async () => {
    const session = await getServerSession();
    if(!session || !session.user){
        return redirect('/signin');
    }

    const isAdmin = process.env.ADMINS?.split(',').includes(session.user.email!) ?? false;

    return (
        <div className='wrapper min-h-screen'>
            <CalenderPageComponent isAdmin={isAdmin}/>
        </div>
    )
}

export default CalenderPage;