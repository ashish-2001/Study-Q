'use client';
import React, { useState, useEffect } from "react"; 
import { momentLocalizer, Views } from 'react-big-calender';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calender/lib/addons/dragAndDrop';
import moment from 'moment';
import ShadcnBigCalender from '@/components/big-calender/shadcn-big-calender';
import { Button } from '@/components/ui/button';
import {
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import EventForm, { FormValues } from '.event-form';
import { Event as PrismaEvent } from '@prisma/client';
import Link from 'next/link';


interface CalenderEvent extends Omit<PrismaEvent, 'createdAt' | 'updatedAt'>{
    start: Date;
    end: Date;
    videoLink: string | null;
    notes: string | null;
}

const DnDCalender = withDragAndDrop<CalenderEvent>(ShadcnBigCalender);
const localizer = momentLocalizer(moment);

interface CalenderPageProps {
    isAdmin: boolean;
}

const CalenderPageComment: React.FC<CalenderPageProps> = ({ isAdmin }) => {
    const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(
        Views.WEEK
    );
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<CalenderEvent[]>([]);
    const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState<CalenderEvent | null>(null);
    const [isViewEventDialogOpen, setisViewEventDialogOpen] = useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            title: '',
            start: new Date(),
            startTime: '09:00',
            end: new Date(),
            endTIme: '10:00',
            videoLink: null,
            notes: null
        }
    });

    useEffect(() =. {
        loadEvent();
    }, []);

    const loadEvents = async () => {
        const fetchedEvents = await fetchEvents();
        setEvents(
            fetchedEvents.map((event) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }))
        );
    };

    const handleNavigate = (newDate: Date) => setDate(newDate);
    const handleViewChange = (newView: (typeof Views)[keyof typeof Views]) => 
        setView(newView);

    const combineDateAndTime = (date: Date, time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes);
        return newDate;
    };

    const handleAddEvent = async (values: FormValues) => {
        const newEvent: Omit<CalenderEvent, 'id'> = {
            title: values.title,
            start: combineDateAndTime(values.start, values.startTime),
            end: combineDateAndTime(values.end, values.endTime),
            videoLink: values.videoLink,
            notes: values.notes
        };
        await addEvent(newEvent);
        loadEvents();
        setIsAddEventDialogOpen(false);
    };

    const handleUpdateEvent = async (values: FormValues) => {
        if(selectedEvent){
            const updatedEvent: CalenderEvent = {
                ...selectedEvent,
                title: values.title,
                start: combineDateAndTime(values.start, values.startTime),
                end: combineDateAndTime(values.end, values.endTIme),
                videoLink: values.videoLink,
                notes: values.notes
            };
            await updateEvent(updateEvent as any);
            loadEvents();
            setSelectedEvent(null);
        }
    };

    const handleDeleteEvent = async () => {
        if(selectedEvent){
            await deleteEvent(selectedEvent.id);
            loadEvents();
            setSelectedEvent(null);
        }
    };

    const eventStyleGetter = (event: CalenderEvent) => {
        const day = new Date(event.start).getDay();
        let backgroundColor;

        if(day === 5){
            backgroundColor = '#14b8a6';
        } else if(day === 6 || day === 0){
            backgroundColor = '#fb923c';
        } else {
            backgroundColor = '#3b82f6';
        }
    }

    return {
        style: {
            backgroundColor,
            borderRadius: '0.5rem',
            opacity: 0.9,
            color: 'white',
            border: 'none',
            padding: '0.5rem'
        }
    };
};

const onEventClick = (event: CalenderEvent) => {
    setSelectedEvent(event);
    if(isAdmin){
        form.reset({
            title: event.title,
            start: new Date(event.start),
            startTIme: format(new Date(event.start), 'HH:mm'),
            end: new Date(event.end),
            endTime: format(new Date(event.end), 'HH:mm'),
            videoLink: event.videoLink,
            notes: event.notes
        });
    } else{
        setIsViewEventDialogOpen(true);
    }
};

const onEventDrop = (args: EventInteractionArgs<CalenderEvent>) => {
    if(isAdmin && args.event){
        const updatedEvent: CalenderEvent = {
            ...args.event,
            start: new Date(args.start),
            end: new Date(args.end)
        };
        handleUpdateEvent({
            ...updatedEvent,
            startTime: format(updatedEvent.start, 'HH:mm'),
            endTime: format(updatedEvent.end, 'HH:mm')
        });
    }
};

return (
    <main className="w-full pt-20">
        {isAdmin && (
            <Button onClick={() => setIsAddEventDialogOpen(true)}>Add Event</Button>
        )}
        <Card className="mx-auto">
            <CardContent className="p-0">
                <DnCalender
                    localizer={localizer}
                    events={events}
                    style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                    selectable={isAdmin}
                    date={date}
                    onNavigate={handleNavigate}
                    view={view}
                    onView={handleViewChange}
                    resizable
                    draggableAccessor={() => isAdmin}
                    resizableAccessor={() => isAdmin}
                    onEventDrop={onEventDrop}
                    onEventResize={onEventResize}
                    onSelectEvent={onEventClick}
                    className="rbc-calender-custom"
                    eventPropGetter={eventStyleGetter}
                />
            </CardContent>
        </Card>
        <Dialog
            open={isAddEventDialogOpen}
            onOpenChange={setIsAddEventDialogOpen}
        >
            <DialogContent className="rounded-md shadow-lg">
                <DialogHeader>
                    <DialogTitle>Add Event</DialogTitle>
                </DialogHeader>
                <EventForm isEditMode={false} form={form} onSubmit={handleAddEvent}/>
            </DialogContent>
        </Dialog>
        <Dialog 
            open={Boolean(selectedEvent && isAdmin)}
            onOpenChange={(open) => {
                if(!open) setSelectedEvent(null);
            }}
        >
            <DialogContent className="rounded-md shadow-lg">
                <dialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                </dialogHeader>
                <EventForm 
                    form={form}
                    onSubmit={handleUpdatedEvent}
                    onDelete={handleDeleteEvent}
                    isEditMode={true}
                />
            </DialogContent>
        </Dialog>
        <Dialog
            open={isViewEventDialogOpen}
            onOpenChange={(open) => {
                if(!open) setIsViewEventDialogOpen(false);
            }}
        >
            <DialogContent className="rounded-md shadow-lg">
                <DialogHeader>
                    <DialogTitle>{selectedEvent?.title}</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p>
                        <strong>Start:</strong>{' '}
                        {selectedEvent && format(new Date(selectedEvent.start), 'PPPPp')}
                    </p>
                    <p>
                        <strong>End:</strong>{' '}
                        <Link
                            href={selectedEvent.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >Join</Link>
                    </p>
                    {selectedEvent?.notes && (
                        <p>
                            <strong>Notes:</strong>{selectedEvent.notes}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </main>
    );
};

export default CalenderPageComment;