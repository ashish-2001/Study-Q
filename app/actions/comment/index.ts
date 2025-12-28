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
import { error } from 'console';

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

    return segments;
}

const createCommentHandler = async (
    data: InputTypeCreateComment
): Promise<ReturnTypeCreateComment> => {
    const session = getServerSession(authOptions);

    if(!session || !session.user){
        return {
            error: 'Unauthorized'
        }
    }

    const { content, contentId, parentId } data;
    const userId = session.user.id;

    if(!rateLimit(userId)){
        return {
            error: 'Rate limit exceeded. Please try again later.'
        };
    }

    try{
        let parentComment;
        if(parentId){
            parentComment = await prisma.comment.findUnique({
                where: {
                    id: parentId
                }
            });

            if(!parentComment){
                return {
                    error: 'Cannot reply to a nested comment.'
                };
            }
        }

        const relatedContent = await prisma.content.findUnique({
            where: { id: contentId }
        });

        if(!relatedContent || relatedContent.type === 'folder'){
            return {
                error: 'Invalid content for commenting.'
            };
        }

        let comment;
        if(parentComment){
            await prisma.$transaction(async (prisma) => {
                comment = await prisma.comment.create({
                    data: {
                        content,
                        contentId,
                        parentId,
                        userId
                    }
                });

                await prisma.comment.update({
                    where: {
                        id: parentId
                    },
                    data: {
                        repliesCount: {
                            increment: 1
                        }
                    }
                })
            })
        } else{
            await prisma.$transaction(async (prisma) => {
                let introData : 
                | { start: number ; end?:number | undefined; title: string }[]
                | null = [];

                if(data.content.startsWith('intro:') || 
                    data.content.startsWith('Intro:') || 
                    data.content.startsWith('INTRO:')
                ) {
                    introData = parseIntroComment(data.content);
                    if(!introData || introData.length === 0 || introData[introData.length - 1].end === 0){
                        throw new Error('Invalid intro comment format, remember to include end time on the segment. Example: 12:24- 23:43 - Introduction to the course',);
                    }
                }

                comment = await prisma.comment.create({
                    data: {
                        content,
                        contentId,
                        parentId,
                        userId,
                        commentType: introData && introData.length > 0 ? CommentType.INTRO : CommentType.DEFAULT
                    }
                });

                await prisma.content.update({
                    where: { id: contentId },
                    data: { commentCount: { increment: 1 }}
                })
            });
        }

        if(data.currentPath){
            revalidatePath(data.currentPath);
        }
        return { data: comment };
    } catch(e){
        return {
            error: 'Unauthorized pr insufficient permission'
        };
    }
}

const updateCommentHandler = async ( 
    data: InputTypeUpdateComment
): Promise<ReturnTypeUpdateComment> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user){
        return { error: 'Unauthorized or insufficient permissions' };
    }

    const { commentId, content, approved, adminPassword } = data;
    const userId = session.user.id;

    try{
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if(!existingComment){
            return {
                error: "Comment not found"
            }
        }

        if(existingComment.userId !== userId){
            return { error: 'Unauthorized to update this comment.' };
        }

        const updObj = {
            content: content ?? existingComment.content,
            approved: existingComment.approved
        };

        if(adminPassword === process.env.ADMIN_SECRET){
            updObj.approved = approved ?? existingComment.approved;
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: updObj
        });

        if(data.currentPath){
            revalidatePath(data.currentPath);
        }
        return { data: updatedComment }
    } catch(e){
        return {
            error: 'Failed to update comment.'
        };
    }
};

