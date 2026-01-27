'use client';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import useModek from '@/hooks/useModel';
import Model from './Modal';
import MDEditor from '@uiw/react-md-editor';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from './ui/button';
import { useAction } from '@/hooks/useAction';
import { createQuestion } from '../actions/question';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getUpdateUrl, searchParamsToObject } from '@/lib/utils';
import { FormPostInput } from './posts/form/form-input';
import { FormPostErrors } from './posts/form/form-errors';
import { x } from 'lucide-react';


export const NewPostDialog = () => {
    const { theme } = useTheme();
    const formref = useRef<ElementRef<'form'>>(null);
    const searchParam = useSearchParams();
    const paramsObject = searchParamsToObject(searchParam as any);
    const path = useParams();
    
}