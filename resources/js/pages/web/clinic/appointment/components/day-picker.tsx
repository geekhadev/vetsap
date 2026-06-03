import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_HOVER,
    CLINIC_BOOKING_SELECTION_ROUNDED,
    CLINIC_BOOKING_SELECTED_FILLED,
    CLINIC_BOOKING_SLIDER_ITEM_DAY,
    CLINIC_BOOKING_UNSELECTED,
} from '../clinic-booking-theme';
import { BookingSlider } from './booking-slider';

type DayPickerProps = {
    dates: string[];
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

export function DayPicker({ dates, selectedDate, onSelect }: DayPickerProps) {
    if (dates.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                No hay días disponibles para este servicio.
            </p>
        );
    }

    return (
        <BookingSlider label="Día disponible" itemCount={dates.length} activeItemKey={selectedDate}>
            {dates.map((dateKey) => {
                const { weekday, day, month } = formatDayLabel(dateKey);
                const isSelected = selectedDate === dateKey;

                return (
                    <button
                        key={dateKey}
                        type="button"
                        data-slider-item={dateKey}
                        onClick={() => onSelect(dateKey)}
                        className={cn(
                            CLINIC_BOOKING_SLIDER_ITEM_DAY,
                            'flex flex-col items-center border px-2 py-3 transition-all',
                            CLINIC_BOOKING_SELECTION_ROUNDED,
                            isSelected
                                ? CLINIC_BOOKING_SELECTED_FILLED
                                : cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER),
                        )}
                    >
                        <span className="text-xs font-medium uppercase opacity-80">{weekday}</span>
                        <span className="text-lg font-bold leading-none">{day} {month}</span>
                    </button>
                );
            })}
        </BookingSlider>
    );
}