const approveIntroCommentHandler = async(
    data: InputTypeApproveIntroComment
): Promise<ReturnTypeApproveIntroComment> => {
    const session = getServerSession(authOptions);
    const { content_comment_ids, approved, adminPassword, currentPath } = data;

    if(adminPassword){
        if(adminPassword !== process.env.ADMIN_SECRET){
            return {
                error: 'Unauthorized'
            };
        };
    } else if(!session || !session.user || session.user.role !== ROLES.ADMIN){
        return {
            error: 'Unauthorized'
        };
    }

    const [contentId, commentId] = content_comment_ids.split(';');
    try{
        const existingComment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId, 10) }
        });

        if(!existingComment){
            return { error: 'Comment not found.'};
        }

        const introData = parseIntroComment(existingComment.content);

        if(!introData || introData.length === 0 || existingComment.commentType !== CommentType.INTRO){
            return {
                error: 'Comment is not an intro comment or can not be parsed. Please check that last segment has end time include.'
            };
        }

        const updObj = {
            approved
        };

        let updatedComment = null;
        await prisma.$transaction(async (prisma) => {
            updatedComment = await prisma.comment.update({
                where: { id: parseInt(commentId, 10) },
                data: updObj
            });

            await prisma.videoMetadata.update({
                where: {
                    contentId: Number(contentId)
                },
                data: {
                    segments: introData
                }
            });
        });

        if(currentPath){
            revalidatePath(currentPath);
        }
        return {
            data: updatedComment
        }
    } catch(e){
        return{
            error: 'Failed to update comment.'
        };
    }
};

const deleteCommentHandler = async (
    data: InputTypeDeleteComment
): Promise<ReturnTypeDeleteComment> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user){
        return{
            error: 'Unauthorized or insufficient permissions'
        };
    }

    const { commentId } = data;
    const userId = session.user.id;

    try{
        const existingComment = await prisma.comment.findUnique({
            where: {
                id: commentId
            },
            include: {
                parent: true
            }
        });

        if(!existingComment){
            return {
                error: 'Comment not found.'
            };
        };

        if(session.user?.role !== ROLES.ADMIN && existingComment.userId !== userId){
            return {
                error: 'Unauthorized to delete this comment.'
            };
        }

        await prisma.$transaction(async (prisma) => {
            await prisma.vote.deleteMany({
                where: {
                    OR: [{ commentId}, { comment: { parentId: commentId }}]
                }
            });

            if(!existingComment.parentId){
                await prisma.comment.deleteMany({
                    where: {
                        parentId: commentId
                    }
                });

                await prisma.content.update({
                    where: {
                        id: existingComment.contentId
                    },
                    data: { commentsCount: { decrement: 1 } }
                });
            }

            await prisma.comment.delete({
                where: {
                    id: commentId
                }
            });
        });

        if(data.currentPath){
            revalidatePath(data.currentPath)
        }

        return {
            data: { message: 'Comment and its replies deleted successfully'}
        };
    } catch(e){
        return {
            error: 'Failed to delete comment.'
        }
    }
};

const pinCommentHandler = async(
    data: InputTypePinComment
): Promise<ReturnTypePinComment> => {
    const session = getServerSession(authOptions);
    const { commentId, contentId, currentPath } = data;

    if(!session || !session.user || session.user.role !== ROLES.ADMIN){
        return {
            error: 'Unauthorized or insufficient permissions'
        }
    }

    let updatedComment;

    try{
        await prisma.$transaction(async (prisma) => {
            await prisma.comment.updateMany({
                where: {
                    contentId,
                    isPinned: true 
                },
                data: { isPinned: false }
            });

            updatedComment = await prisma.comment.update({
                where: { id: commentId },
                data: { isPinned: true }
            });
        });

        if(currentPath){
            revalidatePath(currentPath);
        }

        return { data: updatedComment }
    } catch(e: any){
        return {
            error: e.message || 'Failed to pin comment.'
        };
    };
};

export const createMessage = createSafeAction(
    CommentInsertSchema,
    createCommentHandler
);

export const updateMessage = createSafeAction(
    CommentUpdateSchema,
    updateCommentHandler
);

export const deleteMessage = createSafeAction(
    CommentDeleteSchema,
    deleteCommentHandler
);

export const approveComment = createSafeAction(
    CommentApproveIntroSchema,
    approveIntroCommentHandler
);

export const pinComment = createSafeAction(CommentPinSchema, pinCommentHandler);

