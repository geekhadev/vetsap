<?php

namespace App\Models\Store;

use App\Enums\Store\InventoryMovementType;
use App\Models\Company;
use App\Models\Store\Concerns\InteractsWithStoreMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'type',
    'is_active',
])]
class MovementCategory extends Model
{
    use HasUuids;
    use InteractsWithStoreMasterRecord;

    protected $table = 'store_movement_categories';

    public const SORTABLE_COLUMNS = [
        'name',
        'type',
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
     * @return HasMany<InventoryMovement, $this>
     */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'movement_category_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterType(Builder $query, ?string $type): Builder
    {
        if ($type === null || $type === '') {
            return $query;
        }

        return $query->where('type', $type);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => InventoryMovementType::class,
            'is_active' => 'boolean',
        ];
    }
}
