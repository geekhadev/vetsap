<?php

namespace App\Models\Sale;

use App\Enums\Sale\SiiCafStatus;
use App\Models\Company;
use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id',
    'company_id',
    'sii_tax_document_type_id',
    'sii_document_type_code',
    'folio_from',
    'folio_to',
    'authorized_at',
    'expires_at',
    'status',
    'xml_path',
    'uploaded_at',
])]
class SiiCaf extends Model
{
    use HasUuids;

    protected $table = 'sale_sii_cafs';

    public const SORTABLE_COLUMNS = [
        'folio_from',
        'folio_to',
        'authorized_at',
        'expires_at',
        'uploaded_at',
        'status',
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
     * @return BelongsTo<SiiTaxDocumentType, $this>
     */
    public function siiTaxDocumentType(): BelongsTo
    {
        return $this->belongsTo(SiiTaxDocumentType::class, 'sii_tax_document_type_id');
    }

    /**
     * @return HasMany<SiiCafFolio, $this>
     */
    public function folios(): HasMany
    {
        return $this->hasMany(SiiCafFolio::class, 'sale_sii_caf_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompany(Builder $query, string $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterDocumentType(Builder $query, ?string $siiTaxDocumentTypeId): Builder
    {
        if ($siiTaxDocumentTypeId === null || $siiTaxDocumentTypeId === '') {
            return $query;
        }

        return $query->where('sii_tax_document_type_id', $siiTaxDocumentTypeId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrderByColumn(Builder $query, string $column, string $direction): Builder
    {
        return $query->orderBy($column, $direction);
    }

    public function resolveRouteBinding($value, $field = null): static
    {
        $field ??= $this->getRouteKeyName();

        $companyId = data_get(request()->session()->get('company_selected'), 'id');
        if (! is_string($companyId) || $companyId === '') {
            abort(404);
        }

        /** @var static */
        return static::query()
            ->where('company_id', $companyId)
            ->where($field, $value)
            ->firstOrFail();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'folio_from' => 'integer',
            'folio_to' => 'integer',
            'authorized_at' => 'date',
            'expires_at' => 'date',
            'uploaded_at' => 'datetime',
            'status' => SiiCafStatus::class,
        ];
    }
}
