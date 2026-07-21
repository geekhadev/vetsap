<?php

namespace App\Models\Sale;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiTaxDocumentType;
use App\Models\User;
use Database\Factories\Sale\SaleDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'office_id',
    'customer_id',
    'clinical_attention_id',
    'cash_register_id',
    'sii_tax_document_type_id',
    'payment_type_id',
    'merged_into_sale_document_id',
    'status',
    'document_number',
    'issued_at',
    'customer_name',
    'customer_document_type',
    'customer_document_number',
    'customer_phone',
    'customer_email',
    'customer_address',
    'tax_percent',
    'tax_amount',
    'details_discount_percent',
    'details_discount_amount',
    'details_discount_net_amount',
    'details_discount_exempt_amount',
    'global_discount_percent',
    'global_discount_amount',
    'global_discount_net_amount',
    'global_discount_exempt_amount',
    'gross_net_amount',
    'gross_exempt_amount',
    'net_amount',
    'exempt_amount',
    'total_amount',
    'paid_amount',
    'notes',
    'created_by_user_id',
    'updated_by_user_id',
])]
class SaleDocument extends Model
{
    /** @use HasFactory<SaleDocumentFactory> */
    use HasFactory;

    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'sale_documents';

    public const SORTABLE_COLUMNS = [
        'issued_at',
        'total_amount',
        'status',
        'created_at',
        'document_number',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<CompanyOffice, $this>
     */
    public function office(): BelongsTo
    {
        return $this->belongsTo(CompanyOffice::class, 'office_id');
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * @return BelongsTo<ClinicalAttention, $this>
     */
    public function clinicalAttention(): BelongsTo
    {
        return $this->belongsTo(ClinicalAttention::class, 'clinical_attention_id');
    }

    /**
     * @return BelongsTo<CashRegister, $this>
     */
    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    /**
     * @return BelongsTo<SiiTaxDocumentType, $this>
     */
    public function siiTaxDocumentType(): BelongsTo
    {
        return $this->belongsTo(SiiTaxDocumentType::class, 'sii_tax_document_type_id');
    }

    /**
     * @return BelongsTo<PaymentType, $this>
     */
    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class, 'payment_type_id');
    }

    /**
     * @return BelongsTo<SaleDocument, $this>
     */
    public function mergedInto(): BelongsTo
    {
        return $this->belongsTo(SaleDocument::class, 'merged_into_sale_document_id');
    }

    /**
     * @return HasMany<SaleDocumentDetail, $this>
     */
    public function details(): HasMany
    {
        return $this->hasMany(SaleDocumentDetail::class, 'sale_document_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<SaleDocumentPayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(SaleDocumentPayment::class, 'sale_document_id');
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
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', SaleDocumentStatus::Draft);
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
            $inner->where('document_number', 'like', $term)
                ->orWhere('customer_name', 'like', $term)
                ->orWhere('customer_document_number', 'like', $term);
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

    public function isDraft(): bool
    {
        return $this->status === SaleDocumentStatus::Draft;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SaleDocumentStatus::class,
            'issued_at' => 'datetime',
            'tax_percent' => 'decimal:2',
            'tax_amount' => 'integer',
            'details_discount_percent' => 'decimal:2',
            'details_discount_amount' => 'integer',
            'details_discount_net_amount' => 'integer',
            'details_discount_exempt_amount' => 'integer',
            'global_discount_percent' => 'decimal:2',
            'global_discount_amount' => 'integer',
            'global_discount_net_amount' => 'integer',
            'global_discount_exempt_amount' => 'integer',
            'gross_net_amount' => 'integer',
            'gross_exempt_amount' => 'integer',
            'net_amount' => 'integer',
            'exempt_amount' => 'integer',
            'total_amount' => 'integer',
            'paid_amount' => 'integer',
        ];
    }

    protected static function newFactory(): SaleDocumentFactory
    {
        return SaleDocumentFactory::new();
    }
}
