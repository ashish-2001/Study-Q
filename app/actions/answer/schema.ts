import { z } from 'zod';

export const AnswerInsertSchema = z.object({
    content: z.string().min(2, 'Answer content too short'),
    questionId: z.number(),
    parentId: z.number().optional()
});

export const AnswerUpdateSchema = z.object({
    answerId: z.number(),
    content: z.string().min(2, "Answer content too short")
});

export const AnswerDeleteSchema = z.object({
    answerId: z.number()
});