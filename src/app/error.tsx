'use client';

import React from "react";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';


interface ErrorProps {
    error: Error;
    reset: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="wrapper my-auto flex min-h-screen flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <h1>
                    Oops! Something went wrong
                </h1>
                <p className="mb-6 text-center text-lg text-primary">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <Button onclick={reset}>{reset}</Button>
            </div>
        </div>
    );
};

export default Error;