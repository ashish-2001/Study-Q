'use client';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import React, { useState, useTransition} from 'react';
import VoteForm from './form/form-vote';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import MDEditor from '@uiw/react-md-editor';
import DeleteForm from './form/form-delete';
import Tag from './tag';
import {
    Author,
    ExtendedAnswer,
    ExtendedQuestion
} from '@/actions/question/types';
import { useAction } from '@/hooks/useAction';
import { createAnswer } from '@/actions/answer';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Answer } from '@prisma/client';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Reply } from 'lucide-react';
import { ROLES } from '@/actions/types';
import { FormPostErrors } from './form/form-errors';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

interface IProps {
    post: ExtendedQuestion | ExtendedAnswer;
    sessionUser: Author | undefined | null;
    reply?: boolean;
    enableLink?: boolean;
    isAnswer?: boolean;
    questionId: number;
    parentAuthorName?: string | null;
}

const isExtendedQuestion = (
    post: ExtendedQuestion | Answer
): post is ExtendedQuestion => {
    return (post as ExtendedQuestion).slug !== undefined;
};

const PostCard: React.FC<IProps> = ({
    propTypes,
    sessionUser,
    questionId,
    reply = false,
    enableLink = false,
    isAnswer = true,
    parentAuthorName
}) => {
    const { theme } = useTheme();
    const [markDownValue, setMarkDownValue] = useState('');
    const [enableReply, setEnableReply] = useState(false);
    const handleMarkDownChange = (newValue?: string) => {
        if(typeof newValue === 'string'){
            setMarkDownValue(newValue);
        }
    };

    const handleEditorClick = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { execute, fieldErrors } = useAction(createAnswer, {
        onSuccess: () => {
            toast.success(`Reply added`);
            if(!fieldErrors?.content){
                setEnableReply(false);
                setMarkDownValue('');
            }
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const handleSubmit = (event: React.formEvent<HTMLFormElement> => {
        event.preventDefault();
        execute({
            content: markDownValue,
            questionId,
            parentId: isAnswer ? post?.id : undefined
        });
    }
        const formatNumber = (num: number) => {
            if(num >= 1000){
                return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
            }
            return num.toString();
        };

        return (
            <div className={`flex w-full cursor-pointer flex-col gap-4 p-3 transition-all duration-300 sm:p-5 ${!postMessage.content && !isAnswer ? `rounded-xl bg-neutral-50 sshadow-lg hover:-transition-y-2 dark:bg-neutral-900` : 'rounded-r-xl border-1-2 border-blue-500 bg-primary/5' } ${isPending && `animate-pulse duration-700`}`} onClick={() => { startTransition(() => { if(isExtendedQuestion(post)){ router.push(`/question/${post?.slug}`)}})}}>
                <div>
                    
                </div>
            </div>
        )
    )
}
