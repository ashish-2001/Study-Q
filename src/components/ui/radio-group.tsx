'use client';
import * as React from 'react';
import * as RadioGroupPrimitve from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';


const RadioGroup = React.forwardRef<
React.ElementRef<typeof RadioGroupPrimitve.Root>,
React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn('grid gap-2', className)}
            {...props}
            ref={ref}
        />
    )
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
React.ElementRef<typeof RadioGroupPrimitive.Item>,
React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.item
            ref={ref}
            className={cn(
                'aspect-square h-4 w-4 rounded-full border -primary text-primary ring-offset-background',
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator classname="flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500"/>
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.item>
    );
});
RadioGroupItem.displayName = RadioGroupPrimitve.Item.displayName;

export {
    RadioGroup, RadioGroupItem
};