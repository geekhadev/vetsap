<?php

namespace App\Models\Agenda;

use App\Enums\Agenda\AppointmentSource;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'appointment_id',
    'from_appointment_status_id',
    'to_appointment_status_id',
    'changed_by_user_id',
    'source',
    'notes',
    'metadata',
    'occurred_at',
])]
class AppointmentStatusLog extends Model
{
    use HasUuids;

    protected $table = 'agenda_appointment_status_logs';

    /**
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * @return BelongsTo<AppointmentStatus, $this>
     */
    public function fromAppointmentStatus(): BelongsTo
    {
        return $this->belongsTo(AppointmentStatus::class, 'from_appointment_status_id');
    }

    /**
     * @return BelongsTo<AppointmentStatus, $this>
     */
    public function toAppointmentStatus(): BelongsTo
    {
        return $this->belongsTo(AppointmentStatus::class, 'to_appointment_status_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source' => AppointmentSource::class,
            'metadata' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
