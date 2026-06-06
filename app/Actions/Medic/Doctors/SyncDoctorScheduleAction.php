<?php

namespace App\Actions\Medic\Doctors;

use App\Enums\Medic\DoctorScheduleDayOfWeek;
use App\Models\Medic\Doctor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SyncDoctorScheduleAction
{
    /**
     * @param  list<array{day_of_week: int, starts_at: string, ends_at: string}>  $blocks
     */
    public function execute(Doctor $doctor, array $blocks): void
    {
        $this->assertNoOverlappingBlocks($blocks);

        DB::transaction(function () use ($doctor, $blocks): void {
            $doctor->scheduleBlocks()->delete();

            $sortByDay = [];

            foreach ($blocks as $block) {
                $day = $block['day_of_week'];
                $sortOrder = $sortByDay[$day] ?? 0;

                $doctor->scheduleBlocks()->create([
                    'day_of_week' => $block['day_of_week'],
                    'starts_at' => $block['starts_at'],
                    'ends_at' => $block['ends_at'],
                    'sort_order' => $sortOrder,
                ]);

                $sortByDay[$day] = $sortOrder + 1;
            }
        });
    }

    /**
     * @param  list<array{day_of_week: int, starts_at: string, ends_at: string}>  $blocks
     */
    private function assertNoOverlappingBlocks(array $blocks): void
    {
        $byDay = [];

        foreach ($blocks as $index => $block) {
            $day = $block['day_of_week'];
            $start = strtotime($block['starts_at']);
            $end = strtotime($block['ends_at']);

            if ($start === false || $end === false || $end <= $start) {
                throw ValidationException::withMessages([
                    "blocks.{$index}.ends_at" => 'La hora de término debe ser posterior a la de inicio.',
                ]);
            }

            foreach ($byDay[$day] ?? [] as $existingIndex => $existing) {
                if ($start < $existing['end'] && $end > $existing['start']) {
                    $dayLabel = $this->dayLabel($day);

                    throw ValidationException::withMessages([
                        "blocks.{$index}.starts_at" => "Los horarios de {$dayLabel} no pueden superponerse.",
                        "blocks.{$existingIndex}.starts_at" => "Los horarios de {$dayLabel} no pueden superponerse.",
                    ]);
                }
            }

            $byDay[$day][$index] = [
                'start' => $start,
                'end' => $end,
            ];
        }
    }

    private function dayLabel(int $day): string
    {
        $enum = DoctorScheduleDayOfWeek::tryFrom($day);

        return match ($enum) {
            DoctorScheduleDayOfWeek::Monday => 'lunes',
            DoctorScheduleDayOfWeek::Tuesday => 'martes',
            DoctorScheduleDayOfWeek::Wednesday => 'miércoles',
            DoctorScheduleDayOfWeek::Thursday => 'jueves',
            DoctorScheduleDayOfWeek::Friday => 'viernes',
            DoctorScheduleDayOfWeek::Saturday => 'sábado',
            DoctorScheduleDayOfWeek::Sunday => 'domingo',
            default => 'ese día',
        };
    }
}
