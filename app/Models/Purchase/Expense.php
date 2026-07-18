<?php

namespace App\Models\Purchase;

use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'spent_at',
    'expense_type_id',
    'amount',
    'reason',
])]
class Expense extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'purchase_expenses';

    public const SORTABLE_COLUMNS = [
        'spent_at',
        'amount',
        'reason',
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
     * @return BelongsTo<ExpenseType, $this>
     */
    public function expenseType(): BelongsTo
    {
        return $this->belongsTo(ExpenseType::class, 'expense_type_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterExpenseTypeId(Builder $query, ?string $expenseTypeId): Builder
    {
        if ($expenseTypeId === null || $expenseTypeId === '') {
            return $query;
        }

        return $query->where('expense_type_id', $expenseTypeId);
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
            $inner->where('reason', 'like', $term)
                ->orWhereHas('expenseType', function (Builder $typeQuery) use ($term): void {
                    $typeQuery->where('name', 'like', $term)
                        ->orWhere('abbreviation', 'like', $term);
                });
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'spent_at' => 'date:Y-m-d',
            'amount' => 'decimal:0',
        ];
    }
}
