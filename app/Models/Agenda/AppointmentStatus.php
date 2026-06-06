<?php

namespace App\Models\Agenda;

use App\Enums\Agenda\AppointmentStatusColor;
use App\Models\Agenda\Concerns\InteractsWithCompanyOrGlobalMasterRecord;
use App\Models\Company;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'color',
    'is_global',
    'blocks_schedule',
    'is_terminal',
    'is_active',
])]
class AppointmentStatus extends Model
{
    use HasUuids;
    use InteractsWithCompanyOrGlobalMasterRecord;

    protected $table = 'agenda_appointment_statuses';

    public const SORTABLE_COLUMNS = [
        'name',
        'color',
        'is_active',
        'created_at',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'appointment_status_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'color' => AppointmentStatusColor::class,
            'is_global' => 'boolean',
            'blocks_schedule' => 'boolean',
            'is_terminal' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
