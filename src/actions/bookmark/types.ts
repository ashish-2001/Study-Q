import { z } from "zod/mini";
import { BookmarkCreateSchema, BookmarkDeleteSchema } from "./schema";;
import { ActionSate } from "@/lib/create-safe-action";
import { Bookmark, Content, CourseContent } from "@/src/app/generated/prisma/client";


export type InputTypeCreateBookmark = z.infer<typeof BookmarkCreateSchema>
export type ReturnTypeCreateBookmark = ActionSate<InputTypeCreateBookmark, Bookmark>;

export type InputTypeDeleteBookmark = z.infer<typeof BookmarkDeleteSchema>;
export type ReturnTypeDeleteBookmark = ActionSate<InputTypeDeleteBookmark, Bookmark>;

export type TBookmarkWithContent = Bookmark & {
    content: Content & {
        parent: { id: number, courses: CourseContent[] } | null;
        courses: CourseContent[];
    };
};
