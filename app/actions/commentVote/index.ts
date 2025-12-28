import { getServerSession } from "next-auth";
import { InputTypeHandleVote, ReturnTypeHandleVote } from "./types";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib";
import { VoteType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { VoteHandleSchema } from "./schema";


const voteHandler = async (
    data: InputTypeHandleVote
): Promise<ReturnTypeHandleVote> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user.id){
        return {
            error: 'Unauthorized'
        }
    }

    const { questionId, answerId, commentId, voteType, currentPath, slug } = data;

    if(!questionId && !answerId && !commentId){
        return {
            error: 'No valid target specified.'
        };
    };

    try{
        const userExists = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        });

        if(!userExists){
            return { error: 'User not found.'}
        }

        await prisma.$transaction(async (prisma) => {
            if(commentId){
                targetType = 'comment';
                tragetId = commentId
            } else if(questionId){
                targetType = 'question';
                targetId = questionId
            } else if(answerId){
                targetType = 'answer';
                targetId = answerId
            }

            const existingVote = await prisma.vote.findFirst({
                where: {
                    userId: session.user.id,
                    ...(commentId ? { commentId } : {}),
                    ...(questionId ? { questionId } : {}),
                    ...(answerId ? { answerId } : {}) 
                }
            });

            if(existingVote){
                if(existingVote.voteType === voteType){
                    await prisma.vote.delete({
                        where: { id: existingVote.id }
                    });

                    const q = {
                        where: {
                            id: targetId
                        },
                        data: {
                            [voteType === VoteType.UPVOTE ? 'upvotes' : 'downvotes'] : {
                                decrement: 1
                            }
                        }
                    };

                    if(targetType === 'comment'){
                        await prisma.comment.update(q);
                    } else if(targetType === 'question'){
                        await prisma.question.update(q);
                    } else if(targetType === 'answer'){
                        await prisma.answer.update(q);
                    }
                } else{
                    await prisma.vote.update({
                        where: { id: existingVote.id },
                        data: { voteType }
                    });

                    const incrementField = voteType === VoteType.UPVOTE ? 'upvotes' : 'downvotes';
                    const decrementField = VoteType.UPVOTE ? 'downvotes' : 'upvotes';

                    const q = {
                        where: {
                            id: targetId
                        },
                        data: {
                            [incrementField] : { increment: 1 },
                            [decrementField] : { decrement: 1 }
                        }
                    };

                    if(targetType === 'comment'){
                        await prisma.comment.update(q);
                    } else if(targetType === 'question'){
                        await prisma.question.update(q);
                    } else if(targetType === 'answer'){
                        await prisma.answer.update(q);
                    }
                }
            } else{
                await prisma.vote.create({
                    data: {
                        voteType,
                        userId: session.user.id,
                        ...(commentId ? { commentId } : {}),
                        ...(questionId ? { questionId } : {}),
                        ...(answerId ? { answerId } : {})
                    }
                });

                const q = {
                    where: {
                        id: targetId
                    },
                    data: {
                        [voteType === VoteType.UPVOTE ? 'upvotes' : 'downvotes'] : {
                            increment: 1
                        }
                    }
                }
                if(targetType === 'comment'){
                    await prisma.comment.update(q);
                } else if(targetType === 'question'){
                    await prisma.question.update(q);
                } else if(targetType === 'answer'){
                    await prisma.answer.update(q);
                }
            }
        });

        const q = {
            where: { id: targetId! }
        };

        let updatedEntity;
        if(targetType === 'comment'){
            updatedEntity = await prisma.comment.findUnique(q);
        }
    }
}