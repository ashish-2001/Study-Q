import { Skeleton } from '@/components/ui/skeleton';


function LoadingAnswers(){
    return (
        <div className='wrapper flex flex-col gap-8'>  
            <div>
                <Skeleton/>
                <Skeleton/>
            </div>
            <div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className='w-full space-y-2'>
                        <Skeleton className='h-4 w-full'/>
                        <Skeleton className='h-4 w-5/6'/>
                        <Skeleton className='h-4 w-4/5'/>
                        <div className='flex space-x-2'>
                            <Skeleton className='h-6 w-16'/>
                            <Skeleton className='h-6 w-16'/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export {
    LoadingAnswers
}