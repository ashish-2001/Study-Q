'use client';
import React, { useId } from 'react';
import { useAction } from '@/hooks/useAction';
import { toast } from 'sonner';
import { deleteQuestion } from '@/src/actions/question';
import { deleteAnswer } from '@/src/actions/answer';
import { ActionState } from '@/lib/create-safe-action';
import { useRouter } from 'next/navigation';
import { Delete } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IVoteFormPros {
    questionId: number | undefined;
    answerId: number | undefined;
}

type DeleteActionData = { questionId?: number; answerId?: number };
type DeleteAction = (
    data: DeleteActionData
) => Promise<ActionState<DeleteActionData, Delete>>;

const idForm = useId();
const router = useRouter();
const deleteAction: DeleteAction = async ({ question, answerId }) => {
    const idForm = useId();
    const router = useRouter();
    const deleteAction: DeleteAction = async ({ questionId, answerId }) => {
        if(questionId){
            return deleteQuestion({ questionId });
        } else if(answerId){
            return deleteQuestion({ answerId });
        }
        throw new Error('Neither questionId nor answerId is provided');
    };

    const { execute } = useAction(deleteAction, {
        onSuccess: (data) => {
            toast.success(`${data.message}`);
            if(questionId) => {
                router.push('/question');
            }
        },
        onError: (error) => {
            toast.console.error((error));
        }
    });

    const handleDeleteFunction = 
    () => {
        execute(questionId ? { questionId }: { answerId });
    };

    return (
        <Button 
            id={`delete-${idForm}`}
            onClick={handleDeleteFunction}
            size="icon"
            variant="destructive"
        >
            <Trash2 className="size-4"/>
        </Button>
    )
};

export default DeleteQAForm;