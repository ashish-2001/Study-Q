'user server'

import { getServerSession } from 'next-auth';
import {
    InputTypeApproveIntroComment,
    InputTypeCreateComment,
    InputTypeDeleteComment,
    InputTypePinComment,
    InputTypeUpdateComment,
    ReturnTypeApproveIntroComment,
    ReturnTypeCreateComment,
    ReturnTypeDeleteComment,
    ReturnTypePinComment,
    ReturnTypeUpdateComment
} from "./types";

import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/utils";
import prisma from "@/db";
import {
    CommentApproveIntroSchema,
    CommentDeleteSchema,
    CommentInsertSchema,
    CommentPinSchema,
    CommentUpdateSchema,
} from "./schema";
import { createSateAction } from "@/lib/create-safe-action";
import { CommentType, Prisma } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { ROLES } from "../types";

export const getComments = async ( 
    q: Prisma.CommentFindManyArgs,
    parentId: number | null | undefined
) => {
    let parentComment = null;
    if(parentId){
        parentComment = await prisma.comment.findUnique({
            where: { id: parseInt(parentId.toString(), 10) },
            include: {
                user: true
            }
        });
    }

    if(!parentComment){
        delete q.where?.parentId;
    }
    const pinnedComment = await prisma.comment.findFirst({
        where: {
            contentId: q.where?.contentId,
            isPinned: true,
            ...CommentApproveIntroSchema(parentId ? { parentId: parseInt(parentId.toString(), 10) } : {})
        },
        include: q.include
    });

    if(pinnedComment){
        q.where = {
            ...q.where,
            NOT: {
                id: pinnedComment.id
            }
        };
    }

    const comments = await prisma.comment.findMany(q);
    const combinedComments = pinnedComment ? [pinnedComment, ...comments] : comments;

    return {
        comments: combinedComments,
        parentComment
    };
};

const parseIntroComment = ( comment: string) => {
    const introPattern = /^intro:\s*([\s\S]*)$/i;
    const match = comment.match(introPattern);
    if(!match){
        return [];
    }
    const lines = match[1].split('\n').filter((line) => line.trim() !== '');
    const segments = lines.map((line: string)=> {
        const parts = line.split('-').map((part)=> part.trim);
        const timePattern = /(\d{1, 2}):(\d{2}):(\d{2})|(\d{2}):(\d{2})/;
        const startTimeMatch = parts[0].match(timePattern);

        let start;
        if(startTimeMatch){
            if(startTimeMatch[1]){
                start = parseInt(startTimeMatch[1], 10) * 3600 + parseInt(startTimeMatch[2], 10) * 60 + parseInt(startTimeMatch[3], 10);
            } else{
                start = parseInt(startTimeMatch[4], 10) * 60 + parseInt(startTimeMatch[5], 10);
            }
        } else {
            start = 0;
        }

        const title = parts.length > 2 ? parts[2] : parts[1];
        return { start, title, end: 0 };
    });

    for(let i = 0; i < segments.length - 1; i++){
        segments[i].end = segments[i + 1].start;
    }

    if(lines.length > 0){
        const lastLineParts = lines[lines.length - 1].split('-').map((part) => part.trim());

        if(lastLineParts.length >= 3){
            const timePattern = /(\d{1, 2}):(\d{2}):(\d{2})|(\d{2})/;
            const endTimeMatch = lastLineParts[1].match(timePattern);
            let end;
            if(endTimeMatch){
                end = parseInt(endTimeMatch[1], 10) * 3600 + parseInt(endTimeMatch[2], 10) * 60 + parseInt(endTimeMatch[3], 10);
            } else{
                end = parseInt(endTimeMatch[4], 10) * 60 + parseInt(endTimeMatch[5], 10);
            }
            segments[segments.length - 1].end = end;
        }
    }
}