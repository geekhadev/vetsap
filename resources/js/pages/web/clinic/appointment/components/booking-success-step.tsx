import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CLINIC_BOOKING_ACTION_BUTTON } from '../clinic-booking-theme';
import type { AppointmentService, Veterinarian } from '../types';

type BookingSuccessStepProps = {
    service: AppointmentService | undefined;
    date: string | null;
    time: string | undefined;
    veterinarian: Veterinarian | undefined;
    clientName: string;
    petName: string;
    companyAddress: string | null;
    onReset: () => void;
};

export function BookingSuccessStep({
    service,
    date,
    time,
    veterinarian,
    clientName,
    petName,
    companyAddress,
    onReset,
}: BookingSuccessStepProps) {
    const formattedDate = date
        ? new Date(`${date}T12:00:00`).toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
          })
        : '';

    return (
        <div className="flex flex-col items-center py-4 text-center max-w-xs mx-auto">
            <CheckCircle2 className="size-12 text-green-600" />
            <h3 className="mt-3 text-lg font-semibold text-green-600">¡Cita agendada!</h3>
            <p className="mt-2 max-w-sm text-sm text-green-600">
                {clientName}, hemos confirmado la cita de <strong>{petName}</strong> para{' '}
                <strong>{service?.name}</strong>.
            </p>
            <ul className="mt-4 w-full max-w-sm space-y-1 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm text-gray-700">
                <li>
                    <span className="text-gray-500">Fecha:</span> {formattedDate}
                </li>
                <li>
                    <span className="text-gray-500">Hora:</span> {time}
                </li>
                {companyAddress && (
                    <li>
                        <span className="text-gray-500">Dirección de la clínica:</span>{' '}
                        {companyAddress}
                    </li>
                )}
                <li>
                    <span className="text-gray-500">Médico:</span> {veterinarian?.name}
                </li>
                <li>
                    <span className="text-gray-500">Mascota:</span> {petName}
                </li>
            </ul>
            <Button type="button" className={cn('mt-5', CLINIC_BOOKING_ACTION_BUTTON)} onClick={onReset}>
                Agendar otra cita
            </Button>
        </div>
    );
}
