import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CLINIC_BOOKING_ACTION_BUTTON, CLINIC_BOOKING_BACK_BUTTON } from './clinic-booking-theme';
import { BookingStepIndicator } from './components/booking-step-indicator';
import { BookingSuccessStep } from './components/booking-success-step';
import { ClientPetStep } from './components/client-pet-step';
import { ServiceStep } from './components/service-step';
import type { PublicBookingSchedule } from './types';
import { useAppointmentBooking } from './use-appointment-booking';

type AppointmentBookingFormProps = {
    companySlug: string;
    companyName: string;
    companyAddress: string | null;
    bookingSchedule: PublicBookingSchedule;
};

export function AppointmentBookingForm({
    companySlug,
    companyName,
    companyAddress,
    bookingSchedule,
}: AppointmentBookingFormProps) {
    const booking = useAppointmentBooking(companySlug, bookingSchedule);
    const { state } = booking;

    const showBack = state.step === 'details';

    return (
        <Card
            id="appointment-booking"
            className="w-full gap-0 border-gray-200/80 bg-white py-0 text-gray-900 shadow-xl scroll-mt-24 dark:bg-white dark:text-gray-900"
        >
            <CardHeader className="border-b border-gray-100 px-4 py-4 sm:px-5">
                {state.step !== 'success' && (
                    <div className="pt-3">
                        <BookingStepIndicator currentStep={state.step} />
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-5 sm:py-5">
                {state.step === 'service' && (
                    <ServiceStep
                        services={booking.services}
                        selectedServiceId={state.serviceId}
                        selectedService={booking.selectedService}
                        calendarDates={booking.calendarDates}
                        availableDates={booking.availableDates}
                        holidays={booking.holidays}
                        scheduledDaysOfWeek={booking.scheduledDaysOfWeek}
                        veterinarianBlocks={booking.veterinarianBlocks}
                        selectedDate={state.date}
                        blockRows={booking.blockRowsForSelectedDate}
                        doctors={booking.doctors}
                        selectedSlotId={state.slotId}
                        onSelectService={booking.selectService}
                        onSelectDate={booking.selectDate}
                        onSelectSlot={booking.selectSlot}
                    />
                )}

                {state.step === 'details' && (
                    <ClientPetStep
                        phone={state.phone}
                        client={state.client}
                        clientLookupDone={state.clientLookupDone}
                        petSelection={state.petSelection}
                        clientName={state.clientName}
                        clientEmail={state.clientEmail}
                        species={booking.species}
                        isLookingUp={booking.isLookingUp}
                        lookupError={booking.lookupError}
                        submitError={booking.submitError}
                        onPhoneChange={booking.setPhone}
                        onLookup={() => void booking.lookupClient()}
                        onSelectExistingPet={booking.selectExistingPet}
                        onSelectNewPet={booking.selectNewPet}
                        onPetSelectionChange={booking.updatePetSelection}
                        onClientFieldsChange={booking.updateClientFields}
                    />
                )}

                {state.step === 'success' && state.confirmedBooking && (
                    <BookingSuccessStep
                        service={booking.confirmedService}
                        date={state.confirmedBooking.date}
                        startTime={state.confirmedBooking.startTime}
                        endTime={state.confirmedBooking.endTime}
                        veterinarian={booking.confirmedVeterinarian}
                        clientName={state.clientName}
                        petName={state.petSelection.petName}
                        companyName={companyName}
                        companyAddress={companyAddress}
                        onReset={booking.resetBooking}
                    />
                )}
            </CardContent>

            {state.step !== 'success' && (
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
                    {showBack ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className={CLINIC_BOOKING_BACK_BUTTON}
                            onClick={booking.goBack}
                        >
                            Cambiar horario o servicio
                        </Button>
                    ) : (
                        <span />
                    )}
                    {state.step === 'service' && (
                        <Button
                            type="button"
                            className={CLINIC_BOOKING_ACTION_BUTTON}
                            disabled={!booking.canContinueToDetails}
                            onClick={booking.continueToDetails}
                        >
                            Continuar
                        </Button>
                    )}
                    {state.step === 'details' && (
                        <Button
                            type="button"
                            className={CLINIC_BOOKING_ACTION_BUTTON}
                            disabled={!booking.canSubmit}
                            onClick={() => void booking.submitBooking()}
                        >
                            {booking.isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Confirmando…
                                </>
                            ) : (
                                'Confirmar cita'
                            )}
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}
