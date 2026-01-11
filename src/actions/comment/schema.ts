import { z } from "zod";


export const CommentInsertSchema = z.object({
    content: z.string().min(2, "Comment content is required"),
    contentId: z.number(),
    parentId: z.number().optional(),
    currentPath: z.string().optional()
});


export const CommentUpdateSchema = z.object({
    commentId: z.string(),
    content: z.string().optional(),
    approved: z.boolean().optional(),
    adminPassword: z.string().optional(),
    currentPath: z.string().optional()
});

export const CommentDeleteSchema = z.object({
    adminPassword: z.string().optional(),
    commentId: z.number(),
    currentPath: z.string().optional()
});

export const CommentPinSchema = z.object({
    commentId: z.number(),
    contentId: z.number(),
    currentPath: z.string().optional()
});