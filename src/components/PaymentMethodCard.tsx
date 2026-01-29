'use client';
import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { ViewAllDialog } from './ViewAllDialog';

interface payoutMethodCardProps {
    title: string;
    description: string;
    imageSrc: string;
    addresses: | Array<{
        id: number;
        value: string;
        userId: string;
    }>
    | undefined;
    onAdd: (method: string) => void;
    id: string;
    onDelete: (id: number) => void;
}

export const PayoutMethodCard: React.FC<payoutMethodCardProps> = ({
    title,
    description,
    imageSrc,
    addresses,
    onAdd,
    id,
    onDelete
}) => {
    return (
        <div className="group relative flex h-[18rem] cursor-pointer flex-col justify-between overflow-hidden rounded-lg border-2 p-6">
            <div>
                <h3 className="text-lg font-semibold">
                    {title}
                    <p className="text-sm text-muted-foreground">{description}</p>
                </h3>
            </div>
            <div className="my-6 flex items-center gap-2">
                <Button
                    onClick={(e: any) => onAdd(e.target.id)}
                    color="white"
                    id={id}
                    className="font-semi-bold h-[2rem] w-[5rem] text-white"
                >
                    Add
                </Button>
                {addresses?.length !== 0 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                variant={'outline'}
                                className="font-semi-bold h-[2rem] w-[5rem] dark:text-white"
                            >
                                View All
                            </Button>
                        </DialogTrigger>
                        <ViewAllDialog
                            title={`Your ${title}`}
                            addresses={addresses}
                            onDelete={onDelete}
                        />
                    </Dialog>
                )}
            </div>
            <div className="h-full w-full">
                <Image
                    src={imageSrc}
                    alt={title}
                    width={400}
                    height={400}
                    className="absolute bottom-[-50px] right-[8px] h-[10rem] w-[10rem] object-contain opacity-40 transition-all duration-300 ease-in-out group-hover:bottom-[-20px] group-hover:opacity-100"
                />
            </div>
        </div>
    );
};