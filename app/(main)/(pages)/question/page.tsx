import { NewPostDialog } from "@/components/NewPostDialog";
import Link from "next/link";
import dayjs from "dayjs";
import { ExtendedQuestion, QuestionQuery } from "@/actions/question/types";
import Search from "@/components/search";
import { ArrowUpDownIcon, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { QueryParams, TabType } from '@/actions/types';
import { getDisabledFeature, getUpdateUrl, paginationData } from "@/lib/utils";
import db from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PostCard from "@/components/posts/PostCard";
import Pagination from "@/components/Pagination";
import { redirect } from "next/navigation";


type QuestionResponse = {
    data: ExtendedQuestion[] | null;
    error: string | null;
};

const getQuestionWithQuery = async (
    additionalQuery: Partial<QuestionQuery>,
    searchParams: QueryParams,
    sessionId: string
): Promise<QuestionResponse> => {
    const paginationQuery = {
        take: paginationData(searchParams).pageSize,
        skip: paginationData(searchParams).skip
    };

    const baseQuery = {
        ...paginationQuery,
        select: {
            id: true,
            title: true,
            upvotes: true,
            downvotes: true,
            totalanswers: true,
            tags: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
            votes: {
                where: {
                    userId: sessionId
                },
                select: { userId: true, voteType: true }
            },
            author: { select: { id: true, name: true } }
        }
    };
}

const searchQuery = searchParams.search ? {
    where: {
        
    }
}