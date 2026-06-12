import { Head } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { VetsapFullCalendar } from '@/components/custom/full-calendar';
import { mapScheduleWindowsFromPayload } from '@/components/custom/full-calendar/schedule-windows';
import { AppointmentDetailModal } from '@/pages/agenda/calendar/appointment-detail-modal';
import { AppointmentForm } from '@/pages/agenda/calendar/appointment-form';
import { CALENDAR_PAGE } from '@/pages/agenda/calendar/config';
import type { CalendarIndexPageProps } from '@/pages/agenda/calendar/config';
import type { AppointmentFormDefaults } from '@/pages/agenda/calendar/types';
import { buildDefaultAppointmentFormDefaults } from '@/pages/agenda/calendar/types';

export default function CalendarIndex({
    holidays,
    scheduled_days_of_week,
    schedule_windows,
    appointments,
    formOptions,
    appointmentStatuses,
    can,
}: CalendarIndexPageProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [formSessionId, setFormSessionId] = useState(0);
    const [formDefaults, setFormDefaults] = useState(buildDefaultAppointmentFormDefaults);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<
        string | null
    >(null);

    const scheduleWindows = useMemo(
        () => mapScheduleWindowsFromPayload(schedule_windows),
        [schedule_windows],
    );

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
                holidays={holidays}
            />

            <AppointmentDetailModal
                open={detailOpen}
                onOpenChange={handleDetailOpenChange}
                appointmentId={selectedAppointmentId}
                appointmentStatuses={appointmentStatuses}
                holidays={holidays}
                canUpdate={can.update}
                canDelete={can.delete}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <VetsapFullCalendar
                    className="min-h-0 flex-1"
                    holidays={holidays}
                    scheduledDaysOfWeek={scheduled_days_of_week}
                    scheduleWindows={scheduleWindows}
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
