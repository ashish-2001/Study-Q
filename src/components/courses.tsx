'use client';
import { Course } from '@/store/atoms';
import { CourseCard } from './CourseCard';
import { useRouter } from 'next/router';
import { Button } from './ui/button';
import { refreshDb } from '../actions/refresh-db';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';


export const Courses = ({ courses }: { courses: Course[] }) => {
    const session = useSession();

    const handleClick = async () => {
        const res = await refreshDb({ userId: session.data.user.id });
        if(res.error){
            toast.console.error(res.message);
        } else {
            toast.info(res.message);
        }
    };

    const router = useRouter();
    return (
        <section
            className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
            {courses?.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onclick={() => {
                        if(
                            course.title.includes('Machine Learning') || course.title.includes('Harnoor')
                        ) {
                            router.push('https://harkirat.classx.co.in/');
                        } else {
                            router.push(`/courses/${course.id}`);
                        }
                    }}
                />
            ))}
        >
            <div className={`flex w-full max-w-sm cursor-pointer flex-col items-center rounded-2xl bg-primary/5 p-16 transition-all duration-300 hover:-transition-y-2 hover`}>
                <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                    <div className='flex flex-col items-center text-center'>
                        <h3 className='truncate text-xl font-bold capitalize trackin-tighter md:text-2xl'>
                            Don't see your courses?
                        </h3>
                        <p>
                            Try refreshing the database . If you are still facing issues?{' '}
                            <Link 
                                href="mailto:100xDevs@gmail.com"
                                target='_blank'
                                className='text-primary underline underline-offset-4'
                            >
                                Contact us
                            </Link>
                        </p>
                    </div>
                    <Button size={'lg'} onClick={handleClick}>
                        Refresh database
                    </Button>
                </div>
            </div>
        </section>
    )
}