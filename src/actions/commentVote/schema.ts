import { z } from "zod";
import { VoteType } from "@/src/app/generated/prisma/enums";
export const VoteHandleSchema = z.object({
    commentId: z.number().optional(),
    questionId: z.number().optional(),
    answerId: z.number().optional(),
    voteType: z.nativeEnum(VoteType),
    currentPath: z.string(),
    slug: z.string()
});

