import React from "react";
import db from '@/db';
import { SelectSource } from '@/components/admin/SelectSource' ;

async function getCourses(){
    const courses = await getCourses();

    return (
        <div className="mx-auto max-w-screen-xl cursor-pointer justify-between p-4">
            <SelectSource courses={courses}/>
        </div>
    )
}