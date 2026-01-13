import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, formItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { textArea } from '@/components/ui/textarea';
import { CalenderIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calender } from '@/components/ui/calender';
import { Popover, PopoverContet, PopoverTrigger } from '@/components/ui/popover';
import { DialogFooter } from '@/components/ui/dialog';


export const formSchema = z.object({
    title: z.string().min(1, {
        message: 'Title is required'
    }),
    start: z.date(),
    startTime: z.string(),
    end: z.date(),
    endTime: z.string(),
    videoLink: z.string().nullable(),
    notes: z.string().nullable()
});

export type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
    form: UseFormReturn<Formvalues>;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    isEditMode: boolean
}

const eventForm: React.FC<EventFormProps> = ({
    form,
    onSubmit,
    onDelete,
    isEditMode
}) => {
    const DateiTimeField: React.FC<{
        dateFieldName: 'start' | 'end'
    }>
}