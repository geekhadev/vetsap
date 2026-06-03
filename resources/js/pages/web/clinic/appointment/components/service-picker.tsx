import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_HOVER,
    CLINIC_BOOKING_SELECTION_ROUNDED,
    CLINIC_BOOKING_SELECTED_FILLED,
    CLINIC_BOOKING_SELECTED_FILLED_MUTED,
    CLINIC_BOOKING_SLIDER_ITEM_SERVICE,
    CLINIC_BOOKING_UNSELECTED,
} from '../clinic-booking-theme';
import type { AppointmentService } from '../types';
import { BookingSlider } from './booking-slider';

type ServicePickerProps = {
    services: AppointmentService[];
    selectedServiceId: string | null;
    onSelect: (serviceId: string) => void;
};

export function ServicePicker({ services, selectedServiceId, onSelect }: ServicePickerProps) {
    if (services.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                No hay servicios disponibles.
            </p>
        );
    }

    return (
        <BookingSlider label="Servicio" itemCount={services.length} activeItemKey={selectedServiceId}>
            {services.map((item) => {
                const isSelected = selectedServiceId === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        data-slider-item={item.id}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                            CLINIC_BOOKING_SLIDER_ITEM_SERVICE,
                            'flex flex-col justify-between border px-2.5 py-3 text-left transition-all',
                            CLINIC_BOOKING_SELECTION_ROUNDED,
                            isSelected
                                ? CLINIC_BOOKING_SELECTED_FILLED
                                : cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER),
                        )}
                    >
                        <span
                            className={cn(
                                'line-clamp-1 text-sm leading-snug font-semibold -mb-1',
                                isSelected ? 'text-white' : 'text-gray-900',
                            )}
                        >
                            {item.name}
                        </span>
                        <span
                            className={cn(
                                'mt-2 flex items-center gap-1 text-[11px]',
                                isSelected ? CLINIC_BOOKING_SELECTED_FILLED_MUTED : 'text-gray-500',
                            )}
                        >
                            <Clock className="size-3 shrink-0" aria-hidden />
                            {item.blockCount}b · {item.durationMinutes}m
                        </span>
                    </button>
                );
            })}
        </BookingSlider>
    );
}
