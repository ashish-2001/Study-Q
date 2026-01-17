'use client';
import { TSearchedVideos } from "@/src/app/api/mobile/search/route";
import { 
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command';
import { SiGithub, SiNotion } from '@icons-pack/react-simple-icons';
import {
    Bookmark,
    Calender,
    History,
    Logout,
    MessageCircleQuestion,
    NotebookPen,
    NotebookText
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { Play } from "next/font/google";


interface CommandMenuProps {
    icon: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    commandSearchTerm: string;
    onCommandSearchTermChange: (value: string) => void;
    loading: boolean;
    searchedVideos: TSearchedVideos[] | null;
    onCardClick: (videoUrl: string) => void;
    onClose: () => void;
}

export function CommandMenu({ 
    icon,
    open,
    onOpenChange,
    commandSearchTerm,
    onCommandSearchTermChange,
    loading,
    searchedVideos,
    onCardClick,
    onClose
}: CommandMenuProps){
    const router = useRouter();
    const handleShortcut = useCallback(
        (route: string) => {
            if(route.startsWith('http')){
                window.location.href = route;
            } else {
                router.push(route);
            }
            onClose();
        },
        [router, onClose]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if(open && e.ctrlKey){
                const shortcuts = {
                    c: '/home',
                    h: '/watch-history',
                    b: '/bookmark',
                    d: '/question',
                    s: 'https://projects.100xdevs.com/',
                    g: 'https://github.com/code100x/'
                };

                const key= e.key.toLowerCase() as keyof typeof shortcuts;
                if(shortcuts[key]){
                    e.preventDefault();
                    handleShortcut(shortcuts[key]);
                }
            }
        },
        [open, handleShortcut]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput 
                placeholder="Type a command or search..."
                value={commandSearchTerm}
                onValueChange={onCommandSearchTermChange}
            />
            <CommandList>
                <CommandEmpty>
                    No results found.
                </CommandEmpty>
                <CommandGroup heading="Videos">
                    {!loading &&  searchedVideos && searchedVideos.length > 0 && searchedVideos.map((video) => (
                        <CommandItem 
                            key={video.id} 
                            onSelect={() => {
                                if(video.parentId && video.parent?.courses.length){
                                    const courseId = video.parent.courses[0].courseId;
                                    const videoUrl = `/courses/${courseId}/${video.parentId}/${video.id}`;
                                    onCardClick(videoUrl);
                                    onClose();
                                }
                            }}
                        >
                            <Play className="mr-2 h-4 w-4"/>
                            <span className="truncate">{video.title}</span>
                        </CommandItem>
                    ))}
                    {!loading && (!searchedVideos || searchedVideos.length === 0) && (
                        <CommandItem>No videos found</CommandItem>
                    )}
                </CommandGroup>
                <CommandSeparator/>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => handleShortcut('/calender')}>
                        <Calender className="mr-2 h-4 w-4"/>
                        <span>Calender</span>
                    </CommandItem>
                    <CommandItem onSelect={() => handleShortcut('https://github.com/100xdevs-cohort-3/assignments')}>
                        <NotebookPen
                            className="mr-2 h-4 w-4"
                        />
                        <span>Cohort 3 Assignments</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => {
                            signOut();
                            onClose();
                        }}
                    >
                        <Logout className="mr-2 h-4 w-4"/>
                        <span>Log Out</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator/>
                <CommandGroup>
                    <CommandItem onSelect={() => handleShortcut('/home')}>
                        <NotebookText className="mr-2 h-4 w-4"/>
                        <span>Courses</span>
                        <CommandShortcut>{icon}</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => handleShortcut('/watch-history')}>
                        <History className="mr-2 h-4 w-4"/>
                        <span>Watch History</span>
                        <CommandShortcut>{icon}</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => handleShortcut('/question')}>
                        <MessageCircleQuestion className="mr-2 h-4 w-4"/>
                        <span>Questions</span>
                        <CommandShortcut>{icon}D</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => handleShortcut('https://projects.100xdevs.com/')}>
                        <SiNotion
                            className="mr-2 h-4 w-4"
                        />
                        <span>Slides</span>
                        <CommandShortcut>{icon}S</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => handleShortcut('https://github.com/code100x/')}>
                        <SiGithub
                            className="mr-2 h-4 w-4"
                        />
                        <span>Contribute to code100x</span>
                        <CommandShortcut>{icon}G</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}