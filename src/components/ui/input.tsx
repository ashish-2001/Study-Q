import * as react from 'react';
import { cn } from '@/lib/utils';


export interface InputProps 
    extends react.InputHTMLAttributes<HTMLInputElement>{}

    const Input = React.forwardRef<HTMLInputElement, InputProps>(
        ({ className, type, ...props }, ref) => {
            return (
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-md border border-gray-700/50 bg-transparent px-2',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            );
        }
    );
    Input.displayName = 'Input';

    export { Input };
