<?php

namespace App\Models\Medic;

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
    'species_id',
    'name',
    'description',
    'version',
    'is_active',
])]
class VaccinationProtocol extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_vaccination_protocols';

    public const SORTABLE_COLUMNS = [
        'name',
        'version',
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
     * @return BelongsTo<Species, $this>
     */
    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class, 'species_id');
    }

    /**
     * @return HasMany<VaccinationProtocolItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(VaccinationProtocolItem::class, 'protocol_id')->orderBy('sort_order');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterSpecies(Builder $query, ?string $speciesId): Builder
    {
        if ($speciesId === null || $speciesId === '') {
            return $query;
        }

        return $query->where('species_id', $speciesId);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
