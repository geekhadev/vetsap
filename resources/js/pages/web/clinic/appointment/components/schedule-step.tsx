import type {
    AppointmentService,
    BlockScheduleRow,
    BookingHoliday,
    TimeBlockSlot,
    Veterinarian,
    VeterinarianBlock,
} from '../types';
import { BlockSchedulePicker } from './block-schedule-picker';
import { DayPicker } from './day-picker';

type ScheduleStepProps = {
    service: AppointmentService;
    calendarDates: string[];
    availableDates: string[];
    holidays: BookingHoliday[];
    scheduledDaysOfWeek: number[];
    veterinarianBlocks: VeterinarianBlock[];
    selectedDate: string | null;
    blockRows: BlockScheduleRow[];
    doctors: Veterinarian[];
    selectedSlotId: string | null;
    onSelectDate: (date: string) => void;
    onSelectSlot: (slot: TimeBlockSlot) => void;
};

export function ScheduleStep({
    service,
    calendarDates,
    availableDates,
    holidays,
    scheduledDaysOfWeek,
    veterinarianBlocks,
    selectedDate,
    blockRows,
    doctors,
    selectedSlotId,
    onSelectDate,
    onSelectSlot,
}: ScheduleStepProps) {
    return (
        <div className="space-y-4 border-t border-gray-100 pt-4">
            <DayPicker
                dates={calendarDates}
                availableDates={availableDates}
                holidays={holidays}
                scheduledDaysOfWeek={scheduledDaysOfWeek}
                veterinarianBlocks={veterinarianBlocks}
                selectedDate={selectedDate}
                onSelect={onSelectDate}
            />

            {selectedDate && (
                <BlockSchedulePicker
                    service={service}
                    rows={blockRows}
                    doctors={doctors}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={onSelectSlot}
                />
            )}
        </div>
    );
}
