import { SiGithub, SiNotion } from '@icons-pack/react-simple-icons';
import Link from 'next/link';
import React from 'react';
import { ArrowUpRightFromSquare } from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';


export default function ExternalLinks(){
    const assignmentsLinks = [
        {
            href: 'https://github.com/100xdevs-cohort-2/assinments',
            label: 'Cohort 2'
        },
        {
            href: 'https://github.com/100xdevs-cohort-3/assignments',
            label: 'cohort 3'
        }
    ];

    return (
        <>
            <DropdownMenuSub>
                <DropdownMenuTrigger>
                    <div className='flex items-center gap-2'>
                        <SiGithub className="h-4 w-4"/>
                        <span>Assignments</span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuSubContent className="bg-neutral-100 dark:bg-neutral-900">
                    {assignmentsLinks.map((link) => (
                        <Link key={link.href} href={link.href} target='_blank'>
                            <DropdownMenuItem className="flex items-center justify-center text-base">
                                <span>{link.label}</span>
                                <ArrowUpRightFromSquare className="h-4 w-4"/>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <Link href={'https://projects.100xdevs.com/' target="_blank"}>
                <DropdownMenuItem className="flex items-center justify-between text-base">
                    <div className='flex items-center gap-2'>
                        <span>Slides</span>
                    </div>
                </DropdownMenuItem>
            </Link>
        </>
    )
}