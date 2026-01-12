import { CommentType } from "../app/generated/prisma/enums";

export interface QueryPaams {
    limit?: number;
    page?: number;
    tabType?: number;
    search?: number;
    date?: number;
    type?: number;
    parentId?: number;
    userId?: number;
    commentId?: number;
    timestamp?: number;
    editCommentId?: number;
    newPost?: 'open' | 'close';
}

export enum TabType {
    md = 'Most downvotes',
    mu = 'Most upvotes',
    mr = 'Most Recent',
    mq = 'My question'
}

export type Delete = {
    message: string
}

export enum ROLES {
    ADMIN = 'admin',
    USER = 'user'
}