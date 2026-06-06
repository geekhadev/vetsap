import { Head } from '@inertiajs/react';
import { VetsapFullCalendar } from '@/components/custom/full-calendar';
import { CALENDAR_PAGE } from '@/pages/agenda/calendar/config';

export default function CalendarIndex() {
    return (
        <>
            <Head title={CALENDAR_PAGE.title} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <VetsapFullCalendar className="min-h-0 flex-1" />
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: CALENDAR_PAGE.breadcrumbs(),
};
