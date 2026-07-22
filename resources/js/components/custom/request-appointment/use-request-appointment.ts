import { useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import AppointmentsController from '@/actions/App/Http/Controllers/Customer/AppointmentsController';
import {
    buildBookableSlotsForDate,
    getAvailableDatesFromBlocks,
    getCalendarDatesFromToday,
    getDefaultScheduleForService,
    getFirstBookableSlotForDate,
    groupSlotsIntoBlockRows,
} from '@/pages/web/clinic/appointment/schedule-blocks';
import type { BookingScheduleContext } from '@/pages/web/clinic/appointment/schedule-blocks';
import {
    mapPublicBookingSchedule
    
    
} from '@/pages/web/clinic/appointment/types';
import type {AppointmentService, TimeBlockSlot} from '@/pages/web/clinic/appointment/types';
import type {
    CustomerAppointmentFormOptions,
    CustomerAppointmentFormOptionsPayload,
    CustomerAppointmentPetOption,
    CustomerAppointmentStorePayload,
} from './types';

const emptyStorePayload: CustomerAppointmentStorePayload = {
    patient_id: '',
    service_id: '',
    doctor_id: '',
    appointment_date: '',
    starts_at_time: '',
    notes: '',
};

type UseRequestAppointmentArgs = {
    open: boolean;
};

export function useRequestAppointment({ open }: UseRequestAppointmentArgs) {
    const optionsHttp = useHttp({});
    const storeHttp = useHttp(emptyStorePayload);
    const optionsHttpRef = useRef(optionsHttp);
    const storeHttpRef = useRef(storeHttp);
    const requestIdRef = useRef(0);

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [options, setOptions] = useState<CustomerAppointmentFormOptions | null>(
        null,
    );
    const [patientId, setPatientId] = useState('');
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [date, setDate] = useState<string | null>(null);
    const [slotId, setSlotId] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<keyof CustomerAppointmentStorePayload, string>>
    >({});

    useEffect(() => {
        optionsHttpRef.current = optionsHttp;
    }, [optionsHttp]);

    useEffect(() => {
        storeHttpRef.current = storeHttp;
    }, [storeHttp]);

    const resetForm = useCallback((pets: CustomerAppointmentPetOption[]) => {
        setPatientId(pets.length === 1 ? (pets[0]?.id ?? '') : '');
        setServiceId(null);
        setDate(null);
        setSlotId(null);
        setFieldErrors({});
    }, []);

    const loadOptions = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setLoadError(false);
        setOptions(null);

        try {
            const response = (await optionsHttpRef.current.get(
                AppointmentsController.formOptions.url(),
            )) as CustomerAppointmentFormOptionsPayload;

            if (requestId !== requestIdRef.current) {
                return;
            }

            const mapped: CustomerAppointmentFormOptions = {
                pets: response.pets ?? [],
                schedule: mapPublicBookingSchedule(response.schedule),
            };

            setOptions(mapped);
            resetForm(mapped.pets);

            const firstService = mapped.schedule.services[0];

            if (firstService) {
                const scheduleContext: BookingScheduleContext = {
                    veterinarianBlocks: mapped.schedule.veterinarianBlocks,
                    doctors: mapped.schedule.doctors,
                    blockConfig: mapped.schedule.blockConfig,
                };
                const defaults = getDefaultScheduleForService(
                    scheduleContext,
                    firstService,
                );

                setServiceId(firstService.id);
                setDate(defaults.date);
                setSlotId(defaults.slotId);
            }
        } catch {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setLoadError(true);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [resetForm]);

    useEffect(() => {
        if (!open) {
            return;
        }

        void loadOptions();
    }, [loadOptions, open]);

    const scheduleContext = useMemo<BookingScheduleContext | null>(() => {
        if (!options) {
            return null;
        }

        return {
            veterinarianBlocks: options.schedule.veterinarianBlocks,
            doctors: options.schedule.doctors,
            blockConfig: options.schedule.blockConfig,
        };
    }, [options]);

    const services = useMemo(
        () => options?.schedule.services ?? [],
        [options],
    );
    const selectedService: AppointmentService | null =
        services.find((service) => service.id === serviceId) ?? null;

    const calendarDates = useMemo(() => {
        if (!options) {
            return [];
        }

        return getCalendarDatesFromToday(options.schedule.blockConfig.daysAhead);
    }, [options]);

    const availableDates = useMemo(() => {
        if (!scheduleContext || !selectedService) {
            return [];
        }

        return getAvailableDatesFromBlocks(scheduleContext, selectedService);
    }, [scheduleContext, selectedService]);

    const blockRows = useMemo(() => {
        if (!scheduleContext || !selectedService || !date) {
            return [];
        }

        return groupSlotsIntoBlockRows(
            buildBookableSlotsForDate(scheduleContext, date, selectedService),
        );
    }, [date, scheduleContext, selectedService]);

    const selectedSlot: TimeBlockSlot | null = useMemo(() => {
        if (!slotId) {
            return null;
        }

        for (const row of blockRows) {
            const slot = row.slots.find((item) => item.id === slotId);

            if (slot) {
                return slot;
            }
        }

        return null;
    }, [blockRows, slotId]);

    const selectService = useCallback(
        (nextServiceId: string) => {
            if (!scheduleContext) {
                return;
            }

            const service = services.find((item) => item.id === nextServiceId);

            if (!service) {
                return;
            }

            const defaults = getDefaultScheduleForService(scheduleContext, service);

            setServiceId(nextServiceId);
            setDate(defaults.date);
            setSlotId(defaults.slotId);
            setFieldErrors((current) => ({
                ...current,
                service_id: undefined,
                appointment_date: undefined,
                starts_at_time: undefined,
                doctor_id: undefined,
            }));
        },
        [scheduleContext, services],
    );

    const selectDate = useCallback(
        (nextDate: string) => {
            if (!scheduleContext || !selectedService) {
                return;
            }

            setDate(nextDate);
            setSlotId(
                getFirstBookableSlotForDate(
                    scheduleContext,
                    nextDate,
                    selectedService,
                ),
            );
            setFieldErrors((current) => ({
                ...current,
                appointment_date: undefined,
                starts_at_time: undefined,
                doctor_id: undefined,
            }));
        },
        [scheduleContext, selectedService],
    );

    const selectSlot = useCallback((slot: TimeBlockSlot) => {
        setSlotId(slot.id);
        setFieldErrors((current) => ({
            ...current,
            starts_at_time: undefined,
            doctor_id: undefined,
        }));
    }, []);

    const canSubmit =
        patientId !== '' &&
        selectedService !== null &&
        date !== null &&
        selectedSlot !== null &&
        !submitting &&
        !loading;

    const submit = useCallback(async () => {
        if (!selectedService || !date || !selectedSlot || patientId === '') {
            return;
        }

        setSubmitting(true);
        setFieldErrors({});

        const payload: CustomerAppointmentStorePayload = {
            patient_id: patientId,
            service_id: selectedService.id,
            doctor_id: selectedSlot.veterinarianId,
            appointment_date: date,
            starts_at_time: selectedSlot.startTime,
            notes: '',
        };

        try {
            storeHttpRef.current.transform(() => payload);
            await storeHttpRef.current.post(AppointmentsController.store.url());
            toast.success('Cita solicitada correctamente.');

            return true;
        } catch {
            const errors = storeHttpRef.current.errors as Record<
                string,
                string | undefined
            >;
            const next: Partial<
                Record<keyof CustomerAppointmentStorePayload, string>
            > = {};

            (
                Object.keys(emptyStorePayload) as Array<
                    keyof CustomerAppointmentStorePayload
                >
            ).forEach((key) => {
                const value = errors[key];

                if (typeof value === 'string' && value !== '') {
                    next[key] = value;
                }
            });

            setFieldErrors(next);
            toast.error(
                'No pudimos solicitar la cita. Revisa los datos e intenta de nuevo.',
            );

            return false;
        } finally {
            setSubmitting(false);
        }
    }, [date, patientId, selectedService, selectedSlot]);

    return {
        loading,
        loadError,
        submitting,
        options,
        pets: options?.pets ?? [],
        services,
        doctors: options?.schedule.doctors ?? [],
        holidays: options?.schedule.holidays ?? [],
        scheduledDaysOfWeek: options?.schedule.scheduledDaysOfWeek ?? [],
        veterinarianBlocks: options?.schedule.veterinarianBlocks ?? [],
        patientId,
        serviceId,
        date,
        slotId,
        fieldErrors,
        calendarDates,
        availableDates,
        blockRows,
        selectedService,
        selectedSlot,
        canSubmit,
        setPatientId,
        selectService,
        selectDate,
        selectSlot,
        loadOptions,
        submit,
    };
}
