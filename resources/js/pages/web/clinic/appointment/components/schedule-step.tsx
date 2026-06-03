import type { AppointmentService, BlockScheduleRow, TimeBlockSlot } from '../types';
import { BlockSchedulePicker } from './block-schedule-picker';
import { DayPicker } from './day-picker';

type ScheduleStepProps = {
    service: AppointmentService;
    availableDates: string[];
    selectedDate: string | null;
    blockRows: BlockScheduleRow[];
    selectedSlotId: string | null;
    onSelectDate: (date: string) => void;
    onSelectSlot: (slot: TimeBlockSlot) => void;
};

export function ScheduleStep({
    service,
    availableDates,
    selectedDate,
    blockRows,
    selectedSlotId,
    onSelectDate,
    onSelectSlot,
}: ScheduleStepProps) {
    return (
        <div className="space-y-4 border-t border-gray-100 pt-4">
            <DayPicker dates={availableDates} selectedDate={selectedDate} onSelect={onSelectDate} />

            {selectedDate && (
                <BlockSchedulePicker
                    service={service}
                    rows={blockRows}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={onSelectSlot}
                />
            )}
        </div>
    );
}
