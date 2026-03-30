'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { MarketingPost } from '@kimuntupro/db';

interface CalendarEvent {
    id: string | undefined;
    title: string;
    date: string;
    color: string;
    extendedProps: { post: MarketingPost };
}

interface CalendarViewProps {
    events: CalendarEvent[];
    onEventClick: (post: MarketingPost) => void;
}

export default function CalendarView({ events, onEventClick }: CalendarViewProps) {
    const [CalendarComponent, setCalendarComponent] = useState<any>(null);
    const [plugins, setPlugins] = useState<any[]>([]);

    useEffect(() => {
        // Dynamically import FullCalendar only on client
        async function loadCalendar() {
            try {
                const [fcModule, dgModule, intModule] = await Promise.all([
                    import('@fullcalendar/react'),
                    import('@fullcalendar/daygrid'),
                    import('@fullcalendar/interaction'),
                ]);
                setCalendarComponent(() => fcModule.default);
                setPlugins([dgModule.default, intModule.default]);
            } catch (error) {
                console.error('[CalendarView] Failed to load FullCalendar:', error);
            }
        }
        loadCalendar();
    }, []);

    if (!CalendarComponent || plugins.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="text-center py-12 text-gray-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <CalendarComponent
                plugins={plugins}
                initialView="dayGridMonth"
                events={events}
                eventClick={(info: any) => {
                    const post = info.event.extendedProps.post;
                    if (post) onEventClick(post);
                }}
                height="auto"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth',
                }}
            />
        </div>
    );
}
