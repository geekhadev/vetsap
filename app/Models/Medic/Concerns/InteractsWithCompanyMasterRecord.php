<?php

namespace App\Models\Medic\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait InteractsWithCompanyMasterRecord
{
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
    public function scopeFilterIsActive(Builder $query, ?string $isActive): Builder
    {
        if ($isActive === null || $isActive === '') {
            return $query;
        }

        return $query->where('is_active', $isActive === '1');
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

        return $query->where('name', 'like', $term);
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
}
