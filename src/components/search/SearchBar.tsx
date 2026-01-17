'use client';
import { TSearchedVideos } from '@/app/api/search/route';
import useClickOutside from '@/hooks/useClickOutside';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import React, {
    useCallback,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { CommandMenu } from './CommandMenu';
import { searchResults } from './searchResults';

interface SearchBarProps {
    onCardClick?: () => void
}