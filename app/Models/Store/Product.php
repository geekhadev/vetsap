<?php

namespace App\Models\Store;

use App\Enums\Sale\TaxTreatment;
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
    'product_category_id',
    'name',
    'barcode',
    'description',
    'price',
    'tax_treatment',
    'is_active',
])]
class Product extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'store_products';

    public const SORTABLE_COLUMNS = [
        'name',
        'barcode',
        'price',
        'stock',
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
     * @return BelongsTo<ProductCategory, $this>
     */
    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /**
     * @return HasMany<InventoryMovementDetail, $this>
     */
    public function inventoryMovementDetails(): HasMany
    {
        return $this->hasMany(InventoryMovementDetail::class, 'product_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterProductCategoryId(Builder $query, ?string $categoryId): Builder
    {
        if ($categoryId === null || $categoryId === '') {
            return $query;
        }

        return $query->where('product_category_id', $categoryId);
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

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], mb_strtolower($search)).'%';

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->whereRaw('LOWER(name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(barcode) LIKE ?', [$term]);
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:0',
            'tax_treatment' => TaxTreatment::class,
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
