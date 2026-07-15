<?php

namespace App\Models\Medic;

use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyOrGlobalMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'is_global',
    'is_active',
])]
class Species extends Model
{
    use HasUuids;
    use InteractsWithCompanyOrGlobalMasterRecord;

    protected $table = 'medic_species';

    public const SORTABLE_COLUMNS = [
        'name',
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
     * @return HasMany<Patient, $this>
     */
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'species_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_global' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
