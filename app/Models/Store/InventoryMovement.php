<?php

namespace App\Models\Store;

use App\Enums\Store\InventoryMovementType;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'type',
    'number',
    'moved_at',
    'movement_category_id',
    'user_id',
])]
class InventoryMovement extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'store_inventory_movements';

    public const SORTABLE_COLUMNS = [
        'number',
        'moved_at',
        'type',
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
     * @return BelongsTo<MovementCategory, $this>
     */
    public function movementCategory(): BelongsTo
    {
        return $this->belongsTo(MovementCategory::class, 'movement_category_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<InventoryMovementDetail, $this>
     */
    public function details(): HasMany
    {
        return $this->hasMany(InventoryMovementDetail::class, 'inventory_movement_id');
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
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterMovementCategoryId(Builder $query, ?string $categoryId): Builder
    {
        if ($categoryId === null || $categoryId === '') {
            return $query;
        }

        return $query->where('movement_category_id', $categoryId);
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

        return $query->where(function (Builder $inner) use ($term, $search): void {
            $inner->where('number', 'like', $term);

            if (ctype_digit($search)) {
                $inner->orWhere('number', (int) $search);
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => InventoryMovementType::class,
            'number' => 'integer',
            'moved_at' => 'date',
        ];
    }
}
