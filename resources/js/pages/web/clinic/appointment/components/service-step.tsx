import type { AppointmentService, BlockScheduleRow, TimeBlockSlot } from '../types';
import { ScheduleStep } from './schedule-step';
import { ServicePicker } from './service-picker';

type ServiceStepProps = {
    services: AppointmentService[];
    selectedServiceId: string | null;
    selectedService: AppointmentService | undefined;
    availableDates: string[];
    selectedDate: string | null;
    blockRows: BlockScheduleRow[];
    selectedSlotId: string | null;
    onSelectService: (serviceId: string) => void;
    onSelectDate: (date: string) => void;
    onSelectSlot: (slot: TimeBlockSlot) => void;
};

export function ServiceStep({
    services,
    selectedServiceId,
    selectedService,
    availableDates,
    selectedDate,
    blockRows,
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
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    blockRows={blockRows}
                    selectedSlotId={selectedSlotId}
                    onSelectDate={onSelectDate}
                    onSelectSlot={onSelectSlot}
                />
            )}
        </div>
    );
}
