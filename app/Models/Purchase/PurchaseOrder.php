<?php

namespace App\Models\Purchase;

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
    'ordered_at',
    'supplier_id',
    'purchase_order_status_id',
    'total',
])]
class PurchaseOrder extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'purchase_orders';

    public const SORTABLE_COLUMNS = [
        'ordered_at',
        'total',
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
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * @return BelongsTo<PurchaseOrderStatus, $this>
     */
    public function purchaseOrderStatus(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderStatus::class, 'purchase_order_status_id');
    }

    /**
     * @return HasMany<PurchaseOrderDetail, $this>
     */
    public function details(): HasMany
    {
        return $this->hasMany(PurchaseOrderDetail::class, 'purchase_order_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterSupplierId(Builder $query, ?string $supplierId): Builder
    {
        if ($supplierId === null || $supplierId === '') {
            return $query;
        }

        return $query->where('supplier_id', $supplierId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterPurchaseOrderStatusId(Builder $query, ?string $statusId): Builder
    {
        if ($statusId === null || $statusId === '') {
            return $query;
        }

        return $query->where('purchase_order_status_id', $statusId);
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

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->whereHas('supplier', function (Builder $supplierQuery) use ($term): void {
                $supplierQuery->where('name', 'like', $term)
                    ->orWhere('document_number', 'like', $term);
            })->orWhereHas('purchaseOrderStatus', function (Builder $statusQuery) use ($term): void {
                $statusQuery->where('name', 'like', $term);
            });
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ordered_at' => 'date:Y-m-d',
            'total' => 'decimal:0',
        ];
    }
}
