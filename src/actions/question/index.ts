'use server';

import { 
    DeleteTypeQuestion,
    InputTypeCreate,
    InputTypeUpdate,
    ReturnTypeCreate,
    ReturnTypeDelete,
    ReturnTypeUpdate
} from "./types";
import { revalidatePath } from "next/cache";
import { 
    QuestionDeleteSchema,
    QuestionInsertSchema,
    QuestionUpdateSchema
} from "./schema";
import { createSafeAction } from "@/lib/create-safe-action";
import { createServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateHandle } from '@/lib/utils';
import db from "@/db";
import { ROLES } from "../types";

const createQuestionHandler = async (
    data: InputTypeCreate,
): Promise<ReturnTypeCreate> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user.id){
        return {
            error: 'Unauthorized'
        }
    }

    const { title, content, tags } = data;

    let slug = generateHandle(title);

    try{
        const userExists = await db.user.findUnique({
            where: {
                id: session.user.id
            }
        });

        if(!userExists){
            return {
                error: 'User not found'
            }
        }

        const existingQuestion = await db.question.findFirst({
            where: { slug }
        });

        if(existingQuestion){
            slug += `-${Math.random().toString(36).substring(2, 5)}`;
        }

        const question = await db.question.create({
            data: {
                title,
                content,
                tags,
                authorId: session.user.id,
                slug
            }
        });

        revalidatePath(`/question/${question.id}`);
        revalidatePath((`/question`));

        return { data: question }
    } catch(e){
        console.error(e);
        return{
            error: 'Failed to create question'
        }
    }
};

const updateQuestionHandler = async (
    data: InpputTypeUpdate,
): Promise<ReturnTypeUpdate> => {
    const session = await getServerSession(authOptions);
    if(!session || !session.user.id){
        return {
            error: 'Unauthorized'
        }
    };

    const { title, content, tags, questionId } = data;

    const userExists = await db.user.findUnique({
        where: {
            id: session.user.id
        }
    });

    if(!userExists){
        return {
            error: 'User not found'
        }
    }

    const existingQuestion = await db.question.findUnique({
        where: { id: questionId }
    });

    if(!existingQuestion || existingQuestion.authorId !== session.user.id){
        return {
            error: 'Unauthorized: You can only update question you have authored'
        }
    };

    const slug = generateHandle(title);

    try{
        const anotherExistingQuestion = await db.question.findFirst({
            where: {
                slug,
                AND: {
                    id: {
                        not: questionId
                    }
                }
            }
        });

        if(anotherExistingQuestion){
            slug += `-${Math.random().toString(36).substring(2, 5)}`;

            const updatedQuestion = await db.question.update({
                where: {
                    id: questionId
                },
                data: {
                    title,
                    content,
                    tags,
                    slug
                }
            });
            revalidatePath(`/question/${questionId}`);
            revalidatePath(`/question`);

            return {
                data: updatedQuestion
            }
        }
    } catch(e){
        console.error(e);
        return {
            error: 'Failed to update question'
        }
    }
};

const deleteQuestionHandler = async (
    data: DeleteTypeQuestion
): Promise<ReturnTypeCreate> => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user.id){
        return { error: 'Unauthorized' };
    }

    const userExists = await db.user.findUnique({
        where: {
            id: session.user.id
        }
    });

    if(!userExists){
        return {
            error: 'User not found'
        }
    };

    const { questionId } = data;

    const question = await db.question.findUnique({
        where: {
            id: questionId
        }
    });

    if(!question || ( question.authorId !== session.user.role !== ROLES.ADMIN)){
        return {
            error: 'Unauthorized: You can only delete question you have authored'
        };
    }

    try{
        await db.$transaction(async (prisma) => {
            const deleteAnswers = async (answerId: number) => {
                const responses = await prisma.answer.findMany({
                    where: {
                        parentId: answerId 
                    }
                });

                for(const response of responses){
                    await deleteAnswers(response.id);
                }

                await prisma.answer.delete({
                    where: {
                        id: answerId
                    }
                });
            };

            const answers = await prisma.answer.findMany({
                where: {
                    questionId
                }
            });
            for(const answer of answers){
                await deleteAnswers(answer.id);
            }

            await prisma.question.delete({
                where: { id: questionId }
            });
        });

        revalidatePath(`/question/${questionId}`);
        revalidatePath(`/question`);

        return {
            data: {
                message: 'Question and all associated answers deleted successfully'
            }
        }
    } catch(e){
        console.error(e);
        return {
            error: 'Failed to delete question and answers.'
        }
    }
};

export const createQuestion = createSafeAction(
    QuestionInsertSchema,
    createQuestionHandler
);

export const updateQuestion = createSafeAction(
    QuestionUpdateSchema,
    updateQuestionHandler
);

export const deleteQuestion = createSafeAction(
    QuestionDeleteSchema,
    deleteQuestionHandler
);
