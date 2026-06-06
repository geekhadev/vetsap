import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { VetsapFullCalendar } from '@/components/custom/full-calendar';
import { AppointmentForm } from '@/pages/agenda/calendar/appointment-form';
import {
    CALENDAR_PAGE
    
} from '@/pages/agenda/calendar/config';
import type {CalendarIndexPageProps} from '@/pages/agenda/calendar/config';
import { buildDefaultAppointmentFormDefaults } from '@/pages/agenda/calendar/types';

export default function CalendarIndex({
    holidays,
    appointments,
    formOptions,
    can,
}: CalendarIndexPageProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [formSessionId, setFormSessionId] = useState(0);
    const [formDefaults, setFormDefaults] = useState(buildDefaultAppointmentFormDefaults);

    const openCreateForm = useCallback(() => {
        setFormDefaults(buildDefaultAppointmentFormDefaults());
        setFormSessionId((current) => current + 1);
        setFormOpen(true);
    }, []);

    return (
        <>
            <Head title={CALENDAR_PAGE.title} />

            <AppointmentForm
                key={formSessionId}
                open={formOpen}
                onOpenChange={setFormOpen}
                formOptions={formOptions}
                defaults={formDefaults}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <VetsapFullCalendar
                    className="min-h-0 flex-1"
                    holidays={holidays}
                    appointments={appointments}
                    canCreate={can.create}
                    onNewAppointment={openCreateForm}
                />
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: CALENDAR_PAGE.breadcrumbs(),
};
