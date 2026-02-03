'use client';
import { useEffect, useState } from "react";
import { AddNotionMetadata } from './AddNotionMetadata';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FaDiscord } from 'react-icons/fa';
import { toast } from 'sonner';
import { useSetRecoilState } from 'recoil';
import { trigger } from "@/src/store/atoms/trigger";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

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
                setIsLoading(false);
                    return;
            }
        }

        const response = await fetch('/api/admin/content', {
            body: JSON.stringify({
                type,
                thumbnail: imageUri,
                title,
                courseId,
                parentContentId,
                metadata,
                adminPassword,
                courseTitle,
                rest,
                discordChecked
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();
        setIsLoading(false);
        if(response.status === 200){
            toast.success(responseData.message);
            setTrigger((prev) => prev + 1);
            setMetadata({});
        } else{
            toast.error(responseData.message || 'Something went wrong');
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 rounded-xl border-2 p-6 lg:grid-cols-7">
            <aside className="col-span-1 flex w-full flex-col gap-8 lg:col-span-3">
                <div>Select the content mode</div>
                <RadioGroup 
                    className='flex max-w-full flex-wrap items-start gap-2'
                    value={type}
                    onValueChange={(value) => {
                        setType(value);
                        setMetadata({});
                    }}
                >
                    <Label htmlFor="appx" className={getLabelClassName('appx')}>
                        <RadioGroupItem value="appx" id="appx"/>
                        <span>Appx</span>
                    </Label>
                    <Label htmlFor="video" className={getLabelClassName('video')}>
                        <RadioGroupItem value="video" id="video"/>
                        <span>Video</span>
                    </Label>
                    <Label htmlFor="folder" className={getLabelClassName('folder')}>
                        <RadioGroupItem value="folder" id="folder"/>
                        <span>Folder</span>
                    </Label>
                </RadioGroup>
                <div className="my-2 flex w-full flex-col gap-4 border-t-2 py-6 md:w-[90%]">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-bold">Apps Integration</h3>
                        <h6 className="text-md text-gray-500">
                            Click app to start sending notification to that platform 
                        </h6>
                    </div>
                    {type === 'video' || type === 'notion' ? (
                        <>
                            <div 
                                onClick={handleDiscordClick}
                                className={`cursor-pointer border-[3px] p-2 ${discordChecked ? 'border-blue-500' : ''} w-fit rounded-lg bg-blue-400 bg-opacity-5`}
                            >
                                <FaDiscord className="text-5xl"/>
                            </div>
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Notification to the discord?</DialogTitle>
                                        <DialogDescription>
                                            Do you want to send the notification to Discard?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleModalChoice(false)}
                                        >
                                            No
                                        </Button>
                                        <Button onClick={() => handleModalChoice(true)}>Yes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <div>No automations available for this option</div>
                    )}
                </div>
            </aside>
            <div className="col-span-1 grid grid-cols-1 gap-4 lg:col-span-4">
                <Input 
                    type="text"
                    placeholder="Title"
                    onChange={(e) => setImageUri(e.target.value)}
                    className="h-4"
                />
                <Input
                    type="text"
                    placeholder="Image Url"
                    onChange={(e) => setImageUri(e.target.value)}
                    className="h-14"
                />
                <Input
                    type="text"
                    placeholder="Admin Password"
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="h-14"
                />
                {type === 'video' && <AddVideosMetadata onChange={setMetadata}/>}
                {type === 'appx' && <AddAppxVideoMetadata onChange={setMetadata}/>}
                {type === 'notion' && <AddNotionMetadata onChange={setMetadata}/>}
                <Button 
                    onClick={handleContentSubmit}
                    disabled={loading}
                    className="w-fit"
                >
                    {loading ? 'Submitting' : 'Submit'}
                </Button>
            </div>
        </div>
    )
};

function AddAppxVideoMetadata({ onChange }: {
    onChange: (metadata: any) => void;
}){
    return (
        <div>
            <Input
                type="text"
                placeholder="Appx video JSON"
                onChange={(e) => onChange({ appxVideoJSON: JSON.stringify(e.target.value)})}
                className="h-14"
            />
        </div>
    );
};

const VARIANTS = 1;

function AddVideosMetadata({
    onChange
}: {
    onChange: (metadata: any) => void;
}){
    const [metadataGlobal, setMetadataGlobal] = useState({} as any);

    useEffect(() => {
        onChange(metadataGlobal);
    }, []);
    return (
        <div>
            {[...Array(VARIANTS)].map((_, i) => (
                <AddVideoMetadata
                    onChange={async (metadata) => {
                        await setMetadataGlobal((m: any) => ({
                            ...m,
                            [`video_1080p_${i}`] : metadata.video_1080,
                            [`video_720p_${i}`] : metadata.video_720,
                            [`video_360p_${i}`] : metadata.video_360
                        }))
                    }} key={i}
                />
            ))}
        </div>
    )
};

function AddVideoMetadata({ onChange }: { onChange: (metadata: any) => void}){
    const [video_1080p, setVideo_1080p] = useState('');
    const [video_720p, setVideo_720p] = useState('');
    const [video_360p, setVideo_360p] = useState('');

    useEffect(() => {
        onChange({ video_1080p, video_720p, video_360p });
    }, [video_1080p, video_720p, video_360p]);

    return (
        <div className="grid grid-cols-1 gap-4 sm:gird-cols-2 md:grid-cols-3">
            <Input
                type="text"
                placeholder="1080p"
                onChange={async (e) => {
                    await setVideo_1080p(e.target.value);
                }}
                className="h-14"
            />
            <Input  
                type="text"
                placeholder="360p"
                onChange={async (e) => {
                    await setVideo_720p(e.target.value);
                }}
                className="h-14"
            />
            <input
                type="text"
                placeholder="360p"
                onChange={async (e) => {
                    await setVideo_360p(e.target.value);
                }}
                className="h-14"
            />
        </div>
    )
};
