<?php

namespace App\Models\Shared;

use Database\Factories\Shared\SiiTaxDocumentTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'code',
    'name',
    'abbreviation',
    'use_sale',
    'use_purchase',
    'is_global',
])]
class SiiTaxDocumentType extends Model
{
    protected $table = 'shared_sii_tax_document_types';

    /** @use HasFactory<SiiTaxDocumentTypeFactory> */
    use HasFactory, HasUuids;

    public const SORTABLE_COLUMNS = [
        'code',
        'name',
        'abbreviation',
        'use_sale',
        'use_purchase',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'use_sale' => 'boolean',
            'use_purchase' => 'boolean',
            'is_global' => 'boolean',
        ];
    }

    public function isGlobal(): bool
    {
        return (bool) $this->is_global;
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearchFields(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->where('code', 'like', $term)
                ->orWhere('name', 'like', $term)
                ->orWhere('abbreviation', 'like', $term);
        });
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrderByColumn(Builder $query, string $column, string $direction): Builder
    {
        return $query->orderBy($column, $direction);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterUseSale(Builder $query, ?bool $value): Builder
    {
        if ($value === null) {
            return $query;
        }

        return $query->where('use_sale', $value);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterUsePurchase(Builder $query, ?bool $value): Builder
    {
        if ($value === null) {
            return $query;
        }

        return $query->where('use_purchase', $value);
    }

    protected static function newFactory(): SiiTaxDocumentTypeFactory
    {
        return SiiTaxDocumentTypeFactory::new();
    }
}
