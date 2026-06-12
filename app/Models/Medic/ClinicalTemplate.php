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
    'is_default',
    'is_active',
])]
class ClinicalTemplate extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_clinical_templates';

    public const SORTABLE_COLUMNS = [
        'name',
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
     * @return HasMany<ClinicalTemplateField, $this>
     */
    public function fields(): HasMany
    {
        return $this->hasMany(ClinicalTemplateField::class, 'template_id')->orderBy('field_order');
    }

    /**
     * @return HasMany<ClinicalAttention, $this>
     */
    public function attentions(): HasMany
    {
        return $this->hasMany(ClinicalAttention::class, 'template_id');
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
     * Garantiza una sola plantilla por defecto por empresa.
     */
    public static function clearOtherDefaults(string $companyId, ?string $exceptTemplateId = null): void
    {
        static::query()
            ->forCompany($companyId)
            ->where('is_default', true)
            ->when(
                $exceptTemplateId !== null,
                fn (Builder $query) => $query->where('id', '!=', $exceptTemplateId),
            )
            ->update(['is_default' => false]);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where('name', 'like', $term);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
