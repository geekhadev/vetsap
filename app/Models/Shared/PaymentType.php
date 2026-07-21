<?php

namespace App\Models\Shared;

use Database\Factories\Shared\PaymentTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'code', 'is_credit'])]
class PaymentType extends Model
{
    protected $table = 'shared_payment_types';

    /** @use HasFactory<PaymentTypeFactory> */
    use HasFactory, HasUuids;

    public const SORTABLE_COLUMNS = [
        'name',
        'code',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_credit' => 'boolean',
        ];
    }

    public function isCredit(): bool
    {
        return (bool) $this->is_credit;
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearchNameOrCode(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->where('name', 'like', $term)
                ->orWhere('code', 'like', $term);
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

    protected static function newFactory(): PaymentTypeFactory
    {
        return PaymentTypeFactory::new();
    }
}
