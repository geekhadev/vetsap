<?php

namespace App\Models\Medic;

use App\Enums\Medic\DoctorScheduleDayOfWeek;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'doctor_id',
    'day_of_week',
    'starts_at',
    'ends_at',
    'sort_order',
])]
class DoctorScheduleBlock extends Model
{
    use HasUuids;

    protected $table = 'medic_doctor_schedule_blocks';

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => DoctorScheduleDayOfWeek::class,
            'sort_order' => 'integer',
        ];
    }
}
