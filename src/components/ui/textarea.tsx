import React, * as react from 'react';
import { cn } from '@/lib/utils';


export interface TextareaProps 
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}

    const TextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
        ({ className, ...props }, ref) => {
            return (
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            )
        }
    );

    TextArea.displayName = 'Textarea';

    export { TextArea };