'use client';
import { useEffect, useState } from "react";
import { AddNotionMetadata } from './AddNotionMetadata';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from ''@/components/ui/label;
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FaDiscord } from 'react-icons/fa';
import { toast } from 'sonner';
import { useSetRecoilState } from 'recoil';
import { trigger } from '@/store/atoms/trigger';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';


export const AddContent = ({
    rest,
    courseId,
    parentContentId,
    courseTitle
}: {
    rest: any;
    courseId: number;
    parentContentId?: number;
    courseTitle: string
}) => {
    const [type, setType] = useState('folder');
    const [imageUri, setImageUri] = useState('');
    const [title, setTitle] = useState('');
    const [metadata, setMetadata] = useState({});
    const [discordChecked, setDiscordChecked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const setTrigger = useSetRecoilState(trigger);


    const handleDiscordClick = () => {
        setIsModalOpen(true);
    };

    const handleModalChoice = (choice: boolean) => {
        setDiscordChecked(choice);
        setIsModalOpen(false);
    };

    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setIsLoading] = useState<boolean>(false);

    const getLabelClassName = (value: string) => {
        return `flex gap-1 p-4 rounded-lg items-center space-x-2 ${type === value ? 'border-[3px] border-blue-500' : 'border-[3px]'}`;
    };

    const formatInputJSON = (value: string ) => {
        const valWithout = value.replaceAll('\\', ''.slice(1, -1));
        if(valWithout[0] === '{'){
            return valWithout;
        }
        return valWithout.slice(1, -1);
    };

    const validateJSON = (value: string) => {
        try{
            JSON.parse(value);
            return true;
        } catch(e){
            return false;
        }
    };

    const handleContentSubmit = async () => {
        setIsLoading(true);
        if(type === 'appx'){
            metadata.appxVideoJSON = formatInputJSON(metadata.appxVideoJSON);

            if(!validateJSON(metadata.appxVideoJSON)){
                toast.error("Invalid JSON");
                setIsLoading(true);
                if(type === 'appx'){
                    metadata.appxVideoJSON = formatInputJSON(metadata.appx)
                }
            }
        }
    }
}
