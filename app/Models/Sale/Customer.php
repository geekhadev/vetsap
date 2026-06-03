<?php

namespace App\Models\Sale;

use App\Enums\Sale\CustomerDocumentType;
use App\Models\Company;
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
class Customer extends Model
{
    use HasUuids;

    protected $table = 'sale_customers';

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
    public function scopeForCompany(Builder $query, string $companyId): Builder
    {
        return $query->where('company_id', $companyId);
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
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrderByColumn(Builder $query, string $column, string $direction): Builder
    {
        return $query->orderBy($column, $direction);
    }

    public function resolveRouteBinding($value, $field = null): static
    {
        $field ??= $this->getRouteKeyName();

        $companyId = data_get(request()->session()->get('company_selected'), 'id');
        if (! is_string($companyId) || $companyId === '') {
            abort(404);
        }

        /** @var static */
        return static::query()
            ->where('company_id', $companyId)
            ->where($field, $value)
            ->firstOrFail();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_type' => CustomerDocumentType::class,
        ];
    }
}
