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
        
    }
}