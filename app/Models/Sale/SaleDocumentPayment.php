<?php

namespace App\Models\Sale;

use App\Models\Shared\PaymentMethod;
use App\Models\User;
use Database\Factories\Sale\SaleDocumentPaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sale_document_id',
    'cash_register_id',
    'payment_method_id',
    'amount',
    'paid_at',
    'created_by_user_id',
    'notes',
])]
class SaleDocumentPayment extends Model
{
    /** @use HasFactory<SaleDocumentPaymentFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'sale_document_payments';

    public const SORTABLE_COLUMNS = [
        'paid_at',
        'amount',
        'created_at',
    ];

    /**
     * @return BelongsTo<SaleDocument, $this>
     */
    public function saleDocument(): BelongsTo
    {
        return $this->belongsTo(SaleDocument::class, 'sale_document_id');
    }

    /**
     * @return BelongsTo<CashRegister, $this>
     */
    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    /**
     * @return BelongsTo<PaymentMethod, $this>
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompany(Builder $query, string $companyId): Builder
    {
        return $query->whereHas('saleDocument', function (Builder $documentQuery) use ($companyId): void {
            $documentQuery->where('company_id', $companyId);
        });
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
            $inner->whereHas('saleDocument', function (Builder $documentQuery) use ($term): void {
                $documentQuery->where('document_number', 'like', $term)
                    ->orWhere('customer_name', 'like', $term)
                    ->orWhere('customer_document_number', 'like', $term);
            })->orWhereHas('paymentMethod', function (Builder $methodQuery) use ($term): void {
                $methodQuery->where('name', 'like', $term)
                    ->orWhere('code', 'like', $term);
            })->orWhereHas('createdBy', function (Builder $userQuery) use ($term): void {
                $userQuery->where('name', 'like', $term);
            });
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
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    protected static function newFactory(): SaleDocumentPaymentFactory
    {
        return SaleDocumentPaymentFactory::new();
    }
}
