import type {
    AppointmentService,
    BlockScheduleRow,
    BookingHoliday,
    TimeBlockSlot,
    Veterinarian,
    VeterinarianBlock,
} from '../types';
import { ScheduleStep } from './schedule-step';
import { ServicePicker } from './service-picker';

type ServiceStepProps = {
    services: AppointmentService[];
    selectedServiceId: string | null;
    selectedService: AppointmentService | undefined;
    calendarDates: string[];
    availableDates: string[];
    holidays: BookingHoliday[];
    scheduledDaysOfWeek: number[];
    veterinarianBlocks: VeterinarianBlock[];
    selectedDate: string | null;
    blockRows: BlockScheduleRow[];
    doctors: Veterinarian[];
    selectedSlotId: string | null;
    onSelectService: (serviceId: string) => void;
    onSelectDate: (date: string) => void;
    onSelectSlot: (slot: TimeBlockSlot) => void;
};

export function ServiceStep({
    services,
    selectedServiceId,
    selectedService,
    calendarDates,
    availableDates,
    holidays,
    scheduledDaysOfWeek,
    veterinarianBlocks,
    selectedDate,
    blockRows,
    doctors,
    selectedSlotId,
    onSelectService,
    onSelectDate,
    onSelectSlot,
}: ServiceStepProps) {
    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <p className="text-sm text-gray-600">Elige el servicio que necesitas para tu mascota.</p>
                <ServicePicker
                    services={services}
                    selectedServiceId={selectedServiceId}
                    onSelect={onSelectService}
                />
            </div>

            {selectedService && (
                <ScheduleStep
                    service={selectedService}
                    calendarDates={calendarDates}
                    availableDates={availableDates}
                    holidays={holidays}
                    scheduledDaysOfWeek={scheduledDaysOfWeek}
                    veterinarianBlocks={veterinarianBlocks}
                    selectedDate={selectedDate}
                    blockRows={blockRows}
                    doctors={doctors}
                    selectedSlotId={selectedSlotId}
                    onSelectDate={onSelectDate}
                    onSelectSlot={onSelectSlot}
                />
            )}
        </div>
    );
}
