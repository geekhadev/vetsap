import { CalendarDays, Check, Clock, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    buildBookingCalendarEvent,
    buildGoogleCalendarUrl,
    downloadIcsFile,
} from '../calendar-links';
import {
    CLINIC_BOOKING_APPLE_CALENDAR_BUTTON,
    CLINIC_BOOKING_BACK_BUTTON,
    CLINIC_BOOKING_GOOGLE_CALENDAR_BUTTON,
} from '../clinic-booking-theme';
import type { AppointmentService, Veterinarian } from '../types';
import { AppleCalendarIcon, GoogleCalendarIcon } from './calendar-brand-icons';

type BookingSuccessStepProps = {
    service: AppointmentService | undefined;
    date: string | null;
    startTime: string | undefined;
    endTime: string | undefined;
    veterinarian: Veterinarian | undefined;
    clientName: string;
    petName: string;
    companyName: string;
    companyAddress: string | null;
    onReset: () => void;
};

function clientFirstName(fullName: string): string {
    const first = fullName.trim().split(/\s+/)[0];

    return first && first.length > 0 ? first : fullName;
}

export function BookingSuccessStep({
    service,
    date,
    startTime,
    endTime,
    veterinarian,
    clientName,
    petName,
    companyName,
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

    const timeLabel =
        startTime && endTime ? `${startTime} - ${endTime}` : (startTime ?? endTime ?? '');

    const calendarEvent =
        date && startTime && endTime && service
            ? buildBookingCalendarEvent({
                  companyName,
                  serviceName: service.name,
                  petName,
                  veterinarianName: veterinarian?.name,
                  companyAddress,
                  date,
                  startTime,
                  endTime,
              })
            : null;

    const googleCalendarUrl = calendarEvent ? buildGoogleCalendarUrl(calendarEvent) : null;
    const firstName = clientFirstName(clientName);

    return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center py-2 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="size-8 stroke-[3]" aria-hidden />
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-gray-900">
                ¡Cita confirmada para {petName}!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 text-balance">
                {firstName}, tu cita con <strong>{petName}</strong>
                {service ? (
                    <>
                        {' '}
                        para <strong>{service.name}</strong>
                    </>
                ) : null}{' '}
                ha sido programada con éxito.
            </p>

            {calendarEvent && (
                <div className="mt-5 w-full rounded-2xl bg-gray-50 px-4 py-4 text-left">
                    <p className="text-sm font-semibold text-gray-900">Añadir a mi calendario</p>
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-clinic-600" aria-hidden />
                        <span className="leading-snug">
                            {formattedDate}
                            {timeLabel ? `, ${timeLabel}` : ''}
                        </span>
                    </div>
                    <div className="mt-3 flex flex-row gap-2">
                        {googleCalendarUrl && (
                            <a
                                href={googleCalendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={CLINIC_BOOKING_GOOGLE_CALENDAR_BUTTON}
                            >
                                <GoogleCalendarIcon className="size-6 shrink-0" />
                                <span className="truncate">Google</span>
                            </a>
                        )}
                        <button
                            type="button"
                            className={CLINIC_BOOKING_APPLE_CALENDAR_BUTTON}
                            onClick={() => downloadIcsFile(calendarEvent)}
                        >
                            <AppleCalendarIcon className="size-6 shrink-0" />
                            <span className="truncate">Apple</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-3 w-full rounded-2xl bg-gray-50 px-4 py-4">
                <p className="text-sm font-semibold text-gray-900">Prepárate para la cita</p>
                <ul className="mt-4 grid grid-cols-2 gap-3">
                    <li className="flex flex-col items-center gap-2 text-center text-balance">
                        <span className="flex size-11 items-center justify-center rounded-full bg-clinic-100 text-clinic-700">
                            <PhoneCall className="size-5" aria-hidden />
                        </span>
                        <span className="text-xs leading-snug text-gray-600">
                            Te llamaremos un día antes para confirmar la tu cita agendada.
                        </span>
                    </li>
                    <li className="flex flex-col items-center gap-2 text-center text-balance">
                        <span className="flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <Clock className="size-5" aria-hidden />
                        </span>
                        <span className="text-xs leading-snug text-gray-600">Llega 5 min antes de tu cita para que podamos atenderte.</span>
                    </li>
                </ul>
            </div>

            <Button
                type="button"
                variant="ghost"
                className={cn('mt-4', CLINIC_BOOKING_BACK_BUTTON)}
                onClick={onReset}
            >
                Agendar otra cita
            </Button>
        </div>
    );
}
