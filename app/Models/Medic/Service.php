<?php

namespace App\Models\Medic;

use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'specialty_id',
    'name',
    'description',
    'price',
    'duration_minutes',
    'is_active',
    'use_web',
])]
class Service extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_services';

    public const SORTABLE_COLUMNS = [
        'name',
        'price',
        'duration_minutes',
        'is_active',
        'use_web',
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
     * @return BelongsTo<Specialty, $this>
     */
    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class, 'specialty_id');
    }

    /**
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'service_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterSpecialtyId(Builder $query, ?string $specialtyId): Builder
    {
        if ($specialtyId === null || $specialtyId === '') {
            return $query;
        }

        return $query->where('specialty_id', $specialtyId);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:0',
            'duration_minutes' => 'integer',
            'is_active' => 'boolean',
            'use_web' => 'boolean',
        ];
    }
}
