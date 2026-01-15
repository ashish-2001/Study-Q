import React from "react";
import { Avatar, AvatarFallback } from '../ui/avatar';
import { TabType, QueryParams, ROLES } from "@/src/actions/types";
import {
    constructCommentPrismaQuery,
    getUpdatedUrl,
    paginationData
} from '@/lib/utils';
import CommentInputForm from "./CommentInputForm";
import { getComments } from "../../actions/comment/index";
import { ExtendedComment } from "@/src/actions/comment/types";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CommentVoteForm from '.CommentVoteForm';
import Link from "next/link";
import {
    ArrowLeft,
    ChevronDownIcon,
    MoreVerticalIcon,
    Reply
} from 'lucide-react';
import TimeCodeComment from "./TimeCodeComment";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { CommentType } from '@prisma/client';
import CommentDeleteForm from "./CommentDeleteForm";
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import CommentPinForm from './CommentPinForm';
import CommentApproveForm from "./CommentApproveForm";
import { number } from "zod";
dayjs.extend(relativeTime);


const Comments = async ({
    content,
    searchParams
}: {
    content: {
        id: number;
        courseId: number;
        commentCount: number;
        possiblePath: string;
    };
    searchParams: QueryParams;
}) => {
    const session = await getServerSession(authOptions);
    if(!session?.user){
        return null;
    }
    const paginationInfo = paginationData(searchParams);
    const q = constructCommentPrismaQuery(
        searchParams,
        paginationInfo,
        content.id,
        session.user.id
    );
    const data = await getComments(q, searchParams.parentId);

    if(!content.id) return null;
    const modifiedSearchParams = { ...searchParams };
    delete modifiedSearchParams.parentId;
    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
                {data.parentComment && (
                    <Link href={getUpdatedUrl(`/courses/${content.courseId}/${content.possiblePath}`, modifiedSearchParams, {})} scroll={false}>
                        <Button className="flex gap-2">
                            <ArrowLeft className="size-4"/> Go back
                        </Button>
                    </Link>
                )}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h2 className="text-xl font-bold tracking-tighter text-primary md:text-2xl">
                        {!data.parentComment ? `${content.commentCount} ${content.commentCount === 1 ? 'Comment' : 'Comments'}` : `${data.parentComment.repliesCount} ${data.parentComment.repliesCount === 1 ? 'Reply' : 'Replies'}`}
                    </h2>
                    <div className="flex gap-2">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    {searchParams.tabtype || TabType.mu}
                                    <ChevronDownIcon className="size-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <Link 
                                        scroll={false}
                                        href={getUpdatedUrl(
                                            `/courses/${content.courseId}/${content.possiblePath}`,
                                            searchParams,
                                            {
                                                tabtype: TabType.mu
                                            }
                                        )}
                                    >
                                        <DropdownMenuItem>Most Upvoted</DropdownMenuItem>
                                    </Link>
                                    <Link
                                        scroll={false}
                                        href={getUpdatedUrl(
                                            `/courses/${content.courseId}/${content.possiblePath}`,
                                            searchParams,
                                            {
                                                tabtype: TabType.mr
                                            }
                                        )}
                                    >
                                        <DropdownMenuItem>Most Recent</DropdownMenuItem>{' '}
                                    </Link>
                                    <Link
                                        scroll={false}
                                        href={getUpdatedUrl(
                                            `/courses/${content.courseId}/${content.possiblePath}`,
                                            searchParams,
                                            {
                                                tabtype: TabType.md
                                            }
                                        )}
                                    >
                                        <DropdownMenuItem>Most downvoted</DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <span>
                                        {searchParams.type === CommentType.INTRO
                                        ? CommentType.INTRO
                                        : 'All comments'}
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <Link
                                        scroll={false}
                                        href={getUpdatedUrl(
                                            `/courses/${content.courseId}/${content.possiblePath}`,
                                            searchParams,
                                            {
                                                type: CommentType.DEFAULT
                                            }
                                        )}
                                    >
                                        <DropdownMenuItem>All comment</DropdownMenuItem>
                                    </Link>
                                    <Link
                                        scroll={false}
                                        href={getUpdatedUrl(
                                            `/courses/${content.courseId}/${content.possiblePath}`,
                                            searchParams,
                                            {
                                                type: CommentType.INTRO
                                            }
                                        )}
                                    >
                                        <DropdownMenuItem>Intro comments</DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}