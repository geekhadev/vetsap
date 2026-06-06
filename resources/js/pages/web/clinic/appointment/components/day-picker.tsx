import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_HOVER,
    CLINIC_BOOKING_SELECTION_ROUNDED,
    CLINIC_BOOKING_SELECTED_FILLED,
    CLINIC_BOOKING_SLIDER_ITEM_DAY,
    CLINIC_BOOKING_UNSELECTED,
} from '../clinic-booking-theme';
import { resolveWebBookingDayBlockedReason } from '../schedule-blocks';
import type { BookingHoliday, VeterinarianBlock } from '../types';
import { BookingSlider } from './booking-slider';

type DayPickerProps = {
    dates: string[];
    availableDates: string[];
    holidays: BookingHoliday[];
    scheduledDaysOfWeek: number[];
    veterinarianBlocks: VeterinarianBlock[];
    selectedDate: string | null;
    onSelect: (date: string) => void;
};

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatDayLabel(dateKey: string): { weekday: string; day: string; month: string } {
    const date = new Date(`${dateKey}T12:00:00`);

    return {
        weekday: WEEKDAY_LABELS[date.getDay()],
        day: String(date.getDate()),
        month: date.toLocaleDateString('es-CL', { month: 'short' }),
    };
}

function DayCardContent({ weekday, day, month }: { weekday: string; day: string; month: string }) {
    return (
        <>
            <span className="text-xs font-medium uppercase opacity-80">{weekday}</span>
            <span className="text-lg font-bold leading-none">
                {day} {month}
            </span>
        </>
    );
}

export function DayPicker({
    dates,
    availableDates,
    holidays,
    scheduledDaysOfWeek,
    veterinarianBlocks,
    selectedDate,
    onSelect,
}: DayPickerProps) {
    const availableDateSet = new Set(availableDates);
    const holidaysByDate = new Map(holidays.map((holiday) => [holiday.date, holiday.name]));
    const scheduledDays = new Set(scheduledDaysOfWeek);

    if (dates.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                No hay días disponibles para este servicio.
            </p>
        );
    }

    return (
        <BookingSlider
            label="Día disponible"
            itemCount={dates.length}
            activeItemKey={selectedDate}
            initialScrollPosition="start"
        >
            {dates.map((dateKey) => {
                const { weekday, day, month } = formatDayLabel(dateKey);
                const isSelected = selectedDate === dateKey;
                const isAvailable = availableDateSet.has(dateKey);
                const blockedReason = resolveWebBookingDayBlockedReason(
                    dateKey,
                    availableDateSet,
                    holidaysByDate,
                    scheduledDays,
                    veterinarianBlocks,
                );

                const dayCardClassName = cn(
                    'flex w-full flex-col items-center border px-2 py-3 transition-all',
                    CLINIC_BOOKING_SELECTION_ROUNDED,
                    isSelected && isAvailable
                        ? CLINIC_BOOKING_SELECTED_FILLED
                        : isAvailable
                          ? cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER)
                          : 'cursor-help border-gray-100 bg-gray-50 text-gray-400',
                );

                if (!blockedReason) {
                    return (
                        <button
                            key={dateKey}
                            type="button"
                            data-slider-item={dateKey}
                            onClick={() => onSelect(dateKey)}
                            className={cn(CLINIC_BOOKING_SLIDER_ITEM_DAY, dayCardClassName)}
                        >
                            <DayCardContent weekday={weekday} day={day} month={month} />
                        </button>
                    );
                }

                return (
                    <div
                        key={dateKey}
                        data-slider-item={dateKey}
                        className={CLINIC_BOOKING_SLIDER_ITEM_DAY}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className={dayCardClassName}>
                                    <DayCardContent weekday={weekday} day={day} month={month} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">{blockedReason}</TooltipContent>
                        </Tooltip>
                    </div>
                );
            })}
        </BookingSlider>
    );
}
