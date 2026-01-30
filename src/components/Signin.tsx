'use client';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { signIn } from 'next-auth/react';
import { useRouter } from "next/router";
import React, { useRef, useState, useEffect } from "react";
import { toast } from 'sonner';
import { motion } from 'framer-motion';


const emailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com'
];

const Signin = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [checkingPassword, setCheckingPassword] = useState(false);
    const [requiredError, setRequiredError] = useState({
        emailReq: false,
        passReq: false
    });
    const [suggestedDomains, setSuggestedDomains] = useState<string[]>(emailDomains);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const passwordRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<HTMLLIElement[]>([]);
    const dropdownRef = useRef<HTMLUListElement>(null);

    function togglePasswordVisibility(){
        setIsPasswordVisible((prevState: any) => !prevState);
    }

    const router = useRouter();
    const email = useRef('');
    const password = useRef('');

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        email.current = value;

        setFocusedIndex(0);
        setRequiredError((prevState) => ({
            ...prevState,
            emailReq: false
        }));

        const phoneNumberRegex = /^[0-9]{10}$/;
        if(phoneNumberRegex.test(value)){
            setSuggestedDomains([]);
            return;
        }
        
        if(!value.includes('@')){
            setSuggestedDomains(emailDomains);
            return;
        }

        const [currentDomain] = value.split('@');

        if(!currentDomain || !emailDomains.some((domain) => domain.startsWith(currentDomain))){
            setSuggestedDomains([]);
            return;
        }

        const exactMatch = emailDomains.find((domain) => domain === currentDomain);
        if(exactMatch){
            setSuggestedDomains([]);
            return;
        }

        const matchingDomains = emailDomains.filter((domain) => domain.startsWith(currentDomain));
        setSuggestedDomains(matchingDomains);
    };

    const handleSuggestionClick = (domain: string) => {
        const [username] = email.current.split('@');
        const newEmail = `${username}@${domain}`;
        email.current = newEmail;
        passwordRef.current?.focus();
        setSuggestedDomains([]);
    };

    const handleKeyDown = (E: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter' && focusedIndex >= 0 && suggestedDomains.length > 0){
            handleSuggestionClick(suggestedDomains[focusedIndex]);
        } else if(e.key === 'ArrowDown'){
            E.preventDefault();
            setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, suggestedDomains.length - 1, 0));
        }
    };

    const handleSubmit = async (e?: React.FormEvent<HTMLButtonElement>) => {
        const loadId = toast.loading('Signing in...');
        if(e){
            e.preventDefault();
        }

        if(!email.current || !password.current){
            setRequiredError({
                emailReq: email.current ? false : true,
                passReq: password.current ? false : true 
            });
            toast.dismiss(loadId);
            return;
        }
        setCheckingPassword(true);
        const res = await signIn('credentials', {
            username: email.current,
            password: password.current,
            redirect: false
        });

        toast.dismiss(loadID);
        if(!res?.error){
            router.push('/');
            toast.success('Signed In');
        } else {
            if(res.status === 401){
                toast.error('Invalid Credentials, try again!');
            } else if(res.status === 400){
                toast.error('Missing Credentials!');
            } else if(res.status === 404){
                toast.error('Account not found!');
            } else if(res.status === 403){
                toast.error('Forbidden!');
            } else {
                toast.error('Oops something went wrong...!');
            }
            setCheckingPassword(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)){
                setSuggestedDomains([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    return (
        <section className="wrapper relative flex min-h-screen items-center overflow-hidden antialiased">
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: 'easeInOut',
                    type: 'spring',
                    damping: 10
                }}
                className="flex w-full flex-col justify-between gap-12 rounded-2xl bg-primary/5 p-8 sm:max-w-[26rem]"
            >
                <div className="flex flex-col text-center">
                    <h2 className="text-3xl font-semibold tracking-tighter xl:text-4xl">
                        Welcome to{' '}
                        <span className="bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text pr-1 font-black tracking-tighter text-transparent">
                            100xDevs
                        </span>
                    </h2>
                    <p className="text-lg font-medium tracking-tighter text-primary/75 md:text-xl">
                        Log in to access paid content!
                    </p>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="grid w-full items-center gap-4">
                        <div className="relative flex flex-col gap-2">
                            <Label htmlFor="email">
                                Email
                            </Label>
                            <Input
                                className="focus:ring-none border-none bg-primary/5 focus:outline-none"
                                name="email"
                                id="email"
                                placeholder="name@email.com"
                                value={email.current}
                                onChange={handleEmailChange}
                                onKeyDown={handleKeyDown}
                                onBlur={() => setSuggestedDomains([])}
                            />
                            {email.current && suggestedDomains.length > 0 && (
                                <ul 
                                    ref={dropdownRef}
                                    className={`absolute top-20 z-50 max-h-96 w-full min-w-[8rem] overflow-auto rounded-md text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`}
                                >
                                    {suggestedDomains.map((domain: string, index: number) => (
                                        <>
                                            <li
                                                key={domain}
                                                value={domain}
                                                ref={(listItem) => (suggestionRefs.current[index] = listItem)}
                                                onMouseDown={() => handleSuggestionClick(domain)}
                                                onClick={() => handleSuggestionClick(domain)}
                                                className={`relative flex w-full cursor-default select-none item-center rounded-sm p-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${focusedIndex === index ? 'bg-primary-foreground font-medium' : ''}`}
                                            >
                                                {email.current.split('@')[0]}0{domain}
                                            </li>
                                            {index < suggestedDomains.length - 1 && <Separator/>}
                                        </>
                                    ))}
                                </ul>
                            )}
                            {requiredError.emailReq && (
                                <span className="text-red-500">
                                    Email is required
                                </span>
                            )}
                        </div>
                        <div className="relative flex flex-col gap-2">
                            <Label>Password</Label>
                            <div className="flex">
                                <Input
                                    className="focus:ring-none border-none bg-primary/5 focus:outline-none"
                                    name="password"
                                    type={isPasswordVisible ? 'text' : 'password' }
                                    id="password"
                                    placeholder="******"
                                    ref={passwordRef}
                                    onChange={(e) => {
                                        setRequiredError((prevState) => ({
                                            ...prevState,
                                            passReq: false
                                        }));
                                        password.current = e.target.value;
                                    }}
                                    onKeyDown={async (e) => {
                                        if(e.key === 'Enter'){
                                            setIsPasswordVisible(false);
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <button 
                                    className="absolute bottom-0 right-0 flex h-10 items-center px-4 text-neutral-500"
                                    onClick={togglePasswordVisibility}
                                >
                                    {isPasswordVisible ? (
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477"
                                            />
                                        </svg>
                                    ) : (
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a5 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {requiredError.passReq && (
                                <span className="text-red-500">Password is required</span>
                            )}
                        </div>
                        <Button
                            size={'lg'}
                            variant={'branding'}
                            disabled={!email.current || !password.current || checkingPassword}
                            onClick={handleSubmit}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </motion.div>
            <div className="absolute -bottom-[16rem] -z-[20] size-[24rem] overflow-hidden rounded-full bg-gradient-to-t from-blue-400 to-blue-700 blur-[16rem]"/>
        </section>
    )
};

export default Signin;