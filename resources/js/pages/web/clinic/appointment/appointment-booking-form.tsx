import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CLINIC_BOOKING_ACTION_BUTTON, CLINIC_BOOKING_BACK_BUTTON } from './clinic-booking-theme';
import { BookingStepIndicator } from './components/booking-step-indicator';
import { BookingSuccessStep } from './components/booking-success-step';
import { ClientPetStep } from './components/client-pet-step';
import { ServiceStep } from './components/service-step';
import { useAppointmentBooking } from './use-appointment-booking';

export function AppointmentBookingForm() {
    const booking = useAppointmentBooking();
    const { state } = booking;

    const showBack = state.step === 'details';

    return (
        <Card
            id="appointment-booking"
            className="w-full gap-0 border-gray-200/80 py-0 shadow-xl scroll-mt-24"
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
                        availableDates={booking.availableDates}
                        selectedDate={state.date}
                        blockRows={booking.blockRowsForSelectedDate}
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
                        onPhoneChange={booking.setPhone}
                        onLookup={booking.lookupClient}
                        onSelectExistingPet={booking.selectExistingPet}
                        onSelectNewPet={booking.selectNewPet}
                        onPetSelectionChange={booking.updatePetSelection}
                        onClientFieldsChange={booking.updateClientFields}
                    />
                )}

                {state.step === 'success' && (
                    <BookingSuccessStep
                        service={booking.selectedService}
                        date={state.date}
                        time={
                            booking.selectedSlot
                                ? `${booking.selectedSlot.startTime} – ${booking.selectedSlot.endTime}`
                                : undefined
                        }
                        veterinarian={booking.selectedVeterinarian}
                        clientName={state.clientName}
                        petName={state.petSelection.petName}
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
                            Atrás
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
                            onClick={booking.submitBooking}
                        >
                            Confirmar cita
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}
