<?php

namespace App\Models\Shared;

use Database\Factories\Shared\SiiEconomicActivityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'code',
    'description',
    'use_iva',
    'tax_category',
    'use_internet',
])]
class SiiEconomicActivity extends Model
{
    protected $table = 'shared_sii_economic_activities';

    /** @use HasFactory<SiiEconomicActivityFactory> */
    use HasFactory;

    public const SORTABLE_COLUMNS = [
        'code',
        'description',
        'use_iva',
        'tax_category',
        'use_internet',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'use_iva' => 'boolean',
            'use_internet' => 'boolean',
        ];
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
                ->orWhere('description', 'like', $term)
                ->orWhere('tax_category', 'like', $term);
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

    protected static function newFactory(): SiiEconomicActivityFactory
    {
        return SiiEconomicActivityFactory::new();
    }
}
