import { useCallback, useMemo, useState } from 'react';
import {
    findClientByPhone,
    generateMockVeterinarianBlocks,
    getServiceById,
    getVeterinarianById,
    MOCK_BLOCK_CONFIG,
    MOCK_SERVICES,
} from './mock-data';
import {
    buildBookableSlotsForDate,
    getAvailableDatesFromBlocks,
    getDefaultScheduleForService,
    getFirstBookableSlotForDate,
    groupSlotsIntoBlockRows,
} from './schedule-blocks';
import type { BookingFormState, PetSelection, TimeBlockSlot } from './types';

const initialPetSelection: PetSelection = {
    mode: 'new',
    petName: '',
    petSpecies: '',
};

const veterinarianBlocks = generateMockVeterinarianBlocks();

function createInitialState(): BookingFormState {
    const serviceId = MOCK_SERVICES[0]?.id ?? null;
    const service = serviceId ? getServiceById(serviceId) : undefined;
    const schedule =
        service !== undefined
            ? getDefaultScheduleForService(veterinarianBlocks, service, MOCK_BLOCK_CONFIG)
            : { date: null, slotId: null };

    return {
        step: 'service',
        serviceId,
        date: schedule.date,
        slotId: schedule.slotId,
        phone: '',
        client: null,
        clientLookupDone: false,
        petSelection: initialPetSelection,
        clientName: '',
        clientEmail: '',
    };
}

export function useAppointmentBooking() {
    const [state, setState] = useState<BookingFormState>(createInitialState);

    const selectedService = state.serviceId ? getServiceById(state.serviceId) : undefined;

    const availableDates = useMemo(() => {
        if (!selectedService) {
            return [];
        }

        return getAvailableDatesFromBlocks(veterinarianBlocks, selectedService, MOCK_BLOCK_CONFIG);
    }, [selectedService]);

    const bookableSlotsForSelectedDate = useMemo(() => {
        if (!selectedService || !state.date) {
            return [];
        }

        return buildBookableSlotsForDate(
            veterinarianBlocks,
            state.date,
            selectedService,
            MOCK_BLOCK_CONFIG,
        );
    }, [selectedService, state.date]);

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

    const selectedVeterinarian = selectedSlot
        ? getVeterinarianById(selectedSlot.veterinarianId)
        : undefined;

    const selectService = useCallback((serviceId: string) => {
        const service = getServiceById(serviceId);

        if (!service) {
            return;
        }

        const schedule = getDefaultScheduleForService(veterinarianBlocks, service, MOCK_BLOCK_CONFIG);

        setState((current) => ({
            ...current,
            serviceId,
            date: schedule.date,
            slotId: schedule.slotId,
            step: 'service',
        }));
    }, []);

    const continueToDetails = useCallback(() => {
        if (!state.serviceId || !state.slotId) {
            return;
        }

        setState((current) => ({ ...current, step: 'details' }));
    }, [state.serviceId, state.slotId]);

    const selectDate = useCallback((date: string) => {
        setState((current) => {
            const service = current.serviceId ? getServiceById(current.serviceId) : undefined;

            if (!service) {
                return { ...current, date, slotId: null };
            }

            return {
                ...current,
                date,
                slotId: getFirstBookableSlotForDate(veterinarianBlocks, date, service, MOCK_BLOCK_CONFIG),
            };
        });
    }, []);

    const selectSlot = useCallback((slot: TimeBlockSlot) => {
        setState((current) => ({
            ...current,
            slotId: slot.id,
            date: slot.date,
        }));
    }, []);

    const setPhone = useCallback((phone: string) => {
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

    const lookupClient = useCallback(() => {
        const client = findClientByPhone(state.phone);

        setState((current) => {
            if (!client) {
                return {
                    ...current,
                    client: null,
                    clientLookupDone: true,
                    petSelection: { mode: 'new', petName: '', petSpecies: '' },
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
                clientEmail: client.email,
                petSelection:
                    client.pets.length === 1 && firstPet
                        ? {
                              mode: 'existing',
                              petId: firstPet.id,
                              petName: firstPet.name,
                              petSpecies: firstPet.species,
                          }
                        : { mode: 'new', petName: '', petSpecies: '' },
            };
        });
    }, [state.phone]);

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
                    petName: pet.name,
                    petSpecies: pet.species,
                },
            };
        });
    }, []);

    const selectNewPet = useCallback(() => {
        setState((current) => ({
            ...current,
            petSelection: { mode: 'new', petName: '', petSpecies: '' },
        }));
    }, []);

    const updatePetSelection = useCallback((updates: Partial<PetSelection>) => {
        setState((current) => ({
            ...current,
            petSelection: { ...current.petSelection, ...updates },
        }));
    }, []);

    const updateClientFields = useCallback((fields: Partial<Pick<BookingFormState, 'clientName' | 'clientEmail'>>) => {
        setState((current) => ({ ...current, ...fields }));
    }, []);

    const goBack = useCallback(() => {
        setState((current) => {
            if (current.step === 'details') {
                return { ...current, step: 'service' };
            }

            return current;
        });
    }, []);

    const submitBooking = useCallback(() => {
        setState((current) => ({ ...current, step: 'success' }));
    }, []);

    const resetBooking = useCallback(() => {
        setState(createInitialState());
    }, []);

    const canContinueToDetails = Boolean(state.serviceId && state.date && state.slotId);

    const canSubmit =
        state.clientName.trim().length > 0 &&
        state.petSelection.petName.trim().length > 0 &&
        state.petSelection.petSpecies.trim().length > 0 &&
        state.phone.trim().length > 0;

    return {
        state,
        services: MOCK_SERVICES,
        blockConfig: MOCK_BLOCK_CONFIG,
        availableDates,
        blockRowsForSelectedDate,
        selectedService,
        selectedSlot,
        selectedVeterinarian,
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
