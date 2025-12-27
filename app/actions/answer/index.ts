'use server';

import {
    DeleteTypeAnswer,
    InputTypeCreateAnswer,
    InputTypeUpdateAnswer,
    ReturnTypeCreateAnswer,
    ReturnTypeUpdateAnswer,
    ReturnTypeDeleteAnswer
} from "./types";

import { createSafeAction } from "@/lib/create-safe-action";
import { 
    AnswerDeleteSchema,
    AnswerUpdateSchema,
    AnswerInsertSchema
} from "./schema";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import db from "@/db";
import { ROLES } from "../types";


const createAnswerHandler = async ( data: InputTypeCreateAnswer ) : Promise<ReturnTypeCreateAnswer> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user.id){
        return { error: 'Unauthorized'};
    }

    const { content, questionId, parentId } = data;

    try{
        const result = await db.$transaction(async (prisma) => {
            const answerData = {
                content,
                questionId,
                authorId: session.user.id,
                parentId
            };

            const answer = await prisma.answer.create({
                data: answerData
            });

            if(!parentId){
                await prisma.question.update({
                    where: { id: questionId },
                    data: { totalAnswers: { increment: 1 } }
                });
            } else {
                await prisma.answer.update({
                    where: { id: parentId },
                    data: { totalAnswers: { increment: 1 } }
                });
            }

            return answer;
        });

        revalidatePath(`/question/${result.id}`);
        revalidatePath(`/question`);

        return { data: result };
    } catch(e){
        console.error('Error in createAnswerHandler:', e);
        return { error: 'Failed to create answer.'};
    }
};

const updateAnswerHandler = async (
    data: InputTypeUpdateAnswer
) : Promise<ReturnTypeUpdateAnswer> => {
    const session = getServerSession(authOptions);

    if(!session || !session.user.id){
        return {
            error: 'Unauthorized'
        };
    }

    const { answerId, content } = data;

    const existingAnswer = await db.answer.findUnique({
        where: { id: answerId }
    });

    if(!existingAnswer || existingAnswer.authorId !== session.user.id){
        return {
            error: 'Unauthorized: You can only update answers you have authored'
        };
    }

    try{
        const updatedAnswer = await db.answer.update({
            where: { id: answerId },
            data: { content }
        });
        revalidatePath(`/question/${answerId}`);
        revalidatePath(`/question`);
        return { data: updatedAnswer };
    } catch(e){
        console.error(e);
        return {
            error: 'Failed to update answer.'
        }
    }
};

const DeleteAnswerHandler = async (
    data: DeleteTypeAnswer
) : Promise<ReturnTypeDeleteAnswer> => {
    const session = getServerSession(authOptions);

    if(!session || !session.user.id){
        return { error: 'Unauthorized' };
    }

    const { answerId } = data;

    const answer = await db.answer.findUnique({
        where: { id: answerId },
        include: { question: true }
    });

    if(!answer || (answer.authorId !== session.user.id && session.user.role !== ROLES.ADMIN)){
        return {
            error: 'Unauthorized: You can only delete answers you have authored'
        };
    };

    try{
        await db.$transaction(async (prisma) => {
            const deleteNestedAnswers = async ( parentId: number )=> {
                const childrenAnswers = await prisma.answer.findMany({
                    where: { parentId }
                });

                for(const childAnswer of childrenAnswers){
                    await deleteNestedAnswers(childAnswer.id);
                    await prisma.answer.delete({ where: { id: childAnswer.id }});
                    await prisma.answer.update({
                        where: { id: parentId },
                        data: { totalAnswers: { decrement: 1 }}
                    });
                }
            };

            await deleteNestedAnswers(answerId);

            if(answer.parentId){
                await prisma.answer.update({
                    where: { id: answer.parentId },
                    data: { totalAnswers: { decrement: 1 } }
                });
            } else if (answer.questionId){ 
                await prisma.question.update({
                    where: { id: answer.questionId },
                    data: { totalAnswers: { decrement: 1} }
                });
            };

            await prisma.answer.delete({ where: { id: answerId } });
        });

        revalidatePath(`/question/${answerId}`);
        revalidatePath(`/question`);

        return {
            data: { message: "Answer and all nested answers deleted successfully"}
        };
    } catch(e){
        console.error(e);
        return {
            error: "Failed to delete answer and nested answers."
        };
    };
}

export const createAnswer = createSafeAction(
    AnswerInsertSchema,
    createAnswerHandler
);

export const updatedAnswer = createSafeAction(
    AnswerUpdateSchema,
    updateAnswerHandler
);

export const deleteAnswer = createSafeAction(
    AnswerDeleteSchema,
    DeleteAnswerHandler
);