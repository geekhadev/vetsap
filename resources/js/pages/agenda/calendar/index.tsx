import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { VetsapFullCalendar } from '@/components/custom/full-calendar';
import { AppointmentDetailModal } from '@/pages/agenda/calendar/appointment-detail-modal';
import { AppointmentForm } from '@/pages/agenda/calendar/appointment-form';
import { CALENDAR_PAGE } from '@/pages/agenda/calendar/config';
import type { CalendarIndexPageProps } from '@/pages/agenda/calendar/config';
import type { AppointmentFormDefaults } from '@/pages/agenda/calendar/types';
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
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<
        string | null
    >(null);

    const openCreateForm = useCallback((defaults?: AppointmentFormDefaults) => {
        setDetailOpen(false);
        setSelectedAppointmentId(null);
        setFormDefaults(defaults ?? buildDefaultAppointmentFormDefaults());
        setFormSessionId((current) => current + 1);
        setFormOpen(true);
    }, []);

    const openAppointmentDetail = useCallback((appointmentId: string) => {
        setFormOpen(false);
        setSelectedAppointmentId(appointmentId);
        setDetailOpen(true);
    }, []);

    const handleDetailOpenChange = useCallback((open: boolean) => {
        setDetailOpen(open);

        if (!open) {
            setSelectedAppointmentId(null);
        }
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

            <AppointmentDetailModal
                open={detailOpen}
                onOpenChange={handleDetailOpenChange}
                appointmentId={selectedAppointmentId}
                canUpdate={can.update}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <VetsapFullCalendar
                    className="min-h-0 flex-1"
                    holidays={holidays}
                    appointments={appointments}
                    canCreate={can.create}
                    onNewAppointment={openCreateForm}
                    onAppointmentClick={openAppointmentDetail}
                />
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: CALENDAR_PAGE.breadcrumbs(),
};
