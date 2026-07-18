import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_HIGHLIGHT_SURFACE,
    CLINIC_BOOKING_HOVER,
    CLINIC_BOOKING_SELECTION_ROUNDED,
    CLINIC_BOOKING_SELECTED_FILLED,
    CLINIC_BOOKING_SELECTED_RING,
    CLINIC_BOOKING_SLIDER_ITEM_SCHEDULE,
    CLINIC_BOOKING_UNSELECTED,
} from '../clinic-booking-theme';
import type { AppointmentService, BlockScheduleRow, TimeBlockSlot, Veterinarian } from '../types';
import { BookingSlider } from './booking-slider';

type BlockSchedulePickerProps = {
    service: AppointmentService;
    rows: BlockScheduleRow[];
    doctors: Veterinarian[];
    selectedSlotId: string | null;
    onSelectSlot: (slot: TimeBlockSlot) => void;
};

const DOCTOR_NAME_MAX_LENGTH = 22;

function formatDoctorDisplayName(fullName: string, maxLength = DOCTOR_NAME_MAX_LENGTH): string {
    const normalized = fullName.trim().replace(/\s+/g, ' ');

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function BlockSchedulePicker({
    service,
    rows,
    doctors,
    selectedSlotId,
    onSelectSlot,
}: BlockSchedulePickerProps) {
    const doctorsById = useMemo(
        () => new Map(doctors.map((doctor) => [doctor.id, doctor])),
        [doctors],
    );
    const activeRowKey = useMemo(() => {
        if (!selectedSlotId) {
            return null;
        }

        const row = rows.find((item) => item.slots.some((slot) => slot.id === selectedSlotId));

        return row ? `${row.blockIndex}-${row.startTime}` : null;
    }, [rows, selectedSlotId]);

    if (rows.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                No hay bloques disponibles para este día. Prueba otro.
            </p>
        );
    }

    return (
        <BookingSlider label="Horario" itemCount={rows.length} activeItemKey={activeRowKey}>
            {rows.map((row) => {
                const multipleVets = row.slots.length > 1;
                const rowHasSelection = row.slots.some((slot) => slot.id === selectedSlotId);
                const rowKey = `${row.blockIndex}-${row.startTime}`;

                return (
                    <div
                        key={rowKey}
                        data-slider-item={rowKey}
                        className={cn(
                            CLINIC_BOOKING_SLIDER_ITEM_SCHEDULE,
                            'flex flex-col rounded-lg border p-2.5 transition-colors',
                            rowHasSelection
                                ? CLINIC_BOOKING_SELECTED_RING
                                : multipleVets
                                  ? CLINIC_BOOKING_HIGHLIGHT_SURFACE
                                  : CLINIC_BOOKING_UNSELECTED,
                        )}
                    >
                        <div className="mb-2 flex items-start justify-between gap-1">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {row.startTime}
                                    {service.blockCount > 1 && (
                                        <span className="font-normal text-gray-500"> – {row.endTime}</span>
                                    )}
                                </p>
                            </div>
                            {multipleVets && (
                                <Badge
                                    variant="secondary"
                                        className="h-5 shrink-0 gap-0.5 border-clinic-200 bg-white px-1.5 text-[10px] text-clinic-800"
                                >
                                    <Users className="size-2.5" aria-hidden />
                                    {row.slots.length}
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] font-medium text-gray-500">
                                {multipleVets ? 'Médicos disponibles' : 'Médico'}
                            </p>
                            {row.slots.map((slot) => {
                                const veterinarian = doctorsById.get(slot.veterinarianId);
                                const isSelected = selectedSlotId === slot.id;

                                return (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => onSelectSlot(slot)}
                                        title={veterinarian?.name}
                                        aria-label={`Médico: ${veterinarian?.name ?? ''}`}
                                        className={cn(
                                            'w-full min-w-0 border px-3 py-2 text-left text-xs transition-all',
                                            CLINIC_BOOKING_SELECTION_ROUNDED,
                                            isSelected
                                                ? CLINIC_BOOKING_SELECTED_FILLED
                                                : cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER),
                                        )}
                                    >
                                        <span className="block truncate font-semibold">
                                            {formatDoctorDisplayName(veterinarian?.name ?? '')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </BookingSlider>
    );
}
