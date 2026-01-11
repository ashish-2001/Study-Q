import { z } from 'zod';
import { Answer } from '@/src/app/generated/prisma/client';
import { ActionState } from "@/lib/create-safe-action";
import {
    AnswerDeleteSchema,
    AnswerInsertSchema,
    AnswerUpdateSchema
} from "./schema";
import { Delete } from '@/lib/utils';


export type InputTypeCreateAnswer = z.infer<typeof AnswerInsertSchema>;
export type ReturnTypeCreateAnswer = ActionState<InputTypeCreateAnswer, Answer>;

export type InputTypeUpdateAnswer = z.infer<typeof AnswerUpdateSchema>;
export type ReturnTypeUpdateAnswer = ActionState<InputTypeUpdateAnswer, Answer>;

export type DeleteTypeAnswer = z.infer<typeof AnswerDeleteSchema>;
export type ReturnTypeDeleteAnswer = ActionState<DeleteTypeAnswer, Delete>;