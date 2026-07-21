<?php

namespace App\Models\Medic;

use App\Enums\Sale\TaxTreatment;
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
    'tax_treatment',
    'duration_minutes',
    'is_active',
    'use_web',
    'is_default',
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
     * Garantiza un solo servicio por defecto por empresa.
     */
    public static function clearOtherDefaults(string $companyId, ?string $exceptServiceId = null): void
    {
        static::query()
            ->forCompany($companyId)
            ->where('is_default', true)
            ->when(
                $exceptServiceId !== null,
                fn (Builder $query) => $query->where('id', '!=', $exceptServiceId),
            )
            ->update(['is_default' => false]);
    }

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
            'tax_treatment' => TaxTreatment::class,
            'duration_minutes' => 'integer',
            'is_active' => 'boolean',
            'use_web' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Service $service): void {
            $service->tax_treatment = TaxTreatment::Exempt;
        });
    }
}
