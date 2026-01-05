'use client';
import { approveComment } from '@/actions/comment';
import{ FormErrors } from '@/components/FormErrors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAction } from '@/hooks/useAction';
import { Label } from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { toast } from 'sonner';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { ShieldCheck } from 'lucide-react';


const ApproveComment = () => {
    const formRef = React.useRef<HTMLFormElement>(null);
    const { execute, fieldErrors } = useAction(approveComment, {
        onSuccesses: () => {
            toast('Comment added');
            formRef.current?.reset();
        },
        OnError: (error) => {
            toast.error(error);
        }
    });

    const handleApprove = (execute: React.FormEvent<HTMLFormElement>) => {
        execute.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const commentId = formData.get('commentId') as string;
        const adminPassword = formData.get('adminPassword') as string;
        execute({
            content_comment_ids: commentId,
            adminPassword,
            approved: true
        });
    };

    return (
        <div className='h-full w-full'>
            <Accordion 
                defaultValue='approve-comment'
                className='rounded-2xl border-2 p-4'
                type='single'
                collapsible
            >
                <AccordionItem className="border-none" value="approve-comment">
                    <AccordionTrigger className='p-6 text-lg font-bold lg:text-2xl'>
                        <div className='flex flex-col gap-4'>
                            <ShieldCheck size={40}/> Approve Comment
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <form>
                            
                        </form>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}