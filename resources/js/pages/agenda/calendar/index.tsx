import { Head } from '@inertiajs/react';
import { VetsapFullCalendar } from '@/components/custom/full-calendar';
import {
    CALENDAR_PAGE
    
} from '@/pages/agenda/calendar/config';
import type {CalendarIndexPageProps} from '@/pages/agenda/calendar/config';

export default function CalendarIndex({ holidays }: CalendarIndexPageProps) {
    return (
        <>
            <Head title={CALENDAR_PAGE.title} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <VetsapFullCalendar
                    className="min-h-0 flex-1"
                    holidays={holidays}
                />
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: CALENDAR_PAGE.breadcrumbs(),
};
