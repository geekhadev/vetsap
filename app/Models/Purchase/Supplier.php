<?php

namespace App\Models\Purchase;

use App\Enums\Purchase\SupplierDocumentType;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'name',
    'document_type',
    'document_number',
    'email',
    'phone',
    'address',
])]
class Supplier extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'purchase_suppliers';

    public const SORTABLE_COLUMNS = [
        'name',
        'document_type',
        'document_number',
        'email',
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
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterDocumentType(Builder $query, ?string $documentType): Builder
    {
        if ($documentType === null || $documentType === '') {
            return $query;
        }

        return $query->where('document_type', $documentType);
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
            $inner->where('name', 'like', $term)
                ->orWhere('document_number', 'like', $term)
                ->orWhere('email', 'like', $term);
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_type' => SupplierDocumentType::class,
        ];
    }
}
