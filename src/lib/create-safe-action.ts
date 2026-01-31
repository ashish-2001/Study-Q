import { z } from "zod";

export type FieldErrors<T> = {
    [K in keyof]?: string[];
};

export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>;
    error?: string | null;
    data: TOutput;
};

export const createSafeAction = <TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (validatedData: TInput) => Promise<ActionState<$InferTupleInputType, TOutput>> => {
        const validationResult = Schema.safeParse(data);
        if(!validationResult.success){
            return {
                fieldErrors: validationResult.error.flatten().fieldErrors as FieldErrors<TInput>
            };
        }

        return handler(validationResult.data);
    };
);