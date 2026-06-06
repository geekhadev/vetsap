import { router, useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ClinicBookingController from '@/actions/App/Http/Controllers/Web/ClinicBookingController';
import { isValidChileanMobilePhone } from './booking-phone';
import {
    buildBookableSlotsForDate,
    consumeBookedBlocks,
    getAvailableDatesFromBlocks,
    getCalendarDatesFromToday,
    getDefaultScheduleForService,
    getFirstBookableSlotForDate,
    groupSlotsIntoBlockRows,
} from './schedule-blocks';
import type { BookingScheduleContext } from './schedule-blocks';
import type {
    AppointmentService,
    BookingClient,
    BookingFormState,
    PetSelection,
    PublicBookingSchedule,
    TimeBlockSlot,
    Veterinarian,
} from './types';

const initialPetSelection: PetSelection = {
    mode: 'new',
    petName: '',
    speciesId: '',
    petSpecies: '',
};

function createInitialState(
    services: AppointmentService[],
    schedule: BookingScheduleContext,
): BookingFormState {
    const serviceId = services[0]?.id ?? null;
    const service = services.find((item) => item.id === serviceId);
    const defaultSchedule =
        service !== undefined
            ? getDefaultScheduleForService(schedule, service)
            : { date: null, slotId: null };

    return {
        step: 'service',
        serviceId,
        date: defaultSchedule.date,
        slotId: defaultSchedule.slotId,
        phone: '',
        client: null,
        clientLookupDone: false,
        petSelection: initialPetSelection,
        clientName: '',
        clientEmail: '',
    };
}

type LookupClientResponse = {
    client: BookingClient | null;
};

function mapClientFromLookup(client: BookingClient & {
    pets: Array<{
        id: string;
        customer_id?: string;
        customerId?: string;
        name: string;
        species: string;
        breed?: string | null;
    }>;
}): BookingClient {
    return {
        ...client,
        email: client.email ?? '',
        phone: client.phone ?? '',
        pets: client.pets.map((pet) => ({
            id: pet.id,
            customerId: pet.customerId ?? pet.customer_id ?? client.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed ?? undefined,
        })),
    };
}

const emptyStorePayload = {
    phone: '',
    service_id: '',
    doctor_id: '',
    appointment_date: '',
    starts_at_time: '',
    customer_id: '',
    client_name: '',
    client_email: '',
    patient_id: '',
    pet_name: '',
    species_id: '',
};

export function useAppointmentBooking(
    companySlug: string,
    bookingSchedule: PublicBookingSchedule,
) {
    const lookupHttp = useHttp({ phone: '' });
    const storeHttp = useHttp(emptyStorePayload);
    const [liveSchedule, setLiveSchedule] = useState(bookingSchedule);

    useEffect(() => {
        setLiveSchedule(bookingSchedule);
    }, [bookingSchedule]);

    const scheduleContext = useMemo<BookingScheduleContext>(
        () => ({
            veterinarianBlocks: liveSchedule.veterinarianBlocks,
            doctors: liveSchedule.doctors,
            blockConfig: liveSchedule.blockConfig,
        }),
        [liveSchedule],
    );

    const [state, setState] = useState<BookingFormState>(() =>
        createInitialState(bookingSchedule.services, {
            veterinarianBlocks: bookingSchedule.veterinarianBlocks,
            doctors: bookingSchedule.doctors,
            blockConfig: bookingSchedule.blockConfig,
        }),
    );
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const services = liveSchedule.services;
    const doctors = liveSchedule.doctors;
    const species = liveSchedule.species;

    const selectedService = useMemo(
        () => services.find((service) => service.id === state.serviceId),
        [services, state.serviceId],
    );

    const calendarDates = useMemo(
        () => getCalendarDatesFromToday(liveSchedule.blockConfig.daysAhead),
        [liveSchedule.blockConfig.daysAhead],
    );

    const availableDates = useMemo(() => {
        if (!selectedService) {
            return [];
        }

        return getAvailableDatesFromBlocks(scheduleContext, selectedService);
    }, [scheduleContext, selectedService]);

    const bookableSlotsForSelectedDate = useMemo(() => {
        if (!selectedService || !state.date) {
            return [];
        }

        return buildBookableSlotsForDate(scheduleContext, state.date, selectedService);
    }, [scheduleContext, selectedService, state.date]);

    const blockRowsForSelectedDate = useMemo(
        () => groupSlotsIntoBlockRows(bookableSlotsForSelectedDate),
        [bookableSlotsForSelectedDate],
    );

    const selectedSlot = useMemo(() => {
        if (!state.slotId) {
            return null;
        }

        return bookableSlotsForSelectedDate.find((slot) => slot.id === state.slotId) ?? null;
    }, [bookableSlotsForSelectedDate, state.slotId]);

    const selectedVeterinarian = useMemo<Veterinarian | undefined>(() => {
        if (!selectedSlot) {
            return undefined;
        }

        return doctors.find((doctor) => doctor.id === selectedSlot.veterinarianId);
    }, [doctors, selectedSlot]);

    const selectService = useCallback(
        (serviceId: string) => {
            const service = services.find((item) => item.id === serviceId);

            if (!service) {
                return;
            }

            const defaultSchedule = getDefaultScheduleForService(scheduleContext, service);

            setState((current) => ({
                ...current,
                serviceId,
                date: defaultSchedule.date,
                slotId: defaultSchedule.slotId,
                step: 'service',
            }));
        },
        [scheduleContext, services],
    );

    const continueToDetails = useCallback(() => {
        if (!state.serviceId || !state.slotId) {
            return;
        }

        setState((current) => ({ ...current, step: 'details' }));
    }, [state.serviceId, state.slotId]);

    const selectDate = useCallback(
        (date: string) => {
            setState((current) => {
                const service = services.find((item) => item.id === current.serviceId);

                if (!service) {
                    return { ...current, date, slotId: null };
                }

                const slotId = getFirstBookableSlotForDate(scheduleContext, date, service);

                if (!slotId) {
                    return current;
                }

                return {
                    ...current,
                    date,
                    slotId,
                };
            });
        },
        [scheduleContext, services],
    );

    const selectSlot = useCallback((slot: TimeBlockSlot) => {
        setState((current) => ({
            ...current,
            slotId: slot.id,
            date: slot.date,
        }));
    }, []);

    const setPhone = useCallback((phone: string) => {
        setLookupError(null);
        setState((current) => ({
            ...current,
            phone,
            clientLookupDone: false,
            client: null,
            petSelection: initialPetSelection,
            clientName: '',
            clientEmail: '',
        }));
    }, []);

    const lookupClient = useCallback(async () => {
        if (!isValidChileanMobilePhone(state.phone)) {
            setLookupError('Ingresa un teléfono móvil chileno válido (9 dígitos, comienza con 9).');

            return;
        }

        setIsLookingUp(true);
        setLookupError(null);

        try {
            lookupHttp.transform(() => ({ phone: state.phone }));

            const response = (await lookupHttp.post(
                ClinicBookingController.lookupClient.url(companySlug),
            )) as LookupClientResponse;

            const client = response.client ? mapClientFromLookup(response.client) : null;

            setState((current) => {
                if (!client) {
                    return {
                        ...current,
                        client: null,
                        clientLookupDone: true,
                        petSelection: initialPetSelection,
                        clientName: '',
                        clientEmail: '',
                    };
                }

                const firstPet = client.pets[0];

                return {
                    ...current,
                    client,
                    clientLookupDone: true,
                    clientName: client.name,
                    clientEmail: client.email ?? '',
                    petSelection:
                        client.pets.length === 1 && firstPet
                            ? {
                                  mode: 'existing',
                                  petId: firstPet.id,
                                  customerId: firstPet.customerId,
                                  petName: firstPet.name,
                                  speciesId: '',
                                  petSpecies: firstPet.species,
                              }
                            : initialPetSelection,
                };
            });
        } catch {
            setLookupError('No pudimos buscar tu teléfono. Intenta de nuevo.');
        } finally {
            setIsLookingUp(false);
        }
    }, [companySlug, lookupHttp, state.phone]);

    const selectExistingPet = useCallback((petId: string) => {
        setState((current) => {
            const pet = current.client?.pets.find((item) => item.id === petId);

            if (!pet) {
                return current;
            }

            return {
                ...current,
                petSelection: {
                    mode: 'existing',
                    petId: pet.id,
                    customerId: pet.customerId,
                    petName: pet.name,
                    speciesId: '',
                    petSpecies: pet.species,
                },
            };
        });
    }, []);

    const selectNewPet = useCallback(() => {
        setState((current) => ({
            ...current,
            petSelection: initialPetSelection,
        }));
    }, []);

    const updatePetSelection = useCallback((updates: Partial<PetSelection>) => {
        setState((current) => ({
            ...current,
            petSelection: { ...current.petSelection, ...updates },
        }));
    }, []);

    const updateClientFields = useCallback(
        (fields: Partial<Pick<BookingFormState, 'clientName' | 'clientEmail'>>) => {
            setState((current) => ({ ...current, ...fields }));
        },
        [],
    );

    const goBack = useCallback(() => {
        setState((current) => {
            if (current.step === 'details') {
                return { ...current, step: 'service' };
            }

            return current;
        });
    }, []);

    const submitBooking = useCallback(async () => {
        if (!state.serviceId || !state.date || !selectedSlot) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        const payload: Record<string, string> = {
            phone: state.phone,
            service_id: state.serviceId,
            doctor_id: selectedSlot.veterinarianId,
            appointment_date: state.date,
            starts_at_time: selectedSlot.startTime,
        };

        const customerId =
            state.petSelection.mode === 'existing' && state.petSelection.customerId
                ? state.petSelection.customerId
                : state.client?.id;

        if (customerId) {
            payload.customer_id = customerId;
        } else {
            payload.client_name = state.clientName.trim();
        }

        if (state.clientEmail.trim() !== '') {
            payload.client_email = state.clientEmail.trim();
        }

        if (state.petSelection.mode === 'existing' && state.petSelection.petId) {
            payload.patient_id = state.petSelection.petId;
        } else {
            payload.pet_name = state.petSelection.petName.trim();
            payload.species_id = state.petSelection.speciesId;
        }

        try {
            storeHttp.transform(() => ({
                ...emptyStorePayload,
                ...payload,
            }));

            await storeHttp.post(ClinicBookingController.storeAppointment.url(companySlug));

            setLiveSchedule((current) => ({
                ...current,
                veterinarianBlocks: consumeBookedBlocks(current.veterinarianBlocks, selectedSlot),
            }));

            setState((current) => ({ ...current, step: 'success' }));
        } catch {
            setSubmitError('No pudimos confirmar la cita. Revisa los datos e intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    }, [
        companySlug,
        selectedSlot,
        state.client,
        state.clientEmail,
        state.clientName,
        state.date,
        state.petSelection.mode,
        state.petSelection.customerId,
        state.petSelection.petId,
        state.petSelection.petName,
        state.petSelection.speciesId,
        state.phone,
        state.serviceId,
        storeHttp,
    ]);

    const resetBooking = useCallback(() => {
        setLookupError(null);
        setSubmitError(null);
        setState(createInitialState(services, scheduleContext));
        router.reload({ only: ['bookingSchedule'], preserveScroll: true });
    }, [scheduleContext, services]);

    const canContinueToDetails = Boolean(state.serviceId && state.date && state.slotId);

    const hasValidPetSelection =
        state.petSelection.mode === 'existing'
            ? Boolean(state.petSelection.petId)
            : state.petSelection.petName.trim().length > 0 &&
              state.petSelection.speciesId.trim().length > 0;

    const canSubmit =
        state.clientLookupDone &&
        isValidChileanMobilePhone(state.phone) &&
        state.clientName.trim().length > 0 &&
        hasValidPetSelection &&
        !isLookingUp &&
        !isSubmitting;

    return {
        state,
        services,
        doctors,
        species,
        blockConfig: liveSchedule.blockConfig,
        veterinarianBlocks: liveSchedule.veterinarianBlocks,
        holidays: liveSchedule.holidays,
        scheduledDaysOfWeek: liveSchedule.scheduledDaysOfWeek,
        calendarDates,
        availableDates,
        blockRowsForSelectedDate,
        selectedService,
        selectedSlot,
        selectedVeterinarian,
        isLookingUp,
        isSubmitting,
        lookupError,
        submitError,
        selectService,
        continueToDetails,
        selectDate,
        selectSlot,
        setPhone,
        lookupClient,
        selectExistingPet,
        selectNewPet,
        updatePetSelection,
        updateClientFields,
        goBack,
        submitBooking,
        resetBooking,
        canContinueToDetails,
        canSubmit,
    };
}

export type AppointmentBookingController = ReturnType<typeof useAppointmentBooking>;
